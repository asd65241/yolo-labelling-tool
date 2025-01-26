import type { BoundingBox } from "@/types";

export const TAILWIND_COLORS = [
  'rgb(59, 130, 246)', // blue-500
  'rgb(239, 68, 68)',  // red-500
  'rgb(34, 197, 94)',  // green-500
  'rgb(234, 179, 8)',  // yellow-500
  'rgb(168, 85, 247)', // purple-500
  'rgb(236, 72, 153)', // pink-500
  'rgb(249, 115, 22)', // orange-500
  'rgb(20, 184, 166)', // teal-500
  'rgb(99, 102, 241)', // indigo-500
  'rgb(6, 182, 212)',  // cyan-500
  'rgb(124, 58, 237)', // violet-500
  'rgb(16, 185, 129)'  // emerald-500
];

export function parseYOLO(
  content: string,
  imageWidth: number,
  imageHeight: number
): BoundingBox[] {
  return content.split('\n')
    .filter(line => line.trim() !== '')
    .map(line => {
      const [classId, x_center, y_center, width, height] = line.split(' ').map(Number);

      // Convert normalized YOLO coordinates to pixel coordinates
      const pixelWidth = width * imageWidth;
      const pixelHeight = height * imageHeight;
      const pixelX = (x_center * imageWidth) - (pixelWidth / 2);
      const pixelY = (y_center * imageHeight) - (pixelHeight / 2);

      return {
        x: pixelX,
        y: pixelY,
        width: pixelWidth,
        height: pixelHeight,
        class: classId.toString(),
        canvas_width: imageWidth,  // Store original image dimensions
        canvas_height: imageHeight
      };
    });
}

export function exportYOLO(
  boxes: BoundingBox[], 
  imageWidth: number,
  imageHeight: number
): string {
  return boxes.map(box => {
    // Convert pixel coordinates to normalized YOLO format
    const x_center = (box.x + box.width/2) / imageWidth;
    const y_center = (box.y + box.height/2) / imageHeight;
    const width = box.width / imageWidth;
    const height = box.height / imageHeight;

    return `${box.class} ${x_center.toFixed(6)} ${y_center.toFixed(6)} ${width.toFixed(6)} ${height.toFixed(6)}`;
  }).join('\n');
}

export function exportClasses(classes: {[key: string]: {name: string; color: string}}): string {
  return Object.entries(classes)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([_, classInfo]) => classInfo.name)
    .join('\n');
}

export function parseClasses(content: string): {[key: string]: {name: string; color: string}} {
  const classNames = content.split('\n').filter(line => line.trim() !== '');
  const classes: {[key: string]: {name: string; color: string}} = {};

  classNames.forEach((name, index) => {
    // Use Tailwind colors in sequence, repeat if more classes than colors
    const colorIndex = index % TAILWIND_COLORS.length;
    classes[index.toString()] = {
      name,
      color: TAILWIND_COLORS[colorIndex]
    };
  });

  return classes;
}