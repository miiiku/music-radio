window.onload = async function () {

  window.eventBus = {
    events: {},
    on (event, fn) {
      if (!this.events[event]) {
        this.events[event] = []
      }
      this.events[event].push(fn)
    },
    emit() {
      let e = this.events[[].shift.call(arguments)]
      if (!e || e.length < 1) return
      e.forEach(fn => {
        fn.apply(this, arguments)
      })
    }
  }

  let result = await fetch('https://qiniu.sukoshi.xyz/cloud-music/song.json')

  if (!result.ok) {
    console.log(result)
    return alert('获取歌曲信息失败！')
  }

  const PLAY_LIST = await result.json()

  console.log(PLAY_LIST)

  // const music = PLAY_LIST[Math.floor(Math.random() * PLAY_LIST.length)]
  let i = 0

  dv = new DomVisual([
    'https://qiniu.sukoshi.xyz/src/images/68135789_p0.jpg',
    'https://qiniu.sukoshi.xyz/src/images/68686407_p0.jpg',
    'https://qiniu.sukoshi.xyz/src/images/banner-1.jpg',
  ])
  av = new AudioVisual()
  av.onended = playNext

  eventBus.on('play', () => {
    if (av.source) {
      av.togglePlay()
    } else {
      av.play(PLAY_LIST[i])
    }
  })
  eventBus.on('prev', playPrev)
  eventBus.on('next', playNext)

  function playPrev () {
    i -= 1
    if (i < 0) i = PLAY_LIST.length - 1
    av.play(PLAY_LIST[i])
  }

  function playNext () {
    i += 1
    if (i >= PLAY_LIST.length) i = 0
    av.play(PLAY_LIST[i])
  }
}