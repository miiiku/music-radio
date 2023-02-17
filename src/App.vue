<script setup lang="ts">
import { onMounted, ref, reactive, provide, watch, computed } from 'vue';
import { SONG_LIST_KEY, PLAY_MUSIC_KEY, USER_INTERACE_KEY, NEXT_MUSIC_KEY, AUDIO_KEY, PLAYER_KEY } from './constant/injectKey';
import { formatLrc } from './utils/index';
import song from './components/song.vue';
import lrc from './components/lrc.vue';
import spectrum from './components/spectrum.vue';
import control from './components/control.vue';

const player = reactive<Player>({
  status: 'unknown',
  timeupdate: 0,
  duration: 0,
  playIndex: -1,
})

const audioEl = document.createElement('audio')

audioEl.crossOrigin = 'anonymous'

const songList = ref<Array<Song>>()

const isRandom = ref<boolean>(false)

const randomList = ref<Array<number>>([0])

/** 用户是否点击过播放按钮 */
const isUserInterace = ref<boolean>(false)

const fetchSongList = () => {
  fetch(`https://qiniu.sukoshi.xyz/cloud-music/song.json?t=${Date.now()}`)
    .then(res => {
      return res.json()
    })
    .then((data: Array<Song>) => {
      songList.value = data
      // 默认进去第一首歌曲是随机的
      player.playIndex = Math.floor(Math.random() * data.length)
    })
    .catch(error => {
      console.log(error)
    })
}

const fetchSongLrc = () => {
  if (player?.song?.lrc) {
    fetch(player.song.lrc)
      .then(res => {
        return res.text()
      }).then((data: string) => {
        player.lrc = formatLrc(data)
      }).catch(error => {
        console.log(error)
      })
  } else {
    player.lrc = formatLrc("[0:00]当前歌曲暂无歌词，闭上眼睛静静聆听")
  }
}

const fillRandomList = () => {
  randomList.value = songList.value?.map((song, index) => index) || [0]
}

const playMusic = () => {
  if (audioEl.paused) {
    isUserInterace.value = true
    audioEl.play()
  } else {
    audioEl.pause()
  }
}

const nextMusic = () => {
  if (!songList.value?.length) return

  // 随机播放
  if (isRandom.value) {
    if (!randomList?.value?.length) {
      fillRandomList()
    }
    const nextIndex = Math.floor(Math.random() * randomList.value.length - 1)
    player.playIndex = randomList.value.splice(nextIndex, 1)[0]
  } else {
    if (player.playIndex >= songList.value?.length - 1) {
      player.playIndex = 0
    } else {
      player.playIndex += 1
    }
  }
}

const switchAudioUrl = () => {
  if (player?.song?.url) {
    if (player.status === 'play') { audioEl.pause() }
    audioEl.src = player.song.url
    if (isUserInterace.value) { audioEl.play() }
  } 
}

const bindEvent = () => {
  audioEl.addEventListener('timeupdate', () => {
    player.timeupdate = audioEl.currentTime
  })

  audioEl.addEventListener('canplay', () => {

  })

  audioEl.addEventListener('ended', () => {
    player.status = 'ended'
  })

  audioEl.addEventListener('pause', () => {
    player.status = 'pause'
  })

  audioEl.addEventListener('play', () => {
    player.status = 'play'
  })

  audioEl.addEventListener('playing', () => {
    player.status = 'playing'
  })

  audioEl.addEventListener('waiting', () => {
    player.status = 'waiting'
  })
}

const bgStyle = computed(() => {
  if (player.song) {
    return { backgroundImage: `url(${player.song.cover})` }
  }
  return {}
})

watch(() => player.playIndex, value => {
  console.log("play index:", value);
  /** 更新当前播放音乐信息 */
  if (songList.value?.length) {
    player.song = songList.value[value]

    /** 更新 audio url */
    switchAudioUrl()

    /** 更新 lrc */
    fetchSongLrc()
  }
})

onMounted(() => {
  bindEvent()
  fetchSongList()
  window.player = player
  window.audio_el = audioEl
})

provide(SONG_LIST_KEY, songList)
provide(PLAYER_KEY, player)
provide(USER_INTERACE_KEY, isUserInterace)
provide(PLAY_MUSIC_KEY, playMusic)
provide(NEXT_MUSIC_KEY, nextMusic)
provide(AUDIO_KEY, audioEl)
</script>

<template>
  <div class="view-container relative w-full h-full flex justify-center items-center">
    <div class="view-bg absolute inset-0 blur-2xl bg-cover bg-no-repeat bg-center" :style="bgStyle">
      <div class="view-bg--mask opacity-80 w-full h-full bg-gradient-to-r from-slate-100 to-zinc-200"></div>
    </div>
    <div class="view-inner relative w-9/12 h-4/6 p-4 flex gap-8">
      <div class="main-container grow h-full flex flex-col gap-8">
        <spectrum class="grow h-4"></spectrum>
        <!-- <control></control> -->
      </div>
      <div class="control-container flex flex-col h-full w-96 rounded-xl shadow-lg">
        <song class="shrink-0"></song>
        <lrc class="grow"></lrc>
      </div>
    </div>
  </div>
</template>
