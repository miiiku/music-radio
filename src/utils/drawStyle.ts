import { colorToRGB } from './index';

const setBarStyle = (ctx: CanvasRenderingContext2D, opt: CanvasSetting) => {
  const {
    barWidth,
    barColor,
    barColorO,
    barShadowColor,
    barShadowColorO,
    barShadowBlur,
    isEnableRound,
    isEnableShadow,
  } = opt

  ctx.lineWidth = barWidth
  ctx.strokeStyle = `rgba(${colorToRGB(barColor).join(',')}, ${barColorO})`

  if (isEnableRound) {
    ctx.lineCap = 'round'
  } else {
    ctx.lineCap = 'butt'
  }
  
  if (isEnableShadow) {
    ctx.shadowBlur = barShadowBlur
    ctx.shadowColor = `rgba(${colorToRGB(barShadowColor).join(',')}, ${barShadowColorO})`
  }
}

const setLineStyle = (ctx: CanvasRenderingContext2D, opt: CanvasSetting) => {
  const {
    lineWidth,
    lineColor,
    lineColorO,
    lineShadowColor,
    lineShadowColorO,
    lineShadowBlur,
    isEnableShadow,
  } = opt

  ctx.lineWidth = lineWidth
  ctx.strokeStyle = `rgba(${colorToRGB(lineColor).join(',')}, ${lineColorO})`
    
  if (isEnableShadow) {
    ctx.shadowBlur = lineShadowBlur
    ctx.shadowColor = `rgba(${colorToRGB(lineShadowColor).join(',')}, ${lineShadowColorO})`
  }
}

export const drawStyle1 = (
  canvasWidth: number,
  canvasHeight: number,
  maxValue: number,
  boundValue: number,
  ctx: CanvasRenderingContext2D,
  opt: CanvasSetting,
  data: Uint8Array
) => {
  const {
    barWidth,
    barColor,
    barColorO,
    barShadowColor,
    barShadowColorO,
    barShadowBlur,

    lineWidth,
    lineColor,
    lineColorO,
    lineShadowColor,
    lineShadowColorO,
    lineShadowBlur,

    isEnableShadow,
    isEnableRound,
    isEnableBasicHeight,
  } = opt

  let cy = canvasHeight * 0.5
  let rh = cy / maxValue
  let barSp = Math.max((canvasWidth - barWidth * data.length) / data.length, 0)
  let lineSp = Math.max(canvasWidth / data.length, 0)

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = barWidth
  ctx.strokeStyle = `rgba(${colorToRGB(barColor).join(',')}, ${barColorO})`
  
  if (isEnableShadow) {
    ctx.shadowBlur = barShadowBlur
    ctx.shadowColor = `rgba(${colorToRGB(barShadowColor).join(',')}, ${barShadowColorO})`
  }

  if (isEnableRound) {
    ctx.lineCap = "round"
  } else {
    ctx.lineCap = "butt"
  }

  data.forEach((value, index) => {
    let valueH = Math.min(value, maxValue)
    let drawH = Math.max(valueH * rh - boundValue, isEnableBasicHeight ? 1 : 0)
    let x = index * (barWidth + barSp) + (barWidth + barSp) / 2
    ctx.moveTo(x, cy)
    ctx.lineTo(x, cy - drawH)
  })

  ctx.stroke()
  ctx.closePath()
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = `rgba(${colorToRGB(lineColor).join(',')}, ${lineColorO})`
    
  if (isEnableShadow) {
    ctx.shadowBlur = lineShadowBlur
    ctx.shadowColor = `rgba(${colorToRGB(lineShadowColor).join(',')}, ${lineShadowColorO})`
  }

  data.forEach((value, index) => {
    let valueH = Math.min(value, maxValue)
    let drawH = Math.max(valueH * rh - boundValue, 4)
    let x = index * lineSp + lineSp / 2
    if (index === 0) {
      ctx.moveTo(x, cy + drawH)
    } else {
      ctx.lineTo(x, cy + drawH)
    }
  })

  ctx.stroke()
  ctx.closePath()
  ctx.restore()
}

export const drawStyle2 = (
  canvasWidth: number,
  canvasHeight: number,
  maxValue: number,
  boundValue: number,
  ctx: CanvasRenderingContext2D,
  opt: CanvasSetting,
  data: Uint8Array
) => {
  const {
    barWidth,
    barColor,
    barColorO,
    barShadowColor,
    barShadowColorO,
    barShadowBlur,

    lineWidth,
    lineColor,
    lineColorO,
    lineShadowColor,
    lineShadowColorO,
    lineShadowBlur,

    isEnableRound,
    isEnableShadow,
  } = opt

  let cy = canvasHeight * 0.5
  let sp = Math.max((canvasWidth - barWidth * data.length) / (data.length + 1), 0)
  let ratio = canvasHeight / 2 / maxValue * boundValue

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  /** 画bar */
  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = barWidth
  ctx.strokeStyle = `rgba(${colorToRGB(barColor).join(',')}, ${barColorO})`

  if (isEnableRound) {
    ctx.lineCap = 'round'
  } else {
    ctx.lineCap = 'butt'
  }
  
  if (isEnableShadow) {
    ctx.shadowBlur = barShadowBlur
    ctx.shadowColor = `rgba(${colorToRGB(barShadowColor).join(',')}, ${barShadowColorO})`
  }

  for (let i = 0; i < data.length; i++) {
    let h = Math.max(1, data[i]) * ratio
    let x = i * (barWidth + sp) + sp + barWidth / 2
    ctx.moveTo(x, cy - h)
    ctx.lineTo(x, cy + h)
  }

  ctx.stroke()
  ctx.closePath()
  ctx.restore()

  /** 画line */
  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = `rgba(${colorToRGB(lineColor).join(',')}, ${lineColorO})`
  
  if (isEnableShadow) {
    ctx.shadowBlur = lineShadowBlur
    ctx.shadowColor = `rgba(${colorToRGB(lineShadowColor).join(',')}, ${lineShadowColorO})`
  }

  for (let i = 0; i < data.length; i++) {
    let h = Math.max(1, data[i]) * ratio
    let x = i * (barWidth + sp) + sp + barWidth / 2
    if (i === 0) {
      ctx.moveTo(x, cy - h)
    } else {
      ctx.lineTo(x, cy - h)
    }
  }

  for (let i = 0; i < data.length; i++) {
    let h = Math.max(1, data[i]) * ratio
    let x = i * (barWidth + sp) + sp + barWidth / 2
    if (i === 0) {
      ctx.moveTo(x, cy + h)
    } else {
      ctx.lineTo(x, cy + h)
    }
  }

  ctx.stroke()
  ctx.closePath()
  ctx.restore()
}

export const drawStyle3 = (
  canvasWidth: number,
  canvasHeight: number,
  maxValue: number,
  boundValue: number,
  ctx: CanvasRenderingContext2D,
  opt: CanvasSetting,
  data: Uint8Array 
) => {
  const size = Math.min(canvasWidth, canvasHeight)
  const innerSize = size * 0.6
  const centerX = canvasWidth * 0.5
  const centerY = canvasHeight * 0.5
  const angle = Math.PI / data.length
  const ratio = (size - innerSize) / maxValue

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  ctx.save()
  ctx.translate(centerX, centerY)

  // 调试间距对称代码
  // ctx.beginPath()
  // ctx.arc(0, 0, innerSize / 2 - 2, 0, Math.PI * 2)
  // ctx.stroke()
  // ctx.closePath()

  // ctx.beginPath()
  // const t = Math.PI * 2 / data.length / 2
  // for (let index = 0; index < data.length * 2; index++) {
  //   const rad = index * t - t / 2
  //   ctx.moveTo(0, 0)
  //   ctx.lineTo(
  //     300 * Math.cos(rad),
  //     300 * Math.sin(rad)
  //   )
  // }
  // ctx.stroke()
  // ctx.closePath()

  setBarStyle(ctx, opt)

  data.forEach((value, index) => {
    const valueH = Math.min(value, maxValue)
    const drawH = Math.max(valueH * ratio - boundValue, 1)
    /**
     * Math.PI / 2 逆时针偏移90度，使其从12点方向开始画，极坐标系起始位置在笛卡尔坐标系的90度位置(3点方向)
     * angle / 2 因为左右两边只是对称，两边接触点地方有重叠或者间距叠加，偏移间距一半的弧度使其重合点完全平分对称
     */
    const radian = angle * index - Math.PI / 2 + angle / 2

    /** 极坐标系转换为直角坐标系 */
    const x1 = innerSize / 2 * Math.cos(radian)
    const y1 = innerSize / 2 * Math.sin(radian)
    const x2 = ((innerSize + drawH) / 2) * Math.cos(radian)
    const y2 = ((innerSize + drawH) / 2) * Math.sin(radian)

    ctx.beginPath()
    ctx.moveTo(-x1, y1)
    ctx.lineTo(-x2, y2)
    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.closePath()
  })

  ctx.restore()
}