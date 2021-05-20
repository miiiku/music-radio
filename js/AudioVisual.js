class AudioVisual {
  constructor (options) {
    this.canvas = document.querySelector('#music-canvas')
    this.ctx = this.canvas.getContext('2d')

    this.ac = new AudioContext()
    this.analyser = this.ac.createAnalyser()
    this.analyser.fftSize = 128
    this.analyser.connect(this.ac.destination)

    this.sourceDuration = 0
    this.startTime = 0
    this.loaded = true

    this.defaultSetting = {
      centerX: 0.5,
      centerY: 0.7,
      lineWidth: 6,
      lineSpacing: 2,
      lineColor: '#e93b81',
      lineColorO: 1,
      shadowColor: '#231018',
      shadowColorO: 1,
      shadowBlur: 2,
      isRound: true
    }
    this.opt = Object.assign({}, this.defaultSetting, options)

    this.handleEvent()
    this.resizeCavnas()

    window.addEventListener('resize', this.resizeCavnas.bind(this))
  }

  colorToRGB (color) {
    if (color.length !== 7 && !color.startsWith('#')) return [0, 0, 0]
    let rgb = []
    color = color.replace('#', '')
    for (let i = 0; i < 3; i++) {
      rgb.push(parseInt(color.substring(i * 2, i * 2 + 2), 16))
    }
    return rgb
  }

  handleEvent () {
    eventBus.emit('echosetting', this.defaultSetting)
    eventBus.on('setting', data => {
      this.opt = Object.assign({}, this.opt, data)
    })
  }

  async loadData (music) {
    eventBus.emit('init', music)
    eventBus.emit('change', {
      state: "loading",
      duration: "00.00",
      currentTime: "00.00",
    })

    this.loaded = false

    let result = await fetch(music.url).catch(error => console.log(error)) || {}

    if (!result.ok) {
      this.loaded = true
      eventBus.emit('change', {
        state: "error",
        duration: "T_T",
        currentTime: "T_T",
      })
      return alert("初始化数据失败，请尝试刷新页面（◔‸◔）")
    }

    let ab = await result.arrayBuffer().catch(error => console.log(error))

    if (!ab) return

    let { ac, analyser } = this
    this.source = ac.createBufferSource()
    ac.decodeAudioData(ab, buffer => {
      this.source.buffer = buffer
      this.source.connect(analyser)
      this.source.start(0)
      this.source.onended = () => {
        this.onended && this.onended()
      }
      this.loaded = true
      this.startTime = ac.currentTime
      this.refreshUI()
    }, error => {
      console.log(error)
    })
  }

  play (music) {
    let { loaded, source } = this
    if (!loaded) return alert('正在努力加载中，请骚等。')
    if (source) {
      source.onended = null
      source.stop()
      source = null
    }
    this.loadData(music)
  }

  togglePlay () {
    const { ac } = this
    if (ac.state === 'running') {
      return ac.suspend()
    }
    if (ac.state === 'suspended') {
      return ac.resume()
    }
  }

  resizeCavnas () {
    const { canvas } = this
    this.cw = canvas.width = canvas.clientWidth
    this.ch = canvas.height = canvas.clientHeight
  }

  draw () {
    const { ctx, cw, ch, analyser } = this
    const { lineColor, lineColorO, shadowColor, shadowColorO, shadowBlur, lineWidth, lineSpacing, isRound } = this.opt

    let bufferLen = analyser.frequencyBinCount
    let buffer = new Uint8Array(bufferLen)
    analyser.getByteFrequencyData(buffer)

    let cx = this.cw * this.opt.centerX
    let cy = this.ch * this.opt.centerY
    let sp = (lineWidth + lineSpacing) / 2
    
    ctx.clearRect(0, 0, cw, ch)
    ctx.beginPath()
    ctx.lineWidth = lineWidth
    ctx.shadowBlur = shadowBlur
    ctx.strokeStyle = `rgba(${this.colorToRGB(lineColor).join(',')}, ${lineColorO})`
    ctx.shadowColor = `rgba(${this.colorToRGB(shadowColor).join(',')}, ${shadowColorO})`
    if (isRound) {
      ctx.lineCap = "round"
    } else {
      ctx.lineCap = "butt"
    }
  
    for (let i = 0; i < bufferLen; i++) {
      let h = buffer[i] + 1
      let xl = cx - i * (lineWidth + lineSpacing) - sp
      let xr = cx + i * (lineWidth + lineSpacing) + sp
      let y1 = cy - h / 2
      let y2 = cy + h / 2
      ctx.moveTo(xl, y1)
      ctx.lineTo(xl, y2)
      ctx.moveTo(xr, y1)
      ctx.lineTo(xr, y2)
    }

    ctx.stroke()
    ctx.closePath()
  }

  refreshUI () {
    const { ac: { state, currentTime }, source, loaded, startTime } = this
    this.draw()
    try {
      if (state === 'running' && loaded) {
        eventBus.emit('change', {
          state,
          duration: source.buffer.duration,
          currentTime: currentTime - startTime,
        })
      }
    } catch (error) {
      console.log(error)
    }
    requestAnimationFrame(this.refreshUI.bind(this))
  }
}