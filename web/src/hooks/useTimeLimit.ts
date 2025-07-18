import { ref, onMounted, onBeforeUnmount } from "vue";
import { storage } from "@/utils";

const TIMER_FLAG_KEY = "TIME_COUNT_60";

function useTimeLimit() {
  const text = ref<string>("获取验证码");
  const disabled = ref<boolean>(true);
  const timer = ref<number>();
  function setTimeLimit(start: number = 59) {
    disabled.value = true;
    storage.set(TIMER_FLAG_KEY, Date.now().toString());
    handleTimeCountDown(start);
  }
  function handleTimeCountDown(start: number) {
    timer.value = setInterval(() => {
      text.value = `${start}后重新获取`;
      start--;

      if (start === 0) {
        clearInterval(timer.value);
        disabled.value = false;
        text.value = "获取验证码";
        storage.remove(TIMER_FLAG_KEY);
      }
    }, 1000);
  }

  onMounted(() => {
    const pre = Number(storage.get(TIMER_FLAG_KEY));
    const now = Date.now();
    const gap = Math.floor((now - pre) / 1000) || 0;
    disabled.value = gap < 55;
    if (gap < 55) {
      handleTimeCountDown(59 - gap);
    }
  });

  onBeforeUnmount(() => {
    clearInterval(timer.value);
  });

  return {
    text,
    disabled,
    setTimeLimit,
  };
}

export default useTimeLimit;
