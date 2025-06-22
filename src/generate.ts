import { ConfigGenerate } from './sample'
import { Command } from 'commander'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs-extra'

const program = new Command()
program
  .option('-c, --count <number>', 'Jumlah gambar', '10')
  .option('-p, --prefix <text>', 'Prefix nama file', '')
  .parse(process.argv)

const { count, prefix } = program.opts()
const total = parseInt(count)

if (isNaN(total) || total <= 0) {
  console.error('🚫 Harus pakai jumlah yang valid, contoh: --count 100')
  process.exit(1)
}

const configPath = path.resolve(__dirname, '..', 'config.json');

(async () => {
  const config = await fs.readJson(configPath)
  console.log(path.resolve(__dirname, '..', config.inputFolder, 'template.jpg'))
  const templatePath = path.resolve(__dirname, '..', config.inputFolder, 'template.jpg')


  const instance = await ConfigGenerate.getInstance()

  for (let i = 0; i < total; i++) {
    const number = (i + 1).toString().padStart(3, '0')
    const outputFile = prefix ? `${prefix}-${number}.png` : `${number}.png`
    const outputPath = path.resolve(__dirname, '..', config.outputFolder, outputFile)

    const textBuffer = instance.renderText(number)

    const composite = config.position.map((pos: any) => ({
      input: textBuffer,
      left: pos.x,
      top: pos.y
    }))

    const result = await sharp(templatePath).composite(composite).png().toBuffer()
    await fs.writeFile(outputPath, result)

    console.log(`✅ ${outputFile} dibuat`)
  }
})()
