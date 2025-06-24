"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigGenerate = void 0;
exports.geneatePdfFromImages = geneatePdfFromImages;
exports.generateImages = generateImages;
const canvas_1 = require("canvas");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const pdf_lib_1 = require("pdf-lib");
class ConfigGenerate {
    constructor(size, config) {
        Object.defineProperty(this, "canvas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ctx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.canvas = (0, canvas_1.createCanvas)(size.width, size.height);
        this.ctx = this.canvas.getContext('2d');
        this.config = config;
        this.init();
    }
    async init() {
        const fontPath = path_1.default.resolve(__dirname, '..', this.config.fontPath);
        const inputPath = path_1.default.resolve(__dirname, '..', this.config.inputFolder);
        const outputPath = path_1.default.resolve(__dirname, '..', this.config.outputFolder);
        await Promise.all([
            fs_extra_1.default.ensureDir(inputPath),
            fs_extra_1.default.ensureDir(outputPath),
            fs_extra_1.default.ensureDir(path_1.default.dirname(fontPath))
        ]);
        (0, canvas_1.registerFont)(fontPath, { family: this.config.fontFamily });
    }
    static async getInstance() {
        if (!this.instance) {
            const config = await fs_extra_1.default.readJson(path_1.default.resolve(__dirname, '..', 'config.json'));
            const templatePath = path_1.default.resolve(__dirname, '..', config.inputFolder, config.templateFile);
            const { width, height } = await (0, sharp_1.default)(templatePath).metadata();
            if (!width || !height)
                throw new Error('❌ Failed to read template image size');
            this.instance = new ConfigGenerate({ width, height }, config);
        }
        return this.instance;
    }
    renderText(text) {
        const { ctx, canvas, config } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = config.color;
        ctx.font = `${config.fontSize}px "${config.fontFamily}"`;
        ctx.textBaseline = 'top';
        ctx.fillText(text, 0, 0);
        return canvas.toBuffer('image/png');
    }
}
exports.ConfigGenerate = ConfigGenerate;
async function geneatePdfFromImages(options) {
    const { folder, output, margin = 106, spacing = 20, dpi = 300 } = options;
    const files = (await fs_extra_1.default.readdir(folder))
        .filter(f => /\.(png|jpe?g)$/i.test(f))
        .sort();
    if (files.length === 0) {
        throw new Error(`Tidak ada gambar di folder ${folder}`);
    }
    const firstImagePath = path_1.default.join(folder, files[0]);
    const { width: imgW = 1000, height: imgH = 500 } = await (0, sharp_1.default)(firstImagePath).metadata();
    const A4_WIDTH = 2480;
    const A4_HEIGHT = 3508;
    const cols = Math.floor((A4_WIDTH - margin * 2 + spacing) / (imgW + spacing));
    const rows = Math.floor((A4_HEIGHT - margin * 2 + spacing) / (imgH + spacing));
    const perPage = cols * rows;
    const pdfDoc = await pdf_lib_1.PDFDocument.create();
    for (let pageIndex = 0; pageIndex < Math.ceil(files.length / perPage); pageIndex++) {
        const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
        const batch = files.slice(pageIndex * perPage, (pageIndex + 1) * perPage);
        for (let i = 0; i < batch.length; i++) {
            const file = batch[i];
            const imgPath = path_1.default.join(folder, file);
            const imageBuffer = await fs_extra_1.default.readFile(imgPath);
            const embeddedImg = await pdfDoc.embedPng(imageBuffer);
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = margin + col * (imgW + spacing);
            const y = A4_HEIGHT - margin - (row + 1) * (imgH + spacing) + spacing;
            page.drawImage(embeddedImg, {
                x,
                y,
                width: imgW,
                height: imgH
            });
        }
    }
    const pdfBytes = await pdfDoc.save();
    await fs_extra_1.default.writeFile(output, pdfBytes);
    console.log(`📄 PDF selesai dibuat: ${output}`);
}
async function generateImages(options) {
    const { count, prefix = '' } = options;
    const configPath = path_1.default.resolve(__dirname, '..', 'config.json');
    const config = await fs_extra_1.default.readJson(configPath);
    const templatePath = path_1.default.resolve(__dirname, '..', config.inputFolder, config.templateFile);
    const instance = await ConfigGenerate.getInstance();
    for (let i = 0; i < count; i++) {
        const number = (i + 1).toString().padStart(3, '0');
        const outputFile = prefix ? `${prefix}-${number}.png` : `${number}.png`;
        const outputPath = path_1.default.resolve(__dirname, '..', config.outputFolder, outputFile);
        const textBuffer = instance.renderText(number);
        const composite = config.position.map((pos) => ({
            input: textBuffer,
            left: pos.x,
            top: pos.y
        }));
        const result = await (0, sharp_1.default)(templatePath).composite(composite).png().toBuffer();
        await fs_extra_1.default.writeFile(outputPath, result);
        console.log(`✅ ${outputFile} dibuat`);
    }
}
