<template>
  <div v-if="!hasCheckLogin"></div>
  <div v-else-if="!userInfo">
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
      class="login-btn"
      :loading="loginLoading"
      size="large"
      block
      @click="handleSubmit"
    >
      <template v-if="!loginError">登录</template>
      <template v-else
        ><span class="login-btn-error">{{ loginError }}</span></template
      >
    </v-btn>
    <div class="tips center">
      还没有账号？
      <span class="link" @click="handleToRegister">去注册</span>
    </div>
  </div>
  <div v-else>
    <div class="tips">
      你好呀 {{userInfo.name}}({{userInfo.nameCn}})
    </div>
    <div class="tips">
      当前已登录 {{userInfo.email}}
    </div>
    <v-btn
      class="one-click-login-btn"
      size="large"
      block
      @click="oneClickLogin"
    >
      一键登录
  </v-btn>
  <div class="tips center link" @click="handleLogout">退出登录</div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { email, required, helpers } from "@vuelidate/validators";
import { sendEmailCaptcha, login, MailType, ssoAuth, logout } from "@/api";
import useTimeLimit from "@/hooks/useTimeLimit";
import { RspCode } from "@/api/request";

interface UserInfo {
  url: string,
  name: string,
  nameCn: string,
  email: string,
}

const state = reactive({
  email: "",
  emailCaptcha: "",
});
const loginError = ref<string>("");
const hasCheckLogin = ref<boolean>(false);
const userInfo = ref<UserInfo>();
const captchaLoading = ref<boolean>(false);
const loginLoading = ref<boolean>(false);
const rules = {
  email: {
    required: helpers.withMessage("邮箱不能为空", required),
    email: helpers.withMessage("请输入合法的邮箱", email),
  },
  emailCaptcha: {
    required: helpers.withMessage("验证码不能为空", required),
    length6: helpers.withMessage(
      "请输入6位数字验证码",
      helpers.regex(/^\d{6}$/),
    ),
  },
};

const v$ = useVuelidate(rules, state);
const route = useRoute();
const router = useRouter();
const { disabled: captchaDisable, text, setTimeLimit } = useTimeLimit();

onBeforeMount(async () => {
  const res = await ssoAuth();
  if (res.code === RspCode.SSO_URL_ERROR) {
    router.push({ path: "/error", query: { msg: res.message } });
    return
  }
  if (res.code === RspCode.SUCCESS) {
    userInfo.value = res.data
  }
  hasCheckLogin.value = true;
});

const handleLogout = async () => {
  await logout()
  userInfo.value = undefined
}

const oneClickLogin = () => {
  if (userInfo.value) {
    window.location.href = userInfo.value.url;
  }
}

const handleToRegister = () => {
  router.push({ path: "/register", query: route.query });
};

const handleSubmit = async () => {
  const validate = await v$.value.$validate();
  if (!validate) {
    return;
  }

  loginLoading.value = true;
  const res = await login(state);
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

const handleFetchCaptcha = async () => {
  const validate = await v$.value.email.$validate();
  if (!validate) {
    return;
  }

  captchaLoading.value = true;
  const res = await sendEmailCaptcha({ email: state.email, type: MailType.LOGIN });
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
</script>

<style scoped>
.login-btn {
  margin-top: 10px;
  overflow: hidden;
}

.login-btn-error {
  color: #ff4d4f;
  animation-name: dd;
  animation-duration: 0.5s;
  animation-timing-function: ease-in-out;
}

.one-click-login-btn {
  margin-top: 16px;
}

.tips {
  font-size: 13px;
  color: #8c8c8c;
}

.center {
  text-align: center;
  margin: 20px;
}

.link {
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
