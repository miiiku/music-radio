/**
 * 歌词格式化
 * @param lrcs 
 * @returns 
 */
export const formatLrc = (lrcs: string): Array<Lrc> => {
  return lrcs.split("\n").filter((row: string) => row.trim()).map((row: string, index: number) => {
    let chunk = row.replace('[', '').split(']')
    let times = chunk[0].split(':')
    return {
      time: Number(times[0]) * 60 + parseFloat(times[1]),
      text: chunk[1]
    }
  })
}

/**
 * 16进制转rgb
 * @param color 
 * @returns 
 */
export const colorToRGB = (color: string) => {
  if (color.length !== 7 && !color.startsWith('#')) {
    return [0, 0, 0]
  }

  const rgb = []

  color = color.replace('#', '')
  
  for (let i = 0; i < 3; i++) {
    rgb.push(parseInt(color.substring(i * 2, i * 2 + 2), 16))
  }

  return rgb
}