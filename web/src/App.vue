<template>
  <theme-switch>
    <div class="max-width">
      <span class="text x1">X1</span>
      <span class="text platform">开放平台统一验证服务</span>
      <RouterView />
    </div>
  </theme-switch>
  <footer-copyright></footer-copyright>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import ThemeSwitch from "./components/ThemeSwitch.vue";
import FooterCopyright from "./components/FooterCopyright.vue";
</script>

<style scoped>
.max-width {
  margin: 0 20px 80px;
  width: 100%;
  max-width: 380px;
}
.text {
  color: #40a9ff;
  font-weight: bold;
}
.x1 {
  font-size: 48px;
  font-style: italic;
  padding-right: 8px;
}
</style>
