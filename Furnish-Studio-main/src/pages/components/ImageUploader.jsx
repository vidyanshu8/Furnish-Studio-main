import React, { useRef, useState } from 'react';
import { Upload, Loader, X } from 'lucide-react';

export default function ImageUploader({ onUpload, onError }) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      onError('Only JPG and PNG images are supported.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      onError('Image must be smaller than 12MB.');
      return;
    }

    onError(null);
    setLoading(true);
    setProgress(100);

    onUpload({
      file,
      previewSrc: URL.createObjectURL(file)
    });

    setLoading(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div
      className={`upload-card ${dragActive ? 'drag-active' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {loading ? (
        <div className="upload-status">
          <Loader className="upload-icon" />
          <p>Uploading image... {progress}%</p>
        </div>
      ) : (
        <>
          <Upload className="upload-icon" />
          <h2>Upload wall or door image</h2>
          <p>Drag and drop JPG or PNG files here.</p>
        </>
      )}

      {dragActive && <div className="drag-overlay">Drop image to upload</div>}
    </div>
  );
}
