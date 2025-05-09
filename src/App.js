import React from 'react';

function App() {
  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Edytor zdjęć z kamery</h1>
      
      {/* Kamera i zdjęcie */}
      <div className="text-center">
        <video id="video" width="400" autoPlay></video>
        <br />
        <button className="btn btn-primary my-3" onClick={takePhoto}>
          Zrób zdjęcie
        </button>
        <canvas id="canvas" width="400" height="300"></canvas>
      </div>
    </div>
  );
}

// Placeholder funkcji (na razie tylko console.log)
function takePhoto() {
  console.log("Kliknięto przycisk – zdjęcie!");
}

export default App;
