<template>
  <div class="wrap">
    <div class="error">{{ errorMsg }}</div>
    <div class="btn" @click="handleHref">x1.pub</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const errorMsg = ref<string>("");

const route = useRoute();

onMounted(() => {
  const msg = route.query.msg;
  const firstMsg = Array.isArray(msg) ? msg[0] : msg;
  errorMsg.value = firstMsg || "客户端未知错误";
});

const handleHref = () => {
  window.location.href = "https://x1.pub";
};
</script>

<style scoped>
.wrap {
  width: 100%;
  border-bottom: 1px solid #8c8c8c;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
}
.error {
  font-size: 13px;
  color: #8c8c8c;
}
.btn {
  width: 60px;
  font-size: 14px;
  cursor: pointer;
  color: #40a9ff;
  margin-left: 20px;
}
</style>
