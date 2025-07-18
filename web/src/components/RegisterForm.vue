<template>
  <div class="flex">
    <div class="block">
      <v-text-field
        v-model="state.name"
        :error-messages="String(v$.name.$errors.map((e) => e.$message))"
        label="英文名"
        placeholder="2-12位小写字母"
        required
      ></v-text-field>
    </div>
    <div class="block">
      <v-text-field
        v-model="state.nameCn"
        :error-messages="String(v$.nameCn.$errors.map((e) => e.$message))"
        label="中文名"
        placeholder="1-6位汉字"
        required
      ></v-text-field>
    </div>
  </div>
  <v-text-field
    v-model="state.email"
    :error-messages="String(v$.email.$errors.map((e) => e.$message))"
    label="邮箱"
    placeholder="合法的邮箱"
    required
  ></v-text-field>
  <v-text-field
    v-model="state.emailCaptcha"
    :loading="captchaLoading"
    :error-messages="String(v$.emailCaptcha.$errors.map((e) => e.$message))"
    label="验证码"
    placeholder="6位数字验证码"
    required
  >
    <template v-slot:append-inner>
      <v-btn
        :disabled="captchaLoading || loginLoading || captchaDisable"
        variant="text"
        @click="handleFetchCaptcha"
        >{{ text }}</v-btn
      >
    </template>
  </v-text-field>
  <v-btn
    class="submit-btn"
    :loading="loginLoading"
    size="large"
    block
    @click="handleSubmit"
  >
    <template v-if="!loginError">注册并登录</template>
    <template v-else
      ><span class="submit-btn-error">{{ loginError }}</span></template
    >
  </v-btn>
  <div class="no-account">
    已有账号？
    <span class="to-login" @click="handleToLogin">去登陆</span>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { email, required, helpers } from "@vuelidate/validators";
import { sendEmailCaptcha, register, MailType } from "@/api";
import useTimeLimit from "@/hooks/useTimeLimit";

const state = reactive({
  email: "",
  emailCaptcha: "",
  name: "",
  nameCn: "",
});
const loginError = ref<string>("");
const captchaLoading = ref<boolean>(false);
const loginLoading = ref<boolean>(false);
const rules = {
  email: {
    required: helpers.withMessage("邮箱不能为空", required),
    email: helpers.withMessage("邮箱不合法", email),
  },
  emailCaptcha: {
    required: helpers.withMessage("验证码不能为空", required),
    length6: helpers.withMessage(
      "请输入6位数字验证码",
      helpers.regex(/^\d{6}$/),
    ),
  },
  name: {
    required: helpers.withMessage("英文名不能为空", required),
    regex: helpers.withMessage(
      "应为2-12位小写字母",
      helpers.regex(/^[a-z]{2,12}$/),
    ),
  },
  nameCn: {
    required: helpers.withMessage("中文名不能为空", required),
    regex: helpers.withMessage(
      "应为1-6位汉字",
      helpers.regex(/^[\u4e00-\u9fa5]{1,6}$/),
    ),
  },
};

const router = useRouter();
const route = useRoute();
const { disabled: captchaDisable, text, setTimeLimit } = useTimeLimit();

const v$ = useVuelidate(rules, state);

const handleFetchCaptcha = async () => {
  const validate = await v$.value.email.$validate();
  if (!validate) {
    return;
  }

  captchaLoading.value = true;
  const res = await sendEmailCaptcha({ email: state.email, type: MailType.REGISTER });
  if (res.code !== 0) {
    loginError.value = res.message || '验证码发送失败'
    setTimeout(() => {
      loginError.value = "";
    }, 3000);
    captchaLoading.value = false;
    return
  }

  setTimeLimit();
  captchaLoading.value = false;
};

const handleSubmit = async () => {
  const validate = await v$.value.$validate();
  if (!validate) {
    return;
  }

  loginLoading.value = true;
  const res = await register(state);
  loginLoading.value = false;
  if (res.code === 0) {
    window.location.href = res.data;
    return;
  }
  loginError.value = res.message || "网络错误请重试";
  setTimeout(() => {
    loginError.value = "";
  }, 3000);
};

const handleToLogin = () => {
  router.push({ path: "/login", query: route.query });
};
</script>

<style scoped>
.flex {
  display: flex;
  gap: 5px;
}
.block {
  width: 50%;
}
.no-account {
  text-align: center;
  font-size: 13px;
  color: #8c8c8c;
  margin: 20px;
}
.submit-btn {
  margin-top: 10px;
  overflow: hidden;
}

.submit-btn-error {
  color: #ff4d4f;
  animation-name: dd;
  animation-duration: 0.5s;
  animation-timing-function: ease-in-out;
}
.to-login {
  cursor: pointer;
  color: #40a9ff;
}
@keyframes dd {
  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  90% {
    transform: translateX(-1px);
  }

  20%,
  80% {
    transform: translateX(2px);
  }

  30%,
  70% {
    transform: translateX(-4px);
  }

  40%,
  60% {
    transform: translateX(4px);
  }

  50% {
    transform: translateX(-4px);
  }
}
</style>
