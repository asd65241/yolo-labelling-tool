import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { BoundingBox } from "@/types";

interface Props {
  boxes: BoundingBox[];
  classes: { [key: string]: { name: string; color: string } };
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  selectedBox: number | null;
  onSelectClass: (index: number) => void;
}

export default function AnnotationsPanel({
  boxes,
  classes,
  onEdit,
  onDelete,
  selectedBox,
  onSelectClass,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Annotations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {boxes.map((box, index) => {
          const defaultClass = { name: "Unknown", color: "#808080" };
          const boxClass =
            box.class && classes[box.class] ? classes[box.class] : defaultClass;

          return (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-md border ${
                selectedBox === index ? "bg-accent" : ""
              } hover:bg-accent/50 cursor-pointer`}
              onClick={() => onSelectClass(index)}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: boxClass.color }}
                />
                <span className="text-lg">{boxClass.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(index);
                }}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          );
        })}
        {boxes.length === 0 && (
          <div className="text-center text-muted-foreground">
            No annotations yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
