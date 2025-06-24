import { Command } from 'commander'
import { geneatePdfFromImages, generateImages } from './base'
import path from 'path'

const program = new Command()

program
  .option('-c, --count <number>', 'Jumlah gambar', '10')
  .option('-p, --prefix <text>', 'Prefix nama file', '')
  .option('--pdf', 'Buat PDF setelah generate gambar')
  .parse(process.argv)

const options = program.opts()
const count = parseInt(options.count)
const prefix = options.prefix
const doPdf = options.pdf

if (isNaN(count) || count <= 0) {
  console.error('⚠️  --count harus berupa angka > 0')
  process.exit(1)
};

(async () => {
  await generateImages({ count, prefix })
  
  if (doPdf) {
    console.log("wait prosess to pdf")
    await geneatePdfFromImages({
      folder: path.resolve(__dirname, '..', 'output'),
      output: path.resolve(__dirname, '..', 'tickets.pdf'),
      margin: 100,
      spacing: 20
    })
  }
})()
