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
    this.loading = false
    this.started = false
    this.songInfo = null
    this.af = null

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

  async loadData () {
    const { songInfo } = this

    if (this.af) {
      this.af.abort()
      this.af = null
    }

    this.af = AbortFetch()
    this.loading = true

    eventBus.emit('init', songInfo)
    eventBus.emit('change', {
      state: "loading",
      duration: "00.00",
      currentTime: "00.00",
    })

    let ab = await this.af.fetch(songInfo.url)
      .then(result => result.arrayBuffer())
      .catch(({ name }) => {
        if (name === 'AbortError') return console.log('cancel')
        this.loading = false
        eventBus.emit('change', {
          state: "error",
          duration: "T_T",
          currentTime: "T_T",
        })
        return alert("初始化数据失败，请尝试刷新页面（◔‸◔）")
      })

    if (!ab) return
    /** 可能会出现在取消请求的时候请求已经请求成功，这里对比一下播放的资源是否一致 */
    if (songInfo.url !== this.songInfo.url) return

    let { ac, analyser } = this
    this.source = ac.createBufferSource()
    ac.decodeAudioData(ab, buffer => {
      /**
       * 可能会出现在解析AudioDta的时候切换了资源，这里对比一下播放的资源是否一致
       * 在decodeAudioData的时候，可能切换了资源，会调用stop函数，这里source可能会出现为null
       */
      if (songInfo.url !== this.songInfo.url || !this.source) return
      this.source.buffer = buffer
      this.source.connect(analyser)
      this.source.start(0)
      this.source.onended = () => {
        this.onended && this.onended()
      }
      this.loading = false
      this.started = true
      this.startTime = ac.currentTime
      this.refreshUI()
    }, error => {
      console.log(error)
    })
  }

  stop () {
    let { source, started } = this
    if (source && started) {
      source.onended = null
      source.stop()
    }
    this.source = null
    this.started = false
  }

  play (music, isReload = true) {
    if (!isReload && this.loading) return console.log("loading...")
    this.songInfo = music
    this.stop()
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
    const { ac: { state, currentTime }, source, loading, started, startTime } = this
    this.draw()
    try {
      if (state === 'running' && !loading && started) {
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