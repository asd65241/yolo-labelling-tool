import { useEffect, useRef, useState } from "react";
import { drawCanvas, drawBox } from "@/lib/canvas";
import type { Tool } from "@/pages/editor";
import type { BoundingBox } from "@/types";

interface Props {
  image: { url: string; file: File; boxes: any[] };
  imageUrl: string;
  boxes: BoundingBox[];
  setBoxes: (boxes: BoundingBox[]) => void;
  classes: { [key: string]: { name: string; color: string } };
  selectedTool: Tool;
  selectedBox: number | null;
  setSelectedBox: (index: number | null) => void;
  selectedClass: string;
  onSelectClass: (className: string) => void; // Added onSelectClass function
}

const HANDLE_SIZE = 10; // Increased handle size

export default function BoundingBoxEditor({
  image,
  imageUrl,
  boxes,
  setBoxes,
  classes,
  selectedTool,
  selectedBox,
  setSelectedBox,
  selectedClass,
  onSelectClass, // Added onSelectClass prop
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [moveOffset, setMoveOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const image = new Image();
      image.src = imageUrl;
      image.onload = () => {
        // Set container height to 60vh
        container.style.height = "60vh";
        const containerWidth = container.clientWidth - 48; // Account for padding
        const containerHeight = container.clientHeight - 48;
        const imageAspect = image.width / image.height;
        const containerAspect = containerWidth / containerHeight;

        let width = containerWidth;
        let height = containerHeight;

        if (imageAspect > containerAspect) {
          height = width / imageAspect;
        } else {
          width = height * imageAspect;
        }

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width = image.width;
        canvas.height = image.height;

        drawCanvas(canvas, imageUrl, boxes, classes, selectedBox);
      };
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [imageUrl, boxes, selectedBox, classes]);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.min(Math.max(0, (e.clientX - rect.left) * scaleX), canvas.width),
      y: Math.min(Math.max(0, (e.clientY - rect.top) * scaleY), canvas.height),
    };
  };

  const hitTest = (x: number, y: number) => {
    if (selectedBox !== null && selectedTool === "edit") {
      const box = boxes[selectedBox];
      const handles = {
        nw: [box.x, box.y],
        ne: [box.x + box.width, box.y],
        sw: [box.x, box.y + box.height],
        se: [box.x + box.width, box.y + box.height],
      };

      for (const [handle, [hx, hy]] of Object.entries(handles)) {
        if (
          Math.abs(x - hx) <= HANDLE_SIZE &&
          Math.abs(y - hy) <= HANDLE_SIZE
        ) {
          return { type: "handle", handle, index: selectedBox };
        }
      }
    }

    for (let i = boxes.length - 1; i >= 0; i--) {
      const box = boxes[i];
      if (
        x >= box.x &&
        x <= box.x + box.width &&
        y >= box.y &&
        y <= box.y + box.height
      ) {
        return { type: "box", index: i };
      }
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    setStartPos(pos);

    const hit = hitTest(pos.x, pos.y);

    if (!hit) {
      if (selectedTool === "draw") {
        setDrawing(true);
      }
      setSelectedBox(null);
      return;
    }

    if (selectedTool === "edit") {
      if (hit.type === "handle") {
        setResizing(true);
        setResizeHandle(hit.handle || null);
        setSelectedBox(hit.index);
        // Update selected class when a box is selected
        const box = boxes[hit.index];
        onSelectClass(box.class);
      } else if (hit.type === "box") {
        setSelectedBox(hit.index);
        // Update selected class when a box is selected
        const box = boxes[hit.index];
        setDragging(true);
        setMoveOffset({
          x: pos.x - box.x,
          y: pos.y - box.y,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getMousePos(e);

    if (drawing) {
      drawCanvas(canvas, imageUrl, boxes, classes, selectedBox);
      const width = pos.x - startPos.x;
      const height = pos.y - startPos.y;
      drawBox(
        canvas.getContext("2d")!,
        startPos.x,
        startPos.y,
        width,
        height,
        classes[selectedClass].color
      );
    } else if (dragging && selectedBox !== null) {
      const newBoxes = [...boxes];
      newBoxes[selectedBox] = {
        ...newBoxes[selectedBox],
        x: pos.x - moveOffset.x,
        y: pos.y - moveOffset.y,
      };
      setBoxes(newBoxes);
    } else if (resizing && selectedBox !== null && resizeHandle) {
      const box = boxes[selectedBox];
      const newBoxes = [...boxes];
      let newBox = { ...box };

      switch (resizeHandle) {
        case "nw":
          newBox = {
            ...newBox,
            x: pos.x,
            y: pos.y,
            width: box.x + box.width - pos.x,
            height: box.y + box.height - pos.y,
          };
          break;
        case "ne":
          newBox = {
            ...newBox,
            y: pos.y,
            width: pos.x - box.x,
            height: box.y + box.height - pos.y,
          };
          break;
        case "sw":
          newBox = {
            ...newBox,
            x: pos.x,
            width: box.x + box.width - pos.x,
            height: pos.y - box.y,
          };
          break;
        case "se":
          newBox = {
            ...newBox,
            width: pos.x - box.x,
            height: pos.y - box.y,
          };
          break;
      }

      if (newBox.width > 5 && newBox.height > 5) {
        newBoxes[selectedBox] = newBox;
        setBoxes(newBoxes);
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (drawing) {
      const pos = getMousePos(e);
      const newBox = {
        x: Math.min(startPos.x, pos.x),
        y: Math.min(startPos.y, pos.y),
        width: Math.abs(pos.x - startPos.x),
        height: Math.abs(pos.y - startPos.y),
        class: selectedClass,
      };

      if (newBox.width > 5 && newBox.height > 5) {
        setBoxes([...boxes, newBox]);
      }
      setDrawing(false);
    }

    if (dragging) {
      setDragging(false);
    }

    if (resizing) {
      setResizing(false);
      setResizeHandle(null);
    }
  };

  const getCursor = () => {
    if (selectedTool === "draw") return "crosshair";
    if (dragging) return "move";
    if (resizeHandle) {
      switch (resizeHandle) {
        case "nw":
        case "se":
          return "nwse-resize";
        case "ne":
        case "sw":
          return "nesw-resize";
      }
    }
    return selectedTool === "edit" ? "pointer" : "default";
  };

  return (
    <div>
      <div
        ref={containerRef}
        className="w-full relative rounded-lg overflow-hidden"
        style={{ cursor: getCursor() }}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setDrawing(false);
            setDragging(false);
            setResizing(false);
          }}
        />
      </div>
      {/* Show filename */}
      <div className="absolute bottom-0 right-0 p-2 text-xs text-white bg-black font-bold">
        {image.file.name}
      </div>
    </div>
  );
}
