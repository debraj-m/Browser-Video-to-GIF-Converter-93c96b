import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

/**
 * FFmpeg utility class for handling video processing in the browser
 */
class FFmpegUtils {
  constructor() {
    this.ffmpeg = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.progressCallback = null;
  }

  /**
   * Initialize and load FFmpeg WASM
   * @param {Function} [progressCallback=null] - Callback for FFmpeg command progress.
   * @returns {Promise<void>} A promise that resolves when FFmpeg is loaded
   */
  async load(progressCallback = null) {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.isLoading) {
      // Wait until loading completes
      return new Promise((resolve) => {
        const checkLoaded = setInterval(() => {
          if (this.isLoaded) {
            clearInterval(checkLoaded);
            resolve();
          }
        }, 100);
      });
    }

    this.isLoading = true;
    this.progressCallback = progressCallback;

    try {
      // Create FFmpeg instance with logging and progress tracking
      this.ffmpeg = createFFmpeg({
        log: true,
        progress: (progress) => {
          if (this.progressCallback) {
            // Convert to percentage for easier display
            const percent = Math.round(progress.ratio * 100);
            this.progressCallback(percent);
          }
        },
        corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
      });

      // Load FFmpeg WASM binary
      await this.ffmpeg.load();
      this.isLoaded = true;
      this.isLoading = false;
      return Promise.resolve();
    } catch (error) {
      this.isLoading = false;
      console.error("Failed to load FFmpeg:", error);
      return Promise.reject(error);
    }
  }

  /**
   * Convert video segment to GIF
   * @param {File} videoFile - The video file to convert
   * @param {number} startTime - Start time in seconds
   * @param {number} endTime - End time in seconds
   * @param {number} outputWidth - Output GIF width in pixels
   * @param {number} fps - Frames per second for the output GIF
   * @param {number} quality - Quality of the output GIF (1-100)
   * @param {Function} [conversionProgressCallback=null] - Callback for conversion progress.
   * @returns {Promise<Blob>} A promise that resolves with the generated GIF blob
   */
  async convertToGif(
    videoFile,
    startTime = 0,
    endTime = 10,
    outputWidth = 480,
    fps = 10,
    quality = 75,
    conversionProgressCallback = null
  ) {
    // Ensure FFmpeg is loaded
    try {
      // Update the progress callback for this specific conversion operation
      // This ensures that if load() was called previously with a different or no callback,
      // this conversion uses the correct one.
      this.progressCallback = conversionProgressCallback;
      if (!this.isLoaded) {
        // If load() is called, it will use the this.progressCallback we just set.
        await this.load(this.progressCallback);
      }
    } catch (error) {
      return Promise.reject("Failed to load FFmpeg: " + error.message);
    }

    try {
      const inputFileName = "input." + this.getFileExtension(videoFile.name);
      const outputFileName = "output.gif";

      // Write the video file to memory
      this.ffmpeg.FS("writeFile", inputFileName, await fetchFile(videoFile));

      // Calculate duration from start to end time
      const duration = endTime - startTime;
      if (duration <= 0) {
        return Promise.reject("Invalid time range: end time must be greater than start time");
      }

      // Limit quality to a reasonable range
      const normalizedQuality = Math.max(1, Math.min(100, quality));

      // Calculate palettegen settings
      // Lower stats_mode value = more accurate but slower.
      // This calculation was from the original context.
      const statsMode = Math.max(1, Math.round((100 - normalizedQuality) / 20));

      // Palette generation for better quality GIFs
      await this.ffmpeg.run(
        "-ss",
        startTime.toString(),
        "-t",
        duration.toString(),
        "-i",
        inputFileName,
        "-vf",
        `fps=${fps},scale=${outputWidth}:-1:flags=lanczos,palettegen=stats_mode=${statsMode}`,
        "palette.png"
      );

      // Convert the video to GIF using the generated palette
      await this.ffmpeg.run(
        "-ss",
        startTime.toString(),
        "-t",
        duration.toString(),
        "-i",
        inputFileName,
        "-i",
        "palette.png",
        "-lavfi",
        `fps=${fps},scale=${outputWidth}:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5`,
        "-loop",
        "0",
        outputFileName
      );

      // Read the resulting GIF file
      const data = this.ffmpeg.FS("readFile", outputFileName);

      // Clean up files in memory
      this.ffmpeg.FS("unlink", inputFileName);
      this.ffmpeg.FS("unlink", "palette.png");
      this.ffmpeg.FS("unlink", outputFileName);

      // Create a Blob from the data
      return new Blob([data.buffer], { type: "image/gif" });
    } catch (error) {
      console.error("Error during GIF conversion:", error);
      return Promise.reject("Failed to convert video: " + error.message);
    }
  }

  /**
   * Get file extension from filename
   * @param {string} filename - The filename
   * @returns {string} The file extension without the dot
   */
  getFileExtension(filename) {
    return filename.split(".").pop().toLowerCase();
  }

  /**
   * Check if the browser supports requirements for ffmpeg.wasm.
   * Verifies SharedArrayBuffer, WebAssembly, and Cross-Origin Isolation.
   * @returns {boolean} True if all features are supported, false otherwise.
   */
  static checkBrowserSupport() {
    // Check if SharedArrayBuffer is available
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== "undefined";
    
    // Check for WebAssembly support
    const hasWebAssembly = typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function";
    
    // Check if Cross-Origin-Isolation is enabled
    const isCrossOriginIsolated = window.crossOriginIsolated === true;

    return hasSharedArrayBuffer && hasWebAssembly && isCrossOriginIsolated;
  }

  /**
   * Get estimated file size for the resulting GIF based on parameters.
   * This is a rough estimate for display purposes.
   * @param {number} duration - Duration in seconds
   * @param {number} width - Width in pixels
   * @param {number} fps - Frames per second
   * @returns {string} Formatted estimated size (e.g., "1.2 MB", "750.0 KB")
   */
  static estimateGifSize(duration, width, fps) {
    // Very rough estimation based on parameters
    // Average bytes per pixel for GIF
    const bytesPerPixel = 0.5;
    
    // Estimate height based on 16:9 aspect ratio
    const height = Math.round(width / (16/9));
    
    // Calculate total frames
    const frames = duration * fps;
    
    // Calculate total size in bytes
    const totalBytes = frames * width * height * bytesPerPixel;
    
    // Convert to appropriate unit
    if (totalBytes < 1024 * 1024) {
      return (totalBytes / 1024).toFixed(1) + " KB";
    } else {
      return (totalBytes / (1024 * 1024)).toFixed(1) + " MB";
    }
  }
}

// Create and export a singleton instance of the utility class
const ffmpegInstance = new FFmpegUtils();

// Make static methods directly callable on the instance.
// This allows calling code like `instance.checkBrowserSupport()` to work as expected,
// resolving the "_ffmpegUtils.default.checkBrowserSupport is not a function" error
// without needing to change the calling code's import or access pattern (e.g. to FFmpegUtils.checkBrowserSupport()).
ffmpegInstance.checkBrowserSupport = FFmpegUtils.checkBrowserSupport;
ffmpegInstance.estimateGifSize = FFmpegUtils.estimateGifSize;

export default ffmpegInstance;
