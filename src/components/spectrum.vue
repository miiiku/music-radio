<script lang="ts" setup>
import { onMounted, onUnmounted, inject, watch, ref } from 'vue'
import { drawStyle1, drawStyle2, drawStyle3 } from '../utils/drawStyle'
import { AUDIO_KEY, USER_INTERACE_KEY } from '../constant/injectKey'

const audioEl = inject(AUDIO_KEY)
const isUserInterace = inject(USER_INTERACE_KEY, ref(false))

let ac:AudioContext
let analyser:AnalyserNode
let audioSource:MediaElementAudioSourceNode
let maxValue:number = 236
let boundValue:number = 0.8

let canvasRef:HTMLCanvasElement
let canvasCtx:CanvasRenderingContext2D | null
let canvasWidth:number = 0
let canvasHeight:number = 0

const MIN_FFT_SIZE_POWER = 5
const MAX_FFT_SIZE_POWER = 15

window.canvas_setting = {}

const defaultSetting: CanvasSetting = {
  centerX: 0.5,
  centerY: 0.5,
  barWidth: 3,
  barColor: '#f87171',
  barColorO: 1.0,
  barShadowColor: '#fda4af',
  barShadowColorO: 0.3,
  barShadowBlur: 2,
  lineColor: '#f87171',
  lineColorO: 1.0,
  lineWidth: 1,
  lineShadowColor: '#fda4af',
  lineShadowColorO: 1.0,
  lineShadowBlur: 6,
  isEnableBasicHeight: true,
  isEnableShadow: true,
  isEnableRound: false,
  fftSizePower: 8,
}

const resize = () => {
  if (canvasRef) {
    canvasWidth = canvasRef.width = canvasRef.clientWidth
    canvasHeight = canvasRef.height = canvasRef.clientHeight
  }
}

const draw = () => {
  if (!canvasRef || !canvasCtx) return

  const opt = Object.assign({}, defaultSetting, window.canvas_setting)

  const fftSizePower = Math.min(Math.max(MIN_FFT_SIZE_POWER, opt.fftSizePower), MAX_FFT_SIZE_POWER)
  analyser.fftSize = Math.pow(2, fftSizePower)
  
  const bufferLen = analyser.frequencyBinCount
  const buffer = new Uint8Array(bufferLen)
  analyser.getByteFrequencyData(buffer)

  drawStyle3(canvasWidth, canvasHeight, maxValue, boundValue, canvasCtx, opt, buffer)
}

const refreshUI = () => {
  draw()
  requestAnimationFrame(refreshUI)
}

const initAC = () => {
  if (audioEl && !audioSource) {
    ac = new AudioContext()
    analyser = ac.createAnalyser()
    audioSource = ac.createMediaElementSource(audioEl)
    audioSource.connect(analyser)
    analyser.minDecibels = -140
    analyser.maxDecibels = -10
    analyser.smoothingTimeConstant = 0.85
    analyser.connect(ac.destination)
    refreshUI()
  }
}

const stopWatchUserInterace = watch(isUserInterace, (value) => {
  if (value) {
    ac && ac.resume()
    stopWatchUserInterace()
  }
})

onMounted(() => {
  if (canvasRef) {
    canvasCtx = canvasRef.getContext('2d')
  }
  resize()
  initAC()

  window.addEventListener('resize', initAC)
})

onUnmounted(() => {
  window.removeEventListener('resize', initAC)
})
</script>

<template>
  <div class="spectrum-wrap overflow-hidden rounded-xl shadow-lg">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
  </div>
</template>