import React, { useRef, useEffect, useState } from 'react';

const CameraComponent = () => {
  const videoRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Błąd dostępu do kamery: ', err);
      }
    };

    startCamera();
  }, []);

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setImageData(dataUrl);
    }
  };

  const savePhoto = () => {
    if (imageData) {
      const a = document.createElement('a');
      a.href = imageData;
      a.download = 'zdjecie.png';
      a.click();
    }
  };

  return (
    <div className="camera-app">
      <h1>Edytor zdjęć</h1>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: '640px' }} />
      <div className="controls">
        <button onClick={capturePhoto}>Zrób zdjęcie</button>
        <button onClick={savePhoto}>Zapisz zdjęcie</button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {imageData && (
        <div className="photo-container">
          <img src={imageData} alt="Zrobione zdjęcie" style={{ width: '100%', maxWidth: '640px' }} />
        </div>
      )}
    </div>
  );
};

export default CameraComponent;

