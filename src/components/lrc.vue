<script lang="ts" setup>
import { computed, inject, ref, watch, toRefs, onMounted } from 'vue';
import { PLAYER_KEY } from '../constant/injectKey';

const player = inject(PLAYER_KEY)

if (!player) {
  throw new Error('player undefind');
}

const { timeupdate, playIndex } = toRefs(player)

const lrcWrap = ref<HTMLDivElement>()

const activeLrcIndex = ref<number>(-1)

const showRows = ref<number>(5)

const midRow = ref<number>(3)

const lrcRowH = 46

const lrcInfo = computed(() => {
  if (player.lrc) {
    return player.lrc
  }
  return null
})

const nextTime = computed(() => {
  if (lrcInfo.value && activeLrcIndex.value < lrcInfo.value.length - 1) {
    return lrcInfo.value[activeLrcIndex.value + 1].time
  }
  return 9999
})

const lrcStyle = computed(() => {
  if (lrcInfo.value?.length) {
    if (activeLrcIndex.value > 1) {
      const y = (activeLrcIndex.value - 1) * lrcRowH
      return { transform: `translateY(-${y}px)` }
    }
    return { transform: 'translateY(0px)' }
  }
  return { transform: `translateY(${lrcRowH}px)` }
})

watch(playIndex, () => {
  activeLrcIndex.value = -1
})

watch(timeupdate, value => {
  if (value && value >= nextTime.value) {
    activeLrcIndex.value ++
  }
})

onMounted(() => {
  if (lrcWrap.value) {
    showRows.value = Math.floor(lrcWrap.value.clientHeight / lrcRowH)
    midRow.value = Math.ceil(showRows.value / 2)
  }
})


</script>

<template>
  <div class="lrc-container w-full overflow-hidden">
    <div class="lrc-list p-4 transition-transform duration-500" :style="lrcStyle">
      <section
        v-for="(item, index) in lrcInfo"
        :key="index"
        :data-time="item.time"
        :class="{ active: index === activeLrcIndex }"
      >
        <span>{{ item.text }}</span> 
      </section>
    </div>
  </div>
</template>

<style scoped>
.lrc-list section {
  color: #4b5563;
  font-size: 16px;
  line-height: 24px;
  padding-block: 11px;
  transition: all 0.3s ease;
}

.lrc-list section.active {
  color: #0f766e;
  font-size: 16px;
}
</style>