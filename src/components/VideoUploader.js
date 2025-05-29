import React, { useState, useCallback } from "react";

const VideoUploader = ({ onVideoSelect, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (file) => {
    // Check if it's a video file
    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file (MP4 or WebM)");
      return false;
    }

    // Check supported formats
    const supportedFormats = ["video/mp4", "video/webm"];
    if (!supportedFormats.includes(file.type)) {
      setError("Only MP4 and WebM formats are supported");
      return false;
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      setError("File size must be less than 100MB");
      return false;
    }

    setError("");
    return true;
  };

  const handleFile = (file) => {
    if (validateFile(file)) {
      onVideoSelect(file);
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full p-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-400"}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
          accept="video/mp4,video/webm"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="48" height="48"><rect width="256" height="256" fill="none"/><polyline points="148 32 148 92 208 92" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><path d="M180,224h20a8,8,0,0,0,8-8V88L152,32H56a8,8,0,0,0-8,8v84" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><path d="M65.66,168H60a28,28,0,0,0,0,56h48a44,44,0,1,0-43.82-48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/></svg>
          
          <h3 className="text-lg font-medium text-gray-900">
            Drop your video here
          </h3>
          
          <p className="text-sm text-gray-500">
            or click to select a file
          </p>
          
          <p className="text-xs text-gray-400">
            Supports MP4 and WebM formats (max 100MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center text-sm text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="16" height="16"><rect width="256" height="256" fill="none"/><path d="M142.41,40.22l87.46,151.87C236,202.79,228.08,216,215.46,216H40.54C27.92,216,20,202.79,26.13,192.09L113.59,40.22C119.89,29.26,136.11,29.26,142.41,40.22Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><line x1="128" y1="136" x2="128" y2="104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><circle cx="128" cy="176" r="16"/></svg>
          <span className="ml-1">{error}</span>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;