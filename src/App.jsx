import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const PhotoEditor = () => {
  const [stream, setStream] = useState(null);               // Obiekt stream kamery
  const [capturedImage, setCapturedImage] = useState(null); // Przechowuje zrobione zdjęcie (jako data URL)

  // Domyślne ustawienia suwaków (filtrów CSS)
  const defaultSettings = {
    brightness: 100, // Jasność (procentowo)
    contrast: 100,   // Kontrast (procentowo)
    saturation: 100, // Nasycenie (procentowo)
    sepia: 0         // Efekt sepii (procentowo)
  };

  const [imageSettings, setImageSettings] = useState(defaultSettings);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const editedImageRef = useRef(null);

  // Uruchomienie kamery (stream)
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

  // Zatrzymanie streamu kamery
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Robienie zdjęcia z kamery (kopiowanie obrazu z <video> do <canvas>)
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const displayWidth = video.clientWidth;
      const displayHeight = video.clientHeight;

      canvasRef.current.width = displayWidth;
      canvasRef.current.height = displayHeight;

      const context = canvasRef.current.getContext('2d');
      context.drawImage(video, 0, 0, displayWidth, displayHeight);

      // Konwersja canvas do PNG
      const imageDataUrl = canvasRef.current.toDataURL('image/png');
      setCapturedImage(imageDataUrl);

      // Po zrobieniu zdjęcia, zatrzymaj kamerę (opcjonalne)
      stopCamera();
    }
  };

  // Zapis zdjęcia (tworzy link do pobrania)
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

  // Usunięcie zrobionego zdjęcia i ponowne uruchomienie kamery
  const deletePhoto = () => {
    setCapturedImage(null);
    resetSettings(); // opcjonalnie resetuj ustawienia
    startCamera();
  };

  // Aktualizacja filtrów CSS zdjęcia
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

  // Obsługa zmiany wartości suwaków
  const handleSettingChange = (setting, value) => {
    setImageSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Reset suwaków do wartości domyślnych
  const resetSettings = () => {
    setImageSettings(defaultSettings);
  };

  // Zaaplikuj filtry gdy ustawienia się zmienią lub po zrobieniu zdjęcia
  useEffect(() => {
    applyFilters();
  }, [imageSettings, capturedImage]);

  // Rozpocznij kamerę przy ładowaniu komponentu
  useEffect(() => {
    startCamera();
    return () => stopCamera(); // posprzątaj przy odmontowaniu komponentu
  }, []);

  // Po każdej zmianie streamu przypisz go do <video>
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="photo-editor-app">
      <header className="app-header">
        <h1>Photo Editor</h1>
      </header>

      <div className="main-content">
        <div className="camera-section">
          {stream && !capturedImage ? (
            <>
              <h3>Camera:</h3>
              <div className="video-container">
                <video ref={videoRef} autoPlay playsInline className="camera-feed"></video>
              </div>
            </>
          ) : capturedImage ? (
            <>
              <h3>Captured Image</h3>
              <div className="captured-image-container">
                <img
                  ref={editedImageRef}
                  src={capturedImage}
                  alt="Captured"
                  className="captured-image"
                />
              </div>
            </>
          ) : (
            <div className="camera-placeholder">Camera not available</div>
          )}

          <div className="controls">
            {!capturedImage && (
              <button onClick={takePhoto} className="control-button">Take Photo</button>
            )}
            {capturedImage && (
              <>
                <button onClick={savePhoto} className="control-button">Save</button>
                <button onClick={deletePhoto} className="control-button">Delete Photo</button>
              </>
            )}
          </div>
        </div>

        <div className="side-panel">
          <h3>Image Adjustments</h3>

          {/* Suwaki działają przez modyfikację stylu CSS `filter` na <img> */}
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

          <button onClick={resetSettings} className="reset-button">
            Reset Settings
          </button>
        </div>
      </div>

      {/* Ukryty canvas – tylko do robienia zdjęć */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default PhotoEditor;
