<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue'

defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <div class="auth-page">
    <div class="auth-toolbar">
      <ThemeToggle />
    </div>

    <div class="auth-layout">
      <aside class="auth-brand">
        <img src="@/assets/images/logo.svg" alt="Logo" class="auth-logo">
        <h1 class="auth-title">{{ title }}</h1>
        <p class="auth-subtitle">{{ subtitle }}</p>
        <ul class="auth-features">
          <li>艾宾浩斯遗忘曲线科学复习</li>
          <li>学习笔记与计划一体化管理</li>
          <li>进度追踪，温故知新</li>
        </ul>
      </aside>

      <main class="auth-main">
        <el-card class="auth-card" shadow="never">
          <slot />
        </el-card>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  min-height: 100dvh; /* 动态视口高度，适配移动端浏览器地址栏 */
  background: var(--app-bg);
  position: relative;
}

.auth-toolbar {
  position: absolute;
  top: 20px;
  right: 24px;
  z-index: 10;

  /* 手机端：避开刘海屏安全区域 */
  @include mobile {
    top: max(16px, env(safe-area-inset-top));
    right: max(16px, env(safe-area-inset-right));
  }
}

.auth-layout {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.auth-brand {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 64px;
  background: var(--app-auth-brand-bg);
  color: var(--app-auth-brand-text);

  @media (max-width: 900px) {
    padding: 80px 24px 32px;
    text-align: center;
    align-items: center;
  }
}

.auth-logo {
  width: 72px;
  height: 72px;
  margin-bottom: 24px;

  @include mobile {
    width: 56px;
    height: 56px;
    margin-bottom: 16px;
  }
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 12px;

  @include mobile {
    font-size: 22px;
  }
}

.auth-subtitle {
  font-size: 16px;
  color: var(--app-auth-brand-subtext);
  margin-bottom: 32px;

  @include mobile {
    font-size: 14px;
    margin-bottom: 20px;
  }
}

.auth-features {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 12px;
    font-size: 14px;
    color: var(--app-auth-brand-subtext);
    line-height: 1.6;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--el-color-primary);
    }
  }

  @media (max-width: 900px) {
    display: none;
  }
}

.auth-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;

  @media (max-width: 900px) {
    padding: 24px 16px 48px;
  }
}

.auth-card {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  box-shadow: var(--app-card-shadow);

  :deep(.el-card__body) {
    padding: 32px 28px 24px;

    @include mobile {
      padding: 24px 20px 20px;
    }
  }
}
</style>
