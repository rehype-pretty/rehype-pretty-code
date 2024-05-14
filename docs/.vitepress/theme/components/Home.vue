<script setup lang="tsx">
import { ref } from 'vue'

const count = ref(1)
</script>

<template>
  {{ count.toFixed(2) }}
</template>
