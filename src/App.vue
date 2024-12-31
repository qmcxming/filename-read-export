<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import Export from './Export/index.vue'

const route = ref('')
const enterAction = ref({})

onMounted(() => {
  window.utools.onPluginEnter((action) => {
    route.value = action.code
    enterAction.value = action
    document.documentElement.className = window.utools.isDarkColors() ? "dark" : "";
  })
  window.utools.onPluginOut((isKill) => {
    route.value = ''
  })
})
</script>

<template>
  <template v-if="route === 'fileNameExport'">
    <Export></Export>
  </template>
</template>
