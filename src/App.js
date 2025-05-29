import React, { useState, useCallback, useEffect } from "react";
import VideoUploader from "./components/VideoUploader";
import VideoPlayer from "./components/VideoPlayer";
import TimeRangeSelector from "./components/TimeRangeSelector";
import GifPreview from "./components/GifPreview";
import ffmpegUtils from "./utils/ffmpegUtils";

const App = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [timeRange, setTimeRange] = useState({ startTime: 0, endTime: 0 });
  const [isConverting, setIsConverting] = useState(false);
  const [gifUrl, setGifUrl] = useState(null);
  const [error, setError] = useState("");
  const [conversionProgress, setConversionProgress] = useState(0);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true); // New state for browser support

  // Check browser compatibility on component mount
  useEffect(() => {
    const supported = ffmpegUtils.checkBrowserSupport();
    setIsBrowserSupported(supported);
    if (!supported) {
      setError("Your browser does not fully support the features required for this application (e.g., SharedArrayBuffer, WebAssembly, or Cross-Origin Isolation). Please try a modern browser like Chrome or Firefox with Cross-Origin Isolation enabled.");
    }
  }, []);


  // Handle video file selection
  const handleVideoSelect = useCallback((file) => {
    if (!isBrowserSupported) {
        setError("Cannot process video: Browser not fully supported. Please check the compatibility message above.");
        return;
    }
    setVideoFile(file);
    setGifUrl(null);
    setError(""); // Clear previous errors
    setTimeRange({ startTime: 0, endTime: 0 });
    
    const videoElement = document.createElement("video");
    videoElement.src = URL.createObjectURL(file);
    
    videoElement.onloadedmetadata = () => {
      const duration = videoElement.duration;
      setVideoDuration(duration);
      // Set initial time range: 0 to min(10 seconds, video duration)
      setTimeRange({ startTime: 0, endTime: Math.min(10, duration) }); 
      URL.revokeObjectURL(videoElement.src);
    };
    videoElement.onerror = () => {
        setError("Failed to load video metadata. The file might be corrupted or in an unsupported format.");
        URL.revokeObjectURL(videoElement.src);
    }
  }, [isBrowserSupported]);

  // Handle time range selection
  const handleTimeRangeChange = useCallback((range) => {
    setTimeRange(range);
  }, []);

  // Handle video time update
  const handleTimeUpdate = useCallback((time) => {
    setCurrentTime(time);
  }, []);

  // Convert video to GIF
  const handleConvert = async () => {
    if (!isBrowserSupported) {
      setError("Cannot convert: Browser not fully supported. Please check the compatibility message above.");
      return;
    }
    if (!videoFile) {
      setError("Please select a video first.");
      return;
    }
    if (timeRange.endTime <= timeRange.startTime) {
      setError("End time must be after start time for GIF conversion.");
      return;
    }

    setIsConverting(true);
    setError(""); // Clear previous errors
    setGifUrl(null);
    setConversionProgress(0);

    try {
      // Convert video to GIF
      const gifBlob = await ffmpegUtils.convertToGif(
        videoFile,
        timeRange.startTime,
        timeRange.endTime,
        480, // width
        10,  // fps
        75,  // quality
        (progress) => setConversionProgress(progress) // Pass progress callback
      );

      // Create URL for the generated GIF
      const url = URL.createObjectURL(gifBlob);
      setGifUrl(url);
    } catch (err) {
      console.error("Conversion error:", err);
      setError(err.message || "Failed to convert video to GIF. Check console for details.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Video to GIF Converter
          </h1>
          <p className="text-gray-600">
            Convert your video clips to GIFs right in your browser
          </p>
        </div>

        {/* Global Error/Compatibility Message Area */}
        {!isBrowserSupported && error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <h3 className="font-bold">Compatibility Issue:</h3>
            <p>{error}</p>
          </div>
        )}


        {/* Main content */}
        <div className="space-y-6">
          {/* Video upload section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <VideoUploader
              onVideoSelect={handleVideoSelect}
              disabled={isConverting || !isBrowserSupported}
            />
          </div>

          {/* Video player and controls */}
          {videoFile && isBrowserSupported && (
            <div className="space-y-6">
              <VideoPlayer
                videoFile={videoFile}
                currentTime={currentTime}
                onTimeUpdate={handleTimeUpdate}
                disabled={isConverting}
              />

              <TimeRangeSelector
                videoDuration={videoDuration}
                onTimeRangeChange={handleTimeRangeChange}
                disabled={isConverting}
                // Pass current time to potentially sync sliders/inputs
                // currentTime={currentTime} 
              />

              {/* Convert button */}
              <div className="flex justify-center">
                <button
                  onClick={handleConvert}
                  disabled={isConverting || !videoFile || !isBrowserSupported || (timeRange.endTime <= timeRange.startTime)}
                  className={`
                    flex items-center px-6 py-3 rounded-md text-white
                    ${isConverting || !videoFile || !isBrowserSupported || (timeRange.endTime <= timeRange.startTime)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"}
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                  `}
                >
                  {isConverting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Converting... {conversionProgress > 0 && conversionProgress < 100 ? `${conversionProgress}%` : ""}
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20"><rect width="256" height="256" fill="none"/><line x1="216" y1="128" x2="216" y2="176" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><line x1="192" y1="152" x2="240" y2="152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><line x1="80" y1="40" x2="80" y2="88" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><line x1="56" y1="64" x2="104" y2="64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><line x1="168" y1="184" x2="168" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><line x1="152" y1="200" x2="184" y2="200" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><line x1="144" y1="80" x2="176" y2="112" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><rect x="21.49" y="105.37" width="213.02" height="45.25" rx="8" transform="translate(-53.02 128) rotate(-45)" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/></svg>
                      <span className="ml-2">Convert to GIF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* GIF preview or specific error messages related to conversion */}
          { (gifUrl || isConverting || (error && isBrowserSupported)) && (
            <GifPreview
              gifUrl={gifUrl}
              isLoading={isConverting}
              errorMessage={error && isBrowserSupported ? error : null} // Only show conversion errors here
            />
          )}
           {!videoFile && isBrowserSupported && !error && (
             <div className="mt-6 p-6 bg-white rounded-lg shadow-md text-center text-gray-500">
                <p>Upload a video to get started!</p>
            </div>
           )}

        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Powered by ffmpeg.wasm - All processing happens in your browser.
          </p>
           {!isBrowserSupported && (
            <p className="text-red-500 mt-1">
              Some features may be limited due to browser compatibility.
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default App;
