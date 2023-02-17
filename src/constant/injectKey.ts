import type { InjectionKey, ComputedRef, Ref,  } from 'vue'

export const SONG_LIST_KEY: InjectionKey<Ref<Array<Song>>> = Symbol("song_list_key")

export const PLAYER_KEY: InjectionKey<Player> = Symbol("player_key")

export const AUDIO_KEY: InjectionKey<HTMLMediaElement> = Symbol("audio_key")

export const USER_INTERACE_KEY: InjectionKey<Ref<Boolean>> = Symbol("user_interace_key")

export const PLAY_MUSIC_KEY: InjectionKey<(payload: MouseEvent) => void> = Symbol("play_music_key")

export const NEXT_MUSIC_KEY: InjectionKey<(payload: MouseEvent) => void> = Symbol("next_music_key")