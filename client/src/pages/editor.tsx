import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Trash2 } from "lucide-react";
import BoundingBoxEditor from "@/components/canvas/BoundingBoxEditor";
import ClassPanel from "@/components/panels/ClassPanel";
import ToolPanel from "@/components/panels/ToolPanel";
import ImagePreviewPanel from "@/components/panels/ImagePreviewPanel";
import AnnotationsPanel from "@/components/panels/AnnotationsPanel";
import OnboardingDialog from "@/components/OnboardingDialog";
import { exportYOLO, parseYOLO, exportClasses, parseClasses } from "@/lib/yolo";
import JSZip from "jszip";
import type { BoundingBox } from "@/types";
import { TAILWIND_COLORS } from "@/lib/yolo";

export type Tool = "draw" | "edit";

interface ImageData {
  url: string;
  file: File;
  boxes: BoundingBox[];
  width: number;
  height: number;
}

export default function Editor() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [classes, setClasses] = useState<{
    [key: string]: { name: string; color: string };
  }>(() => {
    const savedClasses = localStorage.getItem("annotator-classes");
    if (savedClasses) {
      return JSON.parse(savedClasses);
    }
    return {
      "0": { name: "Class 0", color: TAILWIND_COLORS[0] },
      "1": { name: "Class 1", color: TAILWIND_COLORS[1] },
      "2": { name: "Class 2", color: TAILWIND_COLORS[2] },
    };
  });
  console.log("classes", classes);
  const [selectedTool, setSelectedTool] = useState<Tool>("draw");
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState("0");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (images.length > 0) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [images]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageData[] = [];
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    // Create a map to store annotations by filename
    const annotationMap = new Map<string, string>();

    // First, process any annotation files
    for (const file of Array.from(files)) {
      if (file.name === "classes.txt") {
        const content = await file.text();
        const importedClasses = parseClasses(content);
        setClasses(importedClasses);
        continue;
      }

      if (file.name.endsWith(".txt") && file.name !== "classes.txt") {
        const baseName = file.name.slice(0, -4); // Remove .txt extension
        const content = await file.text();
        annotationMap.set(baseName, content);
      }
    }

    // Then process image files and match with annotations
    for (const file of imageFiles) {
      const url = URL.createObjectURL(file);
      const baseName = file.name.substring(0, file.name.lastIndexOf("."));

      // Create a temporary image to get dimensions
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = url;
      });

      let boxes: BoundingBox[] = [];
      const annotationContent = annotationMap.get(baseName);

      if (annotationContent) {
        boxes = parseYOLO(annotationContent, img.width, img.height);
      }

      newImages.push({
        url,
        file,
        boxes,
        width: img.width,
        height: img.height,
      });
    }

    setImages([...images, ...newImages]);
    if (images.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  const handleExport = () => {
    if (images.length === 0) return;

    const zip = new JSZip();

    // Export classes.txt
    zip.file("classes.txt", exportClasses(classes));

    // Export images and annotations
    images.forEach((imageData) => {
      const fileName = imageData.file.name;
      const baseName = fileName.substring(0, fileName.lastIndexOf("."));
      const yoloData = exportYOLO(
        imageData.boxes,
        imageData.width,
        imageData.height
      );

      zip.file(`${baseName}.txt`, yoloData);
      zip.file(fileName, imageData.file);
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dataset.zip";
      a.click();
    });
  };

  const updateBoxes = (boxes: BoundingBox[]) => {
    const newImages = [...images];
    newImages[currentImageIndex].boxes = boxes;
    setImages(newImages);
  };

  const handleBoxSelect = (index: number | null) => {
    setSelectedBox(index);
    if (index !== null && currentImage) {
      // Update selected class to match the box's class when selecting in edit mode
      if (selectedTool === "edit") {
        const box = currentImage.boxes[index];
        setSelectedClass(box.class);
      }
    }
  };

  const handleClassChange = (newClass: string) => {
    console.log("handleClassChange", newClass);
    setSelectedClass(newClass);
    if (selectedBox !== null && currentImage) {
      const newBoxes = [...currentImage.boxes];
      newBoxes[selectedBox] = {
        ...newBoxes[selectedBox],
        class: newClass,
      };
      updateBoxes(newBoxes);
    }
  };

  const handleDeleteBox = (index: number) => {
    if (selectedBox !== null && currentImage) {
      const newBoxes = [...currentImage.boxes];
      newBoxes.splice(selectedBox, 1);
      updateBoxes(newBoxes);
      setSelectedBox(null);
    } else {
      const newBoxes = [...currentImage.boxes];
      newBoxes.splice(index, 1);
      updateBoxes(newBoxes);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setSelectedBox(null); // Reset selected box when changing images
    }
  };

  const handlePreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setSelectedBox(null); // Reset selected box when changing images
    }
  };

  const currentImage = images[currentImageIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingDialog />
      <div className="border-b">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">YOLO Labelling Tool</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload Images & Annotations
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.txt"
                multiple
                onChange={handleImageUpload}
              />
            </Button>
            <Button
              variant="default"
              className="gap-2"
              onClick={handleExport}
              disabled={images.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Dataset
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto py-4 grid grid-cols-[250px_1fr] gap-4">
        <div className="space-y-4">
          <ClassPanel
            classes={classes}
            setClasses={setClasses}
            selectedClass={selectedClass}
            onSelectClass={handleClassChange}
          />
          <ToolPanel
            selectedTool={selectedTool}
            setSelectedTool={setSelectedTool}
            selectedBox={selectedBox}
            onDeleteBox={handleDeleteBox}
            onNextImage={handleNextImage}
            onPreviousImage={handlePreviousImage}
            hasNextImage={currentImageIndex < images.length - 1}
            hasPreviousImage={currentImageIndex > 0}
          />
          <AnnotationsPanel
            boxes={currentImage?.boxes ?? []}
            classes={classes}
            onEdit={handleBoxSelect}
            onDelete={handleDeleteBox}
            selectedBox={selectedBox}
            onSelectClass={(boxIndex: number) => {
              setSelectedBox(boxIndex);
              if (selectedTool === "edit") {
                setSelectedClass(currentImage.boxes[boxIndex].class);
              }
            }}
          />
        </div>

        <div>
          <Card className="p-4 relative">
            {currentImage ? (
              <BoundingBoxEditor
                imageUrl={currentImage.url}
                boxes={currentImage.boxes}
                setBoxes={updateBoxes}
                classes={classes}
                selectedTool={selectedTool}
                selectedBox={selectedBox}
                setSelectedBox={handleBoxSelect}
                selectedClass={selectedClass}
                onSelectClass={handleClassChange}
              />
            ) : (
              <div className="h-[50vh] flex items-center justify-center text-muted-foreground">
                Upload images to begin editing
              </div>
            )}
          </Card>
          {images.length > 0 && (
            <div className="container mx-auto py-4">
              <ImagePreviewPanel
                images={images}
                currentIndex={currentImageIndex}
                onSelect={setCurrentImageIndex}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
