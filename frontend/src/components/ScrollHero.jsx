import React, { useEffect, useRef, useState } from 'react';

const ScrollHero = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const frameCount = 240;

  useEffect(() => {
    const loadedImages = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `/frames/ezgif-frame-${String(i).padStart(3, '0')}.png`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) {
          setImages(loadedImages);
        }
      };
      loadedImages[i] = img;
    }
  }, []);

  useEffect(() => {
    if (images.length < frameCount) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const updateCanvas = () => {
      const scrollFraction = window.scrollY / (containerRef.current.offsetHeight - window.innerHeight);
      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
      );

      const img = images[frameIndex + 1];
      if (img) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw centered and aspect-ratio correct
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;
        
        context.drawImage(img, 0, 0, img.width, img.height,
          centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
      }
    };

    window.addEventListener('scroll', updateCanvas);
    
    // Initial draw
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        updateCanvas();
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('scroll', updateCanvas);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [images]);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-[#0A0A0A]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
      </div>
    </div>
  );
};

export default ScrollHero;
