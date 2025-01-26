# YOLO Labelling Tool

A modern, web-based tool for creating and editing YOLO format image annotations with an intuitive interface.

![YOLO Labelling Tool](preview.png)

## Features

- 🎨 Interactive bounding box creation and editing
- 📁 Multi-image support with responsive thumbnail navigation
- 🎯 Robust class management with color-coded labels
- 💾 Export to YOLO format with classes.txt
- 🔄 Import existing YOLO annotations
- 📱 Responsive design for various screen sizes
- 🎨 Customizable class colors using Tailwind CSS color palette

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Creating Annotations

1. Click "Upload Images & Annotations" to select your images
2. Use the "Draw Box" tool to create bounding boxes
3. Select a class from the Classes panel
4. Draw boxes around objects in your images
5. Use the Edit mode to adjust box positions and sizes
6. Navigate between images using the thumbnail panel or Previous/Next buttons

### Managing Classes

1. Click "Edit" in the Classes panel
2. Add new classes using the "Add Class" button
3. Customize class names and colors
4. Click "Done" to save changes

### Exporting Dataset

1. Click "Export Dataset" to download your annotations
2. The export will include:
   - All images
   - YOLO format annotation files (.txt)
   - classes.txt file

## File Format

### YOLO Format

Each annotation file contains one line per object in the format:
```
<class_id> <x_center> <y_center> <width> <height>
```
All values are normalized between 0 and 1.

### classes.txt

Contains one class name per line, where the line number corresponds to the class ID in the annotation files.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.