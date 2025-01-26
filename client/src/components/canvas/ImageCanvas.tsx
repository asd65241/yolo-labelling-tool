import { useEffect, useRef } from 'react';

interface Props {
  imageUrl: string;
  width: number;
  height: number;
}

export default function ImageCanvas({ imageUrl, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);
    };
  }, [imageUrl, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
