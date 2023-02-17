<script lang="ts" setup>
import { computed, inject } from 'vue'
import { PLAYER_KEY, PLAY_MUSIC_KEY } from '../constant/injectKey'

const player = inject(PLAYER_KEY)

const playMusic = inject(PLAY_MUSIC_KEY)

if (!player) {
  throw new Error('player undefind');
}

const songInfo = computed(() => {
  if (player.song) {
    return player.song
  }
  return null
})
</script>


<template>
  <div class="song-wrap p-4 flex gap-2 items-center">
    <div class="song-cover w-20 h-20 shrink-0 rounded-xl" @click="playMusic">
      <img v-if="songInfo" class="block rounded-xl" :alt="songInfo.title" :src="songInfo.cover" />
      <div v-else class="block rounded-xl w-full h-full bg-slate-100"></div>
    </div>
    <div class="song-info">
      <div v-if="songInfo" class="text-xl font-bold">{{ songInfo.title }}</div>
    </div>
  </div>
</template>