import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  images: { url: string; file: File; boxes: any[] }[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

export default function ImagePreviewPanel({
  images,
  currentIndex,
  onSelect,
}: Props) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium">
          Image {currentIndex + 1} of {images.length}
        </span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <Button
            key={index}
            variant="ghost"
            className={cn(
              "p-2 h-auto shrink-0 flex flex-col items-start gap-2",
              index === currentIndex && "bg-accent"
            )}
            onClick={() => onSelect(index)}
          >
            <div className="relative">
              <img
                src={image.url}
                alt={`Preview ${index + 1}`}
                className="w-32 h-24 object-cover rounded-md"
              />
              {image.boxes.length > 0 && (
                <div className="absolute top-1 right-1 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {image.boxes.length} boxes
                </div>
              )}
            </div>
            <span className="text-sm w-32 truncate">{image.file.name}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
