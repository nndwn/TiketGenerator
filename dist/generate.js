"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sample_1 = require("./sample");
const commander_1 = require("commander");
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const program = new commander_1.Command();
program
    .option('-c, --count <number>', 'Jumlah gambar', '10')
    .option('-p, --prefix <text>', 'Prefix nama file', '')
    .parse(process.argv);
const { count, prefix } = program.opts();
const total = parseInt(count);
if (isNaN(total) || total <= 0) {
    console.error('🚫 Harus pakai jumlah yang valid, contoh: --count 100');
    process.exit(1);
}
const configPath = path_1.default.resolve(__dirname, '..', 'config.json');
(async () => {
    const config = await fs_extra_1.default.readJson(configPath);
    console.log(path_1.default.resolve(__dirname, '..', config.inputFolder, 'template.jpg'));
    const templatePath = path_1.default.resolve(__dirname, '..', config.inputFolder, 'template.jpg');
    const instance = await sample_1.ConfigGenerate.getInstance();
    for (let i = 0; i < total; i++) {
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
})();
