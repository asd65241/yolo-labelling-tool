import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Square, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Tool } from "@/pages/editor";

interface Props {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
  selectedBox: number | null;
  onDeleteBox: (index: number) => void;
  onNextImage: () => void;
  onPreviousImage: () => void;
  hasNextImage: boolean;
  hasPreviousImage: boolean;
  onRemoveImage: () => void;
}

export default function ToolPanel({
  selectedTool,
  setSelectedTool,
  selectedBox,
  onDeleteBox,
  onNextImage,
  onPreviousImage,
  onRemoveImage,
  hasNextImage = false,
  hasPreviousImage = false,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant={selectedTool === "draw" ? "default" : "secondary"}
          className="w-full justify-start gap-2 text-left"
          onClick={() => setSelectedTool("draw")}
        >
          <Square className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Draw Box</span>
        </Button>
        <Button
          variant={selectedTool === "edit" ? "default" : "secondary"}
          className="w-full justify-start gap-2 text-left"
          onClick={() => setSelectedTool("edit")}
        >
          <Edit2 className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Edit Mode</span>
        </Button>
        {selectedBox !== null && onDeleteBox && (
          <Button
            variant="destructive"
            className="w-full justify-start gap-2 text-left"
            onClick={() => onDeleteBox(selectedBox || 0)}
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Delete Box</span>
          </Button>
        )}

        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            className="w-full justify-start gap-2 text-left"
            onClick={onRemoveImage}
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Remove Image</span>
          </Button>
        </div>

        {/* Image Navigation */}
        <div className="pt-4 border-t">
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 text-left mb-2"
            onClick={onPreviousImage}
            disabled={!hasPreviousImage}
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Previous Image</span>
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 text-left"
            onClick={onNextImage}
            disabled={!hasNextImage}
          >
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Next Image</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
