declare type Song = {
  url: string,
  title: string,
  cover: string,
  album?: string,
  lrc?: string,
}

declare type Lrc = {
  time: number,
  text: string,
}

declare type CanvasSetting = {
  centerX: number,
  centerY: number,
  barWidth: number,
  barColor: string,
  barColorO: number,
  barShadowColor: string,
  barShadowColorO: number,
  barShadowBlur: number,
  lineColor: string,
  lineColorO: number,
  lineWidth: number,
  lineShadowColor: string,
  lineShadowColorO: number,
  lineShadowBlur: number,
  isEnableBasicHeight: boolean,
  isEnableShadow: boolean,
  isEnableRound: boolean,
  fftSizePower: number,
}

declare type Player = {
  /** 状态 */
  status: 'play' | 'pause' | 'playing' | 'waiting' | 'ended' | 'unknown',
  /** 当前播放时间 */
  timeupdate: number,
  /** 当前播放音乐总时长 */
  duration: number,
  /** 当前播放歌曲下标 */
  playIndex: number,
  /** 当前歌曲信息 */
  song?: Song,
  /** 当前歌曲歌词信息 */
  lrc?: Array<Lrc>,
}

interface Window {
  canvas_setting: any;
  audio_el: HTMLAudioElement;
  player: Player;
}