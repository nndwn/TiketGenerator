"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigGenerate = void 0;
const canvas_1 = require("canvas");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
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
        (0, canvas_1.registerFont)(fontPath, { family: this.config.fontFamily });
        await fs_extra_1.default.ensureDir(path_1.default.resolve(__dirname, '..', this.config.outputFolder));
    }
    static async getInstance() {
        if (!this.instance) {
            const config = await fs_extra_1.default.readJson(path_1.default.resolve(__dirname, '..', 'config.json'));
            const templatePath = path_1.default.resolve(__dirname, '..', config.inputFolder, config.templateFile ?? 'template.jpg');
            const { width, height } = await (0, sharp_1.default)(templatePath).metadata();
            if (!width || !height) {
                throw new Error(`❌ Gagal membaca ukuran dari ${templatePath}`);
            }
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
