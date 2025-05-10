import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const PhotoEditor = () => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  
  const defaultSettings = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
  };
  
  const [imageSettings, setImageSettings] = useState(defaultSettings);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const editedImageRef = useRef(null);

  // Start camera stream
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Take photo from camera (now uses displayed dimensions)
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const displayWidth = video.clientWidth;
      const displayHeight = video.clientHeight;
      
      canvasRef.current.width = displayWidth;
      canvasRef.current.height = displayHeight;
      
      const context = canvasRef.current.getContext('2d');
      context.drawImage(video, 0, 0, displayWidth, displayHeight);
      
      const imageDataUrl = canvasRef.current.toDataURL('image/png');
      setCapturedImage(imageDataUrl);
    }
  };

  // Save photo
  const savePhoto = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = 'photo.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Apply image filters based on settings
  const applyFilters = () => {
    if (capturedImage && editedImageRef.current) {
      editedImageRef.current.style.filter = `
        brightness(${imageSettings.brightness}%)
        contrast(${imageSettings.contrast}%)
        saturate(${imageSettings.saturation}%)
        sepia(${imageSettings.sepia}%)
      `;
    }
  };

  // Update setting and apply filters
  const handleSettingChange = (setting, value) => {
    setImageSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Reset all settings to default
  const resetSettings = () => {
    setImageSettings(defaultSettings);
  };

  // Apply filters when settings or image changes
  useEffect(() => {
    applyFilters();
  }, [imageSettings, capturedImage]);

  // Start camera on component mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="photo-editor-app">
      <header className="app-header">
        <h1>Photo Editor</h1>
      </header>
      
      <div className="main-content">
        <div className="camera-section">
          <div className="video-container">
            {stream ? (
              <video ref={videoRef} autoPlay playsInline className="camera-feed"></video>
            ) : (
              <div className="camera-placeholder">Camera not available</div>
            )}
          </div>
          
          <div className="controls">
            <button onClick={takePhoto} className="control-button">Take Photo</button>
            <button onClick={savePhoto} className="control-button" disabled={!capturedImage}>Save</button>
          </div>
          
          {capturedImage && (
            <div className="captured-image-container">
              <h3>Captured Photo:</h3>
              <img 
                ref={editedImageRef}
                src={capturedImage} 
                alt="Captured" 
                className="captured-image"
              />
            </div>
          )}
        </div>
        
        <div className="side-panel">
          <h3>Image Adjustments</h3>
          
          <div className="slider-control">
            <label>Brightness: {imageSettings.brightness}%</label>
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={imageSettings.brightness}
              onChange={(e) => handleSettingChange('brightness', e.target.value)}
            />
          </div>
          
          <div className="slider-control">
            <label>Contrast: {imageSettings.contrast}%</label>
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={imageSettings.contrast}
              onChange={(e) => handleSettingChange('contrast', e.target.value)}
            />
          </div>
          
          <div className="slider-control">
            <label>Saturation: {imageSettings.saturation}%</label>
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={imageSettings.saturation}
              onChange={(e) => handleSettingChange('saturation', e.target.value)}
            />
          </div>
          
          <div className="slider-control">
            <label>Sepia: {imageSettings.sepia}%</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={imageSettings.sepia}
              onChange={(e) => handleSettingChange('sepia', e.target.value)}
            />
          </div>
          
          <button 
            onClick={resetSettings} 
            className="reset-button"
          >
            Reset Settings
          </button>
        </div>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default PhotoEditor;