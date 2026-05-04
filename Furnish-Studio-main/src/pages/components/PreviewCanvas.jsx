import React, { useEffect, useRef } from 'react';

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const drawTexture = (ctx, width, height, texture) => {
  if (texture.id === 'wood') {
    ctx.fillStyle = '#A67C52';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(92,56,26,0.32)';
    ctx.lineWidth = 6;
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y + 10);
      ctx.bezierCurveTo(width * 0.25, y + 20, width * 0.75, y - 20, width, y + 10);
      ctx.stroke();
    }
  } else if (texture.id === 'marble') {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f1ea');
    gradient.addColorStop(1, '#d7d2c8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, height * (i / 8));
      ctx.bezierCurveTo(width * 0.25, height * (i / 8 + 0.05), width * 0.75, height * (i / 8 - 0.05), width, height * (i / 8 + 0.03));
      ctx.stroke();
    }
  } else if (texture.id === 'concrete') {
    ctx.fillStyle = '#A9ACB3';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 300; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }
  } else if (texture.id === 'wallpaper') {
    ctx.fillStyle = '#D4DFE5';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(120,132,149,0.18)';
    for (let y = 0; y < height; y += 40) {
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.arc(x + 20, y + 20, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    ctx.fillStyle = '#C1C1C1';
    ctx.fillRect(0, 0, width, height);
  }
};

export default function PreviewCanvas({ originalSrc, maskSrc, selectedColor, selectedTexture, onPreviewReady }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!originalSrc || !maskSrc) return;

    const renderCanvas = async () => {
      const originalImage = await loadImage(originalSrc);
      const maskImage = await loadImage(maskSrc);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = originalImage.width;
      const height = originalImage.height;
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(originalImage, 0, 0, width, height);

      const overlay = document.createElement('canvas');
      overlay.width = width;
      overlay.height = height;
      const overlayCtx = overlay.getContext('2d');

      overlayCtx.globalAlpha = 1;
      overlayCtx.drawImage(originalImage, 0, 0, width, height);
      overlayCtx.globalCompositeOperation = 'source-over';
      drawTexture(overlayCtx, width, height, selectedTexture);
      overlayCtx.globalCompositeOperation = 'overlay';
      overlayCtx.fillStyle = selectedColor.value;
      overlayCtx.fillRect(0, 0, width, height);
      overlayCtx.globalCompositeOperation = 'destination-in';
      overlayCtx.drawImage(maskImage, 0, 0, width, height);

      ctx.globalAlpha = 0.92;
      ctx.drawImage(overlay, 0, 0, width, height);
      ctx.globalAlpha = 1;

      const dataUrl = canvas.toDataURL('image/png');
      if (onPreviewReady) {
        onPreviewReady(dataUrl);
      }
    };

    renderCanvas();
  }, [originalSrc, maskSrc, selectedColor, selectedTexture, onPreviewReady]);

  return <canvas ref={canvasRef} className="preview-canvas" />;
}
