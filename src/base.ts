import { Canvas, CanvasRenderingContext2D, createCanvas, registerFont } from 'canvas'
import fs from 'fs-extra'
import path from 'path'
import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'

export class ConfigGenerate {
  canvas: Canvas
  ctx: CanvasRenderingContext2D
  config: Config
  static instance: ConfigGenerate

  private constructor(size: Size, config: Config) {
    this.canvas = createCanvas(size.width, size.height)
    this.ctx = this.canvas.getContext('2d')
    this.config = config

    this.init()
  }

private async init() {
    const fontPath = path.resolve(__dirname, '..', this.config.fontPath)
    const inputPath = path.resolve(__dirname, '..', this.config.inputFolder)
    const outputPath = path.resolve(__dirname, '..', this.config.outputFolder)

    await Promise.all([
      fs.ensureDir(inputPath),
      fs.ensureDir(outputPath),
      fs.ensureDir(path.dirname(fontPath))
    ])

    registerFont(fontPath, { family: this.config.fontFamily })
  }

  static async getInstance(): Promise<ConfigGenerate> {
    if (!this.instance) {
      const config = await fs.readJson(path.resolve(__dirname, '..', 'config.json'))
      const templatePath = path.resolve(__dirname, '..', config.inputFolder, config.templateFile)

      const { width, height } = await sharp(templatePath).metadata()
      if (!width || !height) throw new Error('❌ Failed to read template image size')

      this.instance = new ConfigGenerate({ width, height }, config)
    }
    return this.instance
  }

  renderText(text: string): Buffer {
    const { ctx, canvas, config } = this
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = config.color
    ctx.font = `${config.fontSize}px "${config.fontFamily}"`
    ctx.textBaseline = 'top'
    ctx.fillText(text, 0, 0)
    return canvas.toBuffer('image/png')
  }
}


export async function geneatePdfFromImages(options: {
  folder: string,
  output: string,
  margin?: number,
  spacing?: number
  dpi?: number
}) {
  const {
    folder,
    output,
    margin = 106,
    spacing = 20,
    dpi = 300
  } = options

  const files = (await fs.readdir(folder))
    .filter(f => /\.(png|jpe?g)$/i.test(f))
    .sort()

  if (files.length === 0) {
    throw new Error(`Tidak ada gambar di folder ${folder}`)
  }

  const firstImagePath = path.join(folder, files[0])
  const { width: imgW = 1000, height: imgH = 500 } = await sharp(firstImagePath).metadata()

  const A4_WIDTH = 2480
  const A4_HEIGHT = 3508

  const cols = Math.floor((A4_WIDTH - margin * 2 + spacing) / (imgW + spacing))
  const rows = Math.floor((A4_HEIGHT - margin * 2 + spacing) / (imgH + spacing))
  const perPage = cols * rows

  const pdfDoc = await PDFDocument.create()
  for (let pageIndex = 0; pageIndex < Math.ceil(files.length / perPage); pageIndex++) {
    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT])
    const batch = files.slice(pageIndex * perPage, (pageIndex + 1) * perPage)

    for (let i = 0; i < batch.length; i++) {
      const file = batch[i]
      const imgPath = path.join(folder, file)
      const imageBuffer = await fs.readFile(imgPath)
      const embeddedImg = await pdfDoc.embedPng(imageBuffer)

      const col = i % cols
      const row = Math.floor(i / cols)
      const x = margin + col * (imgW + spacing)
      const y = A4_HEIGHT - margin - (row + 1) * (imgH + spacing) + spacing

      page.drawImage(embeddedImg, {
        x,
        y,
        width: imgW,
        height: imgH
      })
    }
  }
  const pdfBytes = await pdfDoc.save()
  await fs.writeFile(output, pdfBytes)
  console.log(`📄 PDF selesai dibuat: ${output}`)
}

export async function generateImages(options: {
  count: number
  prefix?: string
}) {
  const { count, prefix = '' } = options
  const configPath = path.resolve(__dirname, '..', 'config.json')
  const config = await fs.readJson(configPath)
  const templatePath = path.resolve(__dirname, '..', config.inputFolder, config.templateFile)

  const instance = await ConfigGenerate.getInstance()

  for (let i = 0; i < count; i++) {
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
}