class DomVisual {
  constructor (bgs) {
    this.domTextMap = new Map()
    this.domInputMap = new Map()
    this.domControlMap = new Map()
    this.domContainerMap = new Map()

    this.domTextSelector = [
      '#song-title',
      '#info-state', '#info-duration', '#info-current-time',
      '#time-minute', '#time-second',
    ]
    this.domInputSelector = [
      '#centerX', '#centerY', '#lineWidth', '#lineSpacing', '#lineColor',
      '#shadowColor', '#lineColorO', '#shadowColor', '#shadowColorO',
      '#shadowBlur',
      '#isRoundY', '#isRoundN'
    ]
    this.domControlSelector = [
      {
        selector: '#setting-menu',
        event: {
          click: () => {
            let dom = this.getContainerDom('#setting-wrap')
            dom.classList.toggle('show')
            dom.classList.toggle('hide')
          }
        }
      },
      {
        selector: '#setting-close',
        event: {
          click: () => {
            let dom = this.getContainerDom('#setting-wrap')
            dom.classList.remove('show')
            dom.classList.add('hide')
          }
        }
      },
      {
        selector: '#playBtn',
        event: {
          click: () => {
            this.removePlayAnimation()
            eventBus.emit('play')
          }
        }
      },
      {
        selector: '#prevBtn',
        event: {
          click: () => {
            this.removePlayAnimation()
            eventBus.emit('prev')
          }
        }
      },
      {
        selector: '#nextBtn',
        event: {
          click: () => {
            this.removePlayAnimation()
            eventBus.emit('next')
          }
        }
      }
    ]
    this.domContainerSelector = ['#bg', '#info-cover', '#music-lrc', '#setting-wrap']
    
    this.af = null
    this.bgs = bgs || []
    this.lrcList = []
    this.lrcIndex = 0
    this.lrcRowH = 30
    this.findDom('domTextSelector', 'domTextMap')
    this.findDom('domInputSelector', 'domInputMap')
    this.findDom('domControlSelector', 'domControlMap')
    this.findDom('domContainerSelector', 'domContainerMap')
    this.handleInit()
    this.handleChange()
    this.bindInputChange()
    this.loadBG()
    
    eventBus.on('echosetting', data => {
      for (let item of this.domInputMap) {
        /** 对 radio 特殊处理 */
        if (item[0].startsWith('#isRound')) {
          let v = data['isRound']
          let key = `#isRound${v ? 'Y' : 'N'}`
          if (item[0] === key) {
            item[1].checked = true
          }
        } else {
          item[1].value = data[item[0].replace('#', '')]
        }
      }
    })
  }

  removePlayAnimation (dom) {
    let d = dom || this.getControlDom('#playBtn')
    if (d.classList.contains('animation')) {
      d.classList.remove('animation')
    }
  }

  handleChange () {
    eventBus.on('change', ({ state, duration, currentTime }) => {
      this.setDomText('#info-state', state)
      let durationFormat = parseFloat(duration).toFixed(2)
      let currentTimeFormat = parseFloat(currentTime).toFixed(2)
      if (isNaN(duration) || isNaN(currentTimeFormat)) {
        this.setDomText('#info-duration', duration)
        this.setDomText('#info-current-time', currentTime)
        this.setDomText('#time-minute', '00')
        this.setDomText('#time-second', '00')
      } else {
        this.setDomText('#info-duration', durationFormat)
        this.setDomText('#info-current-time', currentTimeFormat)
        let remainTime = parseInt(duration - currentTime)
        this.setDomText('#time-minute', this.add0(Math.max(Math.floor(remainTime / 60), 0)))
        this.setDomText('#time-second', this.add0(Math.max(remainTime % 60, 0)))
        if (currentTime >= this.nextLrcTime()) {
          this.nextLrc()
        }
      }
    })
  }

  handleInit () {
    eventBus.on('init', ({ title, cover, lrc }) => {
      this.initSongInfo ({ title, cover })
      this.loadData (lrc)
    })
  }

  bindInputChange () {
    for (let item of this.domInputMap) {
      (function (key, dom) {
        dom.addEventListener('input', e => {
          let { type, value } = e.target
          if (type === 'range') {
            value = parseFloat(value)
          }
          if (type === 'radio' && key.startsWith('isRound')) {
            key = 'isRound'
            value = value === '0' ? false : true
          }
          if (key === 'lineColor') {
            document.documentElement.style.setProperty('--theme-color', value)
          }
          eventBus.emit('setting', { [key]: value })
        }, false)
      })(item[0].replace('#', '').replace('.', ''), item[1])
    }
  }

  findDom (domSelector, domMap) {
    if (this[domSelector].length < 1) return
    if (!this[domMap]) return
    this[domSelector].forEach(selector => {
      let type = Object.prototype.toString.call(selector)
      if (type === '[object String]') {
        this[domMap].set(selector, document.querySelector(selector))
      }
      if (type === '[object Object]') {
        let dom = document.querySelector(selector.selector)
        if (!dom) return
        this[domMap].set(selector.selector, dom)
        if (selector.event && Object.keys(selector.event).length > 0) {
          for (let key in selector.event) {
            dom.addEventListener(key, selector.event[key])
          }
        }
      }
    })
  }

  setDomText (selector, value) {
    let dom = this.domTextMap.get(selector)
    if (!dom) return
    dom.innerText = value
  }

  getContainerDom (selector) {
    return this.getDom(selector, this.domContainerMap)
  }

  getControlDom (selector) {
    return this.getDom(selector, this.domControlMap)
  }

  getDom (selector, domMap) {
    return domMap.get(selector) || null
  }

  initSongInfo ({ title, cover }) {
    this.lrcList = []
    this.lrcIndex = 0
    this.setDomText('#song-title', title)
    this.setDomText('#info-state', 'undefined')
    this.setDomText('#info-duration', '00.00')
    this.setDomText('#info-current-time', '00.00')
    this.setDomText('#time-minute', '00')
    this.setDomText('#time-second', '00')
    this.getContainerDom('#info-cover').style = `background-image: url(${cover});`
  }

  loadBG () {
    if (this.bgs.length < 1) return
    let index = Math.floor(Math.random() * this.bgs.length)
    let image = this.bgs[index]
    this.getContainerDom('#bg').style = `background-image: url(${image});`
  }

  async loadData (url) {
    if (!url) {
      this.lrcList = [[0, '当前歌曲暂无歌词，闭上眼睛静静聆听～']]
      this.initLrcDom()
      return
    }
    if (this.af) {
      this.af.abort()
      this.af = null
    }
    this.af = AbortFetch()
    let list = [], text = await this.af.fetch(url)
      .then(result => result.text())
      .catch(({ name }) => {
        if (name === 'AbortError') return console.log('cancel')
        list.push([0, '加载歌词出错，我也不知道问题出在哪里(⑉･̆-･̆⑉)'])
      })
    text && text.split('\n').forEach(row => {
      if (!row.includes('[')) return
      let chunk = row.replace('[', '').split(']')
      let times = chunk[0].split(':')
      list.push([times[0] * 60 + parseFloat(times[1] + ''), chunk[1]])
    })
    this.lrcList = list
    this.initLrcDom()
  }

  initLrcDom () {
    const { lrcIndex, lrcList } = this
    let lrcContainer = this.getContainerDom('#music-lrc')
    let df = document.createDocumentFragment()
    lrcContainer.innerHTML = ""
    for (let i = 0; i < lrcList.length; i++) {
      let row = lrcList[i]
      let p = document.createElement('p')
      p.dataset.time = row[0]
      p.innerText = row[1]
      if (i === lrcIndex) p.classList.add('current')
      df.appendChild(p)
      lrcContainer.appendChild(df)
    }
    this.rollLrc()
  }

  currentLrc () {
    const { lrcIndex, lrcList } = this
    return lrcList[lrcIndex]
  }

  nextLrcTime () {
    const { lrcIndex, lrcList } = this
    let end = lrcList.length - 1
    let nextIndex = lrcIndex + 1
    if (nextIndex >= end || end < 0 ) return null
    return lrcList[nextIndex][0]
  }

  nextLrc () {
    const { lrcIndex, lrcList } = this
    if (lrcIndex >= lrcList.length - 1) return
    let lrcContainer = this.getContainerDom('#music-lrc')
    this.lrcIndex = this.lrcIndex + 1
    lrcContainer.querySelectorAll('p').forEach((p, index) => {
      if (index !== this.lrcIndex) {
        p.classList.remove('current')
      } else {
        p.classList.add('current')
      }
    })
    this.rollLrc()
  }
  
  add0 (n) {
    return n > 9 ? n : `0${n}`
  }

  rollLrc () {
    const { lrcIndex, lrcRowH } = this
    let lrcContainer = this.getContainerDom('#music-lrc')
    if (lrcIndex === 0) {
      lrcContainer.style = `transform: translateY(${lrcRowH}px)`
    } else {
      let y = (lrcIndex - 1) * lrcRowH
      lrcContainer.style = `transform: translateY(-${y}px)`
    }
  }
}