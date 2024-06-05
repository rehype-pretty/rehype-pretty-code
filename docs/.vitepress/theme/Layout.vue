<!--.vitepress/theme/MyLayout.vue-->
<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <slot></slot>
  </Layout>
</template>

<style>
pre,
code {
  font-family: 'IBM Plex Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
}
</style>
