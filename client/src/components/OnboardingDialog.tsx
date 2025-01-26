import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Edit2, Download } from "lucide-react";
import { useState, useEffect } from "react";

export default function OnboardingDialog() {
  const [open, setOpen] = useState(true);

  // useEffect(() => {
  //   // Show dialog if it's the first visit
  //   const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
  //   if (!hasSeenOnboarding) {
  //     setOpen(true);
  //     localStorage.setItem("hasSeenOnboarding", "true");
  //   }
  // }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Welcome to YOLO Labelling Tool! 🎨
          </DialogTitle>
          <DialogDescription className="text-lg mt-4">
            Create and edit image annotations for object detection in three easy
            steps:
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">1. Upload Your Images</h3>
              <p className="text-muted-foreground">
                Start by uploading your images. You can also import existing
                YOLO annotations and classes.txt files.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Edit2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">2. Create Annotations</h3>
              <p className="text-muted-foreground">
                Draw bounding boxes around objects using our intuitive tools.
                Manage your classes and edit boxes with precision.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">3. Export Your Dataset</h3>
              <p className="text-muted-foreground">
                Export your annotations in YOLO format, including all images and
                a classes.txt file.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>Get Started</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
