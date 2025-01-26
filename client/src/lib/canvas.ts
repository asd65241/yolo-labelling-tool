export function drawCanvas(
  canvas: HTMLCanvasElement,
  imageUrl: string,
  boxes: any[],
  classes: { [key: string]: { name: string; color: string } },
  selectedBox: number | null
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const image = new Image();
  image.src = imageUrl;
  image.onload = () => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw boxes
    boxes.forEach((box, index) => {
      const defaultClass = { name: "Unknown", color: "#808080" };
      const boxClass =
        box.class && classes[box.class] ? classes[box.class] : defaultClass;
      const color = boxClass.color;

      // Draw label with background first
      if (box.width > 0 && box.height > 0) {
        const text = boxClass.name;
        ctx.font = "bold 30px Arial"; // Large text size
        const metrics = ctx.measureText(text);

        // Calculate label position
        const labelY = box.y - 8; // Position label just above the box
        const labelHeight = 40;

        // Draw background
        ctx.fillStyle = color;
        ctx.fillRect(
          box.x - 3,
          labelY - labelHeight,
          metrics.width + 20,
          labelHeight * 1.2
        );

        // Draw text
        ctx.fillStyle = "white";
        ctx.fillText(text, box.x + 4, labelY - 6);
      }

      // Draw box after label
      drawBox(
        ctx,
        box.x,
        box.y,
        box.width,
        box.height,
        color,
        index === selectedBox
      );
    });
  };
}

export function drawBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  selected: boolean = false
) {
  const lineWidth = selected ? 8 : 6; // Thick lines

  // Ensure coordinates stay within canvas bounds
  const actualX = Math.max(lineWidth / 2, x);
  const actualY = Math.max(lineWidth / 2, y);
  const actualWidth = Math.min(width, ctx.canvas.width - x - lineWidth / 2);
  const actualHeight = Math.min(height, ctx.canvas.height - y - lineWidth / 2);

  // Draw the main box
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.rect(actualX, actualY, actualWidth, actualHeight);
  ctx.stroke();

  // Draw corner handles if selected
  if (selected) {
    const handleSize = 16;
    ctx.fillStyle = color;

    // Ensure handles stay within bounds
    const handlePoints = [
      [actualX, actualY], // top-left
      [actualX + actualWidth, actualY], // top-right
      [actualX, actualY + actualHeight], // bottom-left
      [actualX + actualWidth, actualY + actualHeight], // bottom-right
    ];

    handlePoints.forEach(([hx, hy]) => {
      ctx.fillRect(
        hx - handleSize / 2,
        hy - handleSize / 2,
        handleSize,
        handleSize
      );
    });
  }
}

export function getCanvasImage(
  canvas: HTMLCanvasElement
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = canvas.toDataURL();
  });
}
