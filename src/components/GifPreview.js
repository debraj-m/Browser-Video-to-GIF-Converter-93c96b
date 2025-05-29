import React, { useRef } from "react";

const GifPreview = ({ gifUrl, isLoading, errorMessage }) => {
  const downloadLinkRef = useRef(null);

  // Trigger download using a hidden link element
  const handleDownload = () => {
    if (!gifUrl) return;
    
    const fileName = "converted-" + new Date().getTime() + ".gif";
    
    // Create a hidden link element and trigger download
    if (downloadLinkRef.current) {
      downloadLinkRef.current.href = gifUrl;
      downloadLinkRef.current.download = fileName;
      downloadLinkRef.current.click();
    }
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center min-h-[200px]">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
        <p className="mt-4 text-gray-600">Converting video to GIF...</p>
      </div>
    );
  }

  // If there's an error, show error message
  if (errorMessage) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center p-4 bg-red-50 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="24" height="24"><rect width="256" height="256" fill="none"/><circle cx="128" cy="200" r="20"/><line x1="128" y1="48" x2="128" y2="148" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/></svg>
          <p className="ml-3 text-red-700">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // If no GIF yet, show placeholder
  if (!gifUrl) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-8">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="48" height="48"><rect width="256" height="256" fill="none"/><rect x="40" y="40" width="176" height="176" rx="8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><line x1="42.34" y1="42.34" x2="213.66" y2="213.66" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/></svg>
          <h3 className="mt-4 text-gray-600">Your GIF will appear here</h3>
          <p className="text-sm text-gray-400 mt-2">Select a video and time range, then click "Convert to GIF"</p>
        </div>
      </div>
    );
  }

  // Show the preview with download button
  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Generated GIF Preview
      </h3>
      
      <div className="mb-4">
        <img 
          src={gifUrl} 
          alt="Generated GIF preview" 
          className="mx-auto max-w-full h-auto rounded-lg shadow-sm"
        />
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="16" height="16"><rect width="256" height="256" fill="none"/><line x1="128" y1="144" x2="128" y2="32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><polyline points="216 144 216 208 40 208 40 144" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/><polyline points="168 104 128 144 88 104" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"/></svg>
          <span className="ml-2">Download GIF</span>
        </button>
        
        {/* Hidden download link */}
        <a 
          ref={downloadLinkRef} 
          href={gifUrl}
          className="hidden"
        >
          Download
        </a>
      </div>
      
      <p className="mt-4 text-xs text-center text-gray-500">
        Right-click on the GIF and select "Save image as..." if the download button doesn't work.
      </p>
    </div>
  );
};

export default GifPreview;