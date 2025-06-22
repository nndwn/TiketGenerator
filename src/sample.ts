import { Canvas, CanvasRenderingContext2D, createCanvas, registerFont } from 'canvas'
import fs from 'fs-extra'
import path from 'path'
import sharp from 'sharp'

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
    registerFont(fontPath, { family: this.config.fontFamily })

    await fs.ensureDir(path.resolve(__dirname, '..', this.config.outputFolder))
  }

static async getInstance(): Promise<ConfigGenerate> {
  if (!this.instance) {
    const config: Config = await fs.readJson(path.resolve(__dirname, '..', 'config.json'))
    const templatePath = path.resolve(__dirname, '..', config.inputFolder, config.templateFile ?? 'template.jpg')

    const { width, height } = await sharp(templatePath).metadata()
    if (!width || !height) {
      throw new Error(`❌ Gagal membaca ukuran dari ${templatePath}`)
    }

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
