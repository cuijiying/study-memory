<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const homePath = computed(() => (authStore.user ? '/' : '/login'))
const homeLabel = computed(() => (authStore.user ? '返回首页' : '去登录'))

const goHome = () => {
  router.replace(homePath.value)
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  goHome()
}
</script>

<template>
  <div class="not-found">
    <div class="not-found__card">
      <p class="not-found__code">404</p>
      <h1 class="not-found__title">页面不存在</h1>
      <p class="not-found__desc">
        当前地址没有对应的页面。请检查链接是否正确，或返回已有页面继续使用。
      </p>
      <div class="not-found__actions">
        <el-button @click="goBack">返回上一页</el-button>
        <el-button type="primary" @click="goHome">{{ homeLabel }}</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--app-bg);
}

.not-found__card {
  width: min(440px, 100%);
  padding: 40px 32px;
  text-align: center;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  box-shadow: var(--app-card-shadow);
}

.not-found__code {
  margin: 0;
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 4px;
  color: var(--el-color-primary);
}

.not-found__title {
  margin: 16px 0 8px;
  font-size: 22px;
  color: var(--app-text-primary);
}

.not-found__desc {
  margin: 0 0 28px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--app-text-secondary);
}

.not-found__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
