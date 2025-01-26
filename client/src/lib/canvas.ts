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

      // Draw box first
      drawBox(
        ctx,
        box.x,
        box.y,
        box.width,
        box.height,
        color,
        index === selectedBox
      );

      // Draw label with background after box
      if (box.width > 0 && box.height > 0) {
        const text = boxClass.name;

        // Use relative font size based on canvas height
        const fontSize = Math.max(canvas.height * 0.03, 30); // Min 30px
        ctx.font = `bold ${fontSize}px Arial`;
        const metrics = ctx.measureText(text);

        // Calculate relative label dimensions
        const labelPadding = canvas.height * 0.005; // Padding around text
        const labelHeight = fontSize * 1.2;
        const labelY = box.y - labelPadding;

        // Draw background with relative positioning
        ctx.fillStyle = color;
        ctx.fillRect(
          box.x - labelPadding,
          labelY - labelHeight,
          metrics.width + labelPadding * 2,
          labelHeight
        );

        // Draw text with relative positioning
        ctx.fillStyle = "white";
        ctx.fillText(text, box.x + labelPadding / 2, labelY - labelPadding);
      }
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
  const lineWidth = Math.max(ctx.canvas.width * 0.008, 8); // Relative line width with minimum size

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
    const handleSize = Math.max(ctx.canvas.width * 0.016, 16); // Relative handle size with minimum
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
