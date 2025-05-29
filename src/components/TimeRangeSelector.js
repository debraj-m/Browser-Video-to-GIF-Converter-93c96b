import React, { useState, useEffect } from "react";

const TimeRangeSelector = ({
  videoDuration = 0,
  onTimeRangeChange,
  disabled = false,
}) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(videoDuration);
  
  // Format seconds to "mm:ss" or "mm:ss.SSS" format
  const formatTime = (timeInSeconds, includeMilliseconds = false) => {
    if (isNaN(timeInSeconds)) return "00:00";
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (includeMilliseconds) {
      const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
    }
    
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Parse a time string like "mm:ss" or "mm:ss.SSS" into seconds
  const parseTimeString = (timeString) => {
    if (!timeString) return 0;
    
    const parts = timeString.split(":");
    
    if (parts.length !== 2) return 0;
    
    let minutes = parseInt(parts[0], 10);
    
    // Handle seconds, which might include milliseconds
    let seconds = 0;
    if (parts[1].includes(".")) {
      const secondParts = parts[1].split(".");
      seconds = parseInt(secondParts[0], 10);
      const milliseconds = parseInt(secondParts[1], 10);
      seconds += milliseconds / 1000;
    } else {
      seconds = parseInt(parts[1], 10);
    }
    
    return minutes * 60 + seconds;
  };

  // Update end time when video duration changes
  useEffect(() => {
    if (videoDuration > 0) {
      setEndTime(videoDuration);
    }
  }, [videoDuration]);

  // Notify parent component when times change
  useEffect(() => {
    if (startTime >= 0 && endTime > startTime && endTime <= videoDuration) {
      onTimeRangeChange({ startTime, endTime });
    }
  }, [startTime, endTime, videoDuration, onTimeRangeChange]);

  const handleStartTimeChange = (e) => {
    const newStartTime = parseTimeString(e.target.value);
    
    // Ensure start time doesn't exceed end time
    if (newStartTime < endTime) {
      setStartTime(newStartTime);
    }
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = parseTimeString(e.target.value);
    
    // Ensure end time doesn't go below start time and doesn't exceed duration
    if (newEndTime > startTime && newEndTime <= videoDuration) {
      setEndTime(newEndTime);
    }
  };

  const handleStartSliderChange = (e) => {
    const newStartTime = parseFloat(e.target.value);
    
    // Ensure start time doesn't exceed end time
    if (newStartTime < endTime) {
      setStartTime(newStartTime);
    }
  };

  const handleEndSliderChange = (e) => {
    const newEndTime = parseFloat(e.target.value);
    
    // Ensure end time doesn't go below start time
    if (newEndTime > startTime && newEndTime <= videoDuration) {
      setEndTime(newEndTime);
    }
  };

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Select Time Range for GIF
      </h3>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 mr-4">
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="text"
            id="startTime"
            value={formatTime(startTime, true)}
            onChange={handleStartTimeChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="00:00.000"
            disabled={disabled}
          />
        </div>
        
        <div className="flex-1">
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="text"
            id="endTime"
            value={formatTime(endTime, true)}
            onChange={handleEndTimeChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="00:00.000"
            disabled={disabled}
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="startTimeSlider" className="block text-sm font-medium text-gray-700 mb-1">
          Start Time: {formatTime(startTime)}
        </label>
        <input
          type="range"
          id="startTimeSlider"
          min="0"
          max={videoDuration}
          step="0.01"
          value={startTime}
          onChange={handleStartSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          disabled={disabled || videoDuration <= 0}
        />
      </div>
      
      <div className="mb-2">
        <label htmlFor="endTimeSlider" className="block text-sm font-medium text-gray-700 mb-1">
          End Time: {formatTime(endTime)}
        </label>
        <input
          type="range"
          id="endTimeSlider"
          min="0"
          max={videoDuration}
          step="0.01"
          value={endTime}
          onChange={handleEndSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          disabled={disabled || videoDuration <= 0}
        />
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Selected duration: {formatTime(endTime - startTime)} ({(endTime - startTime).toFixed(2)}s)
      </div>
      
      {videoDuration <= 0 && (
        <div className="mt-2 text-sm text-yellow-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="16" height="16"><rect width="256" height="256" fill="none"/><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/></svg>
          <span className="ml-1">Please load a video first to set time range.</span>
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;