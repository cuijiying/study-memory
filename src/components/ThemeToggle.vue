<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <el-tooltip :content="themeStore.isDark ? '切换浅色皮肤' : '切换深色皮肤'" placement="bottom">
    <el-button class="theme-toggle" circle @click="themeStore.toggleTheme()">
      <el-icon>
        <Sunny v-if="themeStore.isDark" />
        <Moon v-else />
      </el-icon>
    </el-button>
  </el-tooltip>
</template>

<style scoped>
.theme-toggle {
  border: 1px solid var(--app-border);
  background: var(--app-surface);
  color: var(--app-text-primary);
}
</style>
