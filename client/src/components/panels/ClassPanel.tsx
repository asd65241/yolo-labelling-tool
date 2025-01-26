import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TAILWIND_COLORS } from "@/lib/yolo";

interface Props {
  classes: { [key: string]: { name: string; color: string } };
  setClasses: (classes: {
    [key: string]: { name: string; color: string };
  }) => void;
  selectedClass: string;
  onSelectClass: (id: string) => void;
}

export default function ClassPanel({
  classes,
  setClasses,
  selectedClass,
  onSelectClass,
}: Props) {
  const [editMode, setEditMode] = useState(false);

  // Load classes from localStorage on mount
  useEffect(() => {
    const savedClasses = localStorage.getItem("annotator-classes");
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses));
    }
  }, []);

  // Save classes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("annotator-classes", JSON.stringify(classes));
  }, [classes]);

  const addClass = () => {
    const newId = Object.keys(classes).length.toString();
    const colorIndex = Number(newId) % TAILWIND_COLORS.length;
    setClasses({
      ...classes,
      [newId]: {
        name: `Class ${newId}`,
        color: TAILWIND_COLORS[colorIndex],
      },
    });
  };

  const removeClass = (id: string) => {
    const newClasses = { ...classes };
    delete newClasses[id];
    setClasses(newClasses);
  };

  const updateClass = (
    id: string,
    updates: Partial<{ name: string; color: string }>
  ) => {
    setClasses({
      ...classes,
      [id]: {
        ...classes[id],
        ...updates,
      },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Classes</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditMode(!editMode)}
          className={cn(editMode && "bg-accent")}
        >
          {editMode ? (
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Done
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Edit2 className="h-4 w-4" />
              Edit
            </span>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(classes).map(([id, classInfo]) => (
          <div key={id} className="space-y-2">
            {editMode ? (
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={
                    classInfo.color.startsWith("#")
                      ? classInfo.color
                      : `#${classInfo.color
                          .match(/\d+/g)
                          ?.map((x) =>
                            parseInt(x).toString(16).padStart(2, "0")
                          )
                          .join("")}`
                  }
                  onChange={(e) => updateClass(id, { color: e.target.value })}
                  className="w-8 h-8 p-0 rounded-full"
                />
                <Input
                  value={classInfo.name}
                  onChange={(e) => updateClass(id, { name: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeClass(id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant={selectedClass === id ? "default" : "outline"}
                className="w-full justify-start gap-2 text-left"
                onClick={() => onSelectClass(id)}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: classInfo.color }}
                />
                <span className="flex-1 text-left">{classInfo.name}</span>
                {selectedClass === id && (
                  <Check className="h-4 w-4 ml-auto shrink-0" />
                )}
              </Button>
            )}
          </div>
        ))}

        {editMode && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={addClass}
          >
            <Plus className="h-4 w-4" />
            <span className="text-left">Add Class</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
