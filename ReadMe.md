# 🎟️ Tiket Generator

Generate personalized ticket images with sequential numbers, then compile them into a print-ready A4 PDF. Built with Node.js, Sharp, PDF-lib, and ready to run via CLI or Docker.

---

## 🧩 Features

- Generate ticket images in batches using a template
- Customizable text position, font, color, and prefix
- Automatic PDF layout generation (2×5 grid per page)
- Fully configurable via `config.json`
- Docker-compatible and easy to share

---

## ⚙️ Configuration (`config.json`)

```json
{
  "positions": [
    { "x": 180, "y": 400 },
    { "x": 790, "y": 400 }
  ],
  "fontSize": 64,
  "fontFamily": "Redressed",
  "color": "#000000",
  "fontPath": "./fonts/Redressed.ttf",
  "inputFolder": "./input/images",
  "outputFolder": "./output",
  "templateFile": "template.jpg"
}
```

---
## 🚀 CLI Usage
    
```
npx tsx cli.ts --count 400 --prefix tiket --pdf
```
- count: number of images to generate

- prefix: output filename prefix (e.g. tiket-001.png)

- pdf: optional flag to generate a combined tickets.pdf

---
## 📄 Output
- Images: generated into output/ folder

- PDF: laid out as 2 columns × 5 rows per A4 page

- Image size is auto-detected from metadata

---
## ✨ Future Ideas
- Add logo or QR to each ticket
- Web UI for non-technical users
- Custom page size / DPI
- Select number range (e.g. 101–150)

---
This project was originally built for personal use, but feel free to try it or contribute. Cheers! 🍻

