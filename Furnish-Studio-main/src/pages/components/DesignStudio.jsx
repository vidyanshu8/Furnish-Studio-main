import React, { useState, useCallback, useEffect } from 'react';
import './DesignStudio.css';
import ImageUploader from './ImageUploader';
import OptionsPanel from './OptionsPanel';
import { WALL_COLORS, TEXTURE_OPTIONS } from './designOptions';

export default function DesignStudio() {
  const [imageSrc, setImageSrc] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [selectedColor, setSelectedColor] = useState(WALL_COLORS[0]);
  const [selectedTexture, setSelectedTexture] = useState(TEXTURE_OPTIONS[0]);
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [variationUrls, setVariationUrls] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleUploadSuccess = useCallback(({ file, previewSrc }) => {
    setImageSrc(previewSrc);
    setOriginalFile(file);
    setPreviewDataUrl(null);
    setVariationUrls([]);
    setError(null);
    setSelectedColor(WALL_COLORS[0]);
    setSelectedTexture(TEXTURE_OPTIONS[0]);
  }, []);

  useEffect(() => {
    const processImage = async () => {
      if (!originalFile) return;

      setIsProcessing(true);
      setError(null);
      setPreviewDataUrl(null);
      setVariationUrls([]);

      try {
        const formData = new FormData();
        formData.append('image', originalFile);
        formData.append('color', selectedColor.value);
        formData.append('texture', selectedTexture.id);

        const response = await fetch('http://localhost:5000/api/design/process-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || 'Processing failed');
        }

        const result = await response.json();
        const processed = result.data?.primary || result.data?.original || null;
        const variations = result.data?.variations || [];

        if (!processed) {
          throw new Error('No processed image returned from server');
        }

        setPreviewDataUrl(`data:image/png;base64,${processed}`);
        setVariationUrls(variations.map((imageBase64) => `data:image/png;base64,${imageBase64}`));
      } catch (uploadError) {
        setError(uploadError.message || 'Unable to process the image.');
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [originalFile, selectedColor, selectedTexture]);

  const handleDownload = () => {
    if (!previewDataUrl) return;
    const link = document.createElement('a');
    link.href = previewDataUrl;
    link.download = 'wall-design.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="design-studio">
      <div className="design-studio-header">
        <h1>Wall & Door Design Preview</h1>
        <p>Upload your room image, then choose a wall color and texture.</p>
      </div>

      <div className="design-studio-layout">
        <div className="design-panel left-panel">
          <ImageUploader onUpload={handleUploadSuccess} onError={setError} />

          {error && (
            <div className="error-box">
              <span>{error}</span>
            </div>
          )}

          <OptionsPanel
            colors={WALL_COLORS}
            textures={TEXTURE_OPTIONS}
            activeColor={selectedColor}
            activeTexture={selectedTexture}
            onSelectColor={setSelectedColor}
            onSelectTexture={setSelectedTexture}
          />

          <button
            type="button"
            className="btn-action"
            onClick={handleDownload}
            disabled={!previewDataUrl}
          >
            Download Result
          </button>
        </div>

        <div className="design-panel right-panel">
          <div className="preview-header">
            <h2>Live Preview</h2>
            <p>View the final wall or door design after server processing.</p>
          </div>
          <div className="preview-frame">
            {isProcessing && (
              <div className="preview-empty">Processing your design…</div>
            )}
            {!isProcessing && previewDataUrl && (
              <div className="preview-result">
                <img className="preview-output" src={previewDataUrl} alt="Processed preview" />
                {variationUrls.length > 0 && (
                  <div className="preview-grid">
                    {variationUrls.map((url, index) => (
                      <div className="preview-card" key={index}>
                        <img src={url} alt={`Variation ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {!isProcessing && !previewDataUrl && (
              <div className="preview-empty">
                Upload an image to see the processed preview here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
