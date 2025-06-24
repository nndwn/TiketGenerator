"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const base_1 = require("./base");
const path_1 = __importDefault(require("path"));
const program = new commander_1.Command();
program
    .option('-c, --count <number>', 'Jumlah gambar', '10')
    .option('-p, --prefix <text>', 'Prefix nama file', '')
    .option('--pdf', 'Buat PDF setelah generate gambar')
    .parse(process.argv);
const options = program.opts();
const count = parseInt(options.count);
const prefix = options.prefix;
const doPdf = options.pdf;
if (isNaN(count) || count <= 0) {
    console.error('⚠️  --count harus berupa angka > 0');
    process.exit(1);
}
;
(async () => {
    await (0, base_1.generateImages)({ count, prefix });
    if (doPdf) {
        console.log("wait prosess to pdf");
        await (0, base_1.geneatePdfFromImages)({
            folder: path_1.default.resolve(__dirname, '..', 'output'),
            output: path_1.default.resolve(__dirname, '..', 'tickets.pdf'),
            margin: 100,
            spacing: 20
        });
    }
})();
