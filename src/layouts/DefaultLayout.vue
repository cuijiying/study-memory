<script setup lang="ts">
import {
  HomeFilled,
  Calendar,
  Document,
  DataAnalysis,
  Setting,
  Fold,
  Expand,
  User,
  CaretBottom,
  SwitchButton,
  Menu,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useResponsiveDialog } from '@/composables/useResponsiveDialog'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { user } = storeToRefs(authStore)
const { isMobile } = useBreakpoint()
const { dialogWidth: profileDialogWidth } = useResponsiveDialog('420px')

/** 桌面端侧栏折叠状态（手机端不使用固定侧栏，改用 Drawer） */
const isCollapse = ref(false)
/** 手机端 Drawer 抽屉是否打开 */
const drawerVisible = ref(false)
const showProfileDialog = ref(false)

// 从路由配置中获取菜单项
const menuItems = computed(() => {
  const layout = router.options.routes.find(route => route.path === '/')
  if (!layout || !layout.children) return []

  return layout.children
    .filter(route => !route.meta?.hideInMenu)
    .map((route, index) => ({
      index: String(index + 1),
      path: route.path ? `/${route.path}` : '/',
      name: route.name as string,
      meta: route.meta || {},
    }))
})

// 获取菜单图标
const getMenuIcon = (path: string) => {
  const menuIcons: Record<string, typeof Document> = {
    '/': HomeFilled,
    '/study-plan': Calendar,
    '/study-notes': Document,
    '/study-statistics': DataAnalysis,
    '/system-settings': Setting,
    '/learning-types': Document,
    '/issues': Document,
  }
  return menuIcons[path] || Document
}

const currentMenuTitle = computed(() => {
  const currentRoute = router.currentRoute.value
  return (currentRoute.meta.title as string) || '当前页面'
})

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      showProfileDialog.value = true
      break
    case 'settings':
      themeStore.toggleTheme()
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    await authStore.signOut()
    ElMessage.success('已成功退出')
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    ElMessage.error('退出失败，请重试')
  }
}

// 根据路由获取当前路由的 index
const activeIndex = computed(() => {
  const currentPath = route.path === '/' ? '/' : `/${route.path.split('/')[1]}`
  const menuItem = menuItems.value.find(item => item.path === currentPath)
  return menuItem?.index || '1'
})

/** 手机端点击菜单项后自动关闭 Drawer */
const handleMenuSelect = () => {
  if (isMobile.value) {
    drawerVisible.value = false
  }
}

/** 顶栏折叠按钮：桌面端折叠侧栏，手机端打开 Drawer */
const toggleSidebar = () => {
  if (isMobile.value) {
    drawerVisible.value = !drawerVisible.value
  } else {
    isCollapse.value = !isCollapse.value
  }
}

const userEmail = computed(() => user.value?.email || 'guest')
const userCreatedAt = computed(() => user.value?.created_at || '')
const userLastSignInAt = computed(() => user.value?.last_sign_in_at || '')

/** 路由切换时关闭手机端 Drawer，避免页面跳转后 Drawer 仍打开 */
watch(
  () => route.path,
  () => {
    drawerVisible.value = false
  },
)
</script>

<template>
  <el-container class="layout-container">
    <!-- 桌面端：固定左侧边栏 -->
    <el-aside
      v-if="!isMobile"
      :width="isCollapse ? '64px' : '200px'"
      class="aside-container"
    >
      <div class="logo-container">
        <img src="@/assets/images/logo.svg" alt="Logo" class="logo">
        <span v-show="!isCollapse" class="logo-text">记忆学习系统</span>
      </div>
      <el-scrollbar>
        <el-menu
          :collapse="isCollapse"
          :default-active="activeIndex"
          class="sidebar-menu"
          :collapse-transition="false"
          router
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.path"
            :index="item.index"
            :route="item.path"
          >
            <el-icon><component :is="getMenuIcon(item.path)" /></el-icon>
            <template #title>{{ item.meta.title }}</template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <!-- 手机端：Drawer 抽屉式侧栏，从左侧滑出 -->
    <el-drawer
      v-if="isMobile"
      v-model="drawerVisible"
      direction="ltr"
      :size="260"
      :show-close="false"
      class="mobile-drawer"
    >
      <template #header>
        <div class="drawer-header">
          <img src="@/assets/images/logo.svg" alt="Logo" class="logo">
          <span class="logo-text">记忆学习系统</span>
        </div>
      </template>
      <el-menu
        :default-active="activeIndex"
        class="sidebar-menu drawer-menu"
        router
        @select="handleMenuSelect"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.index"
          :route="item.path"
        >
          <el-icon><component :is="getMenuIcon(item.path)" /></el-icon>
          <template #title>{{ item.meta.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-drawer>

    <el-container class="main-container">
      <el-header :height="isMobile ? '52px' : '60px'" class="app-header">
        <div class="header-left">
          <el-button class="collapse-btn" @click="toggleSidebar">
            <!-- 手机端显示汉堡菜单图标，桌面端显示折叠/展开图标 -->
            <el-icon>
              <Menu v-if="isMobile" />
              <Fold v-else-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </el-button>

          <!-- 手机端隐藏面包屑，仅显示当前页标题 -->
          <el-breadcrumb v-if="!isMobile" separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentMenuTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
          <span v-else class="mobile-page-title">{{ currentMenuTitle }}</span>
        </div>

        <div class="header-right">
          <ThemeToggle />
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="isMobile ? 28 : 32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <!-- 手机端隐藏用户名文字，节省顶栏空间 -->
              <span v-if="!isMobile" class="username">{{ userEmail }}</span>
              <el-icon><CaretBottom /></el-icon>
            </div>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人信息
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  {{ themeStore.isDark ? '切换浅色皮肤' : '切换深色皮肤' }}
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>

      <!-- 个人信息弹框：手机端宽度 92%，桌面端 420px -->
      <el-dialog v-model="showProfileDialog" title="个人信息" :width="profileDialogWidth">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">
            {{ userEmail }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ userEmail }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">
            {{ userCreatedAt ? new Date(userCreatedAt).toLocaleString() : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录时间">
            {{ userLastSignInAt ? new Date(userLastSignInAt).toLocaleString() : '-' }}
          </el-descriptions-item>
        </el-descriptions>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showProfileDialog = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  height: 100dvh; /* 动态视口高度，避免移动端地址栏遮挡 */
  background: var(--app-bg);

  .aside-container {
    background-color: var(--app-sidebar-bg);
    border-right: 1px solid var(--app-border);
    transition: width 0.3s;
    display: flex;
    flex-direction: column;

    .logo-container {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      overflow: hidden;
      border-bottom: 1px solid var(--app-border);

      .logo {
        width: 32px;
        height: 32px;
        margin-right: 8px;
      }

      .logo-text {
        color: var(--app-sidebar-text);
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
      }
    }

    .sidebar-menu {
      border-right: none;
      background: transparent;

      :deep(.el-menu-item) {
        color: var(--app-sidebar-text);

        &.is-active {
          background-color: var(--app-sidebar-active);
          color: #fff;
        }

        &:hover {
          background-color: var(--app-sidebar-hover);
        }
      }
    }
  }

  .main-container {
    .app-header {
      background-color: var(--app-header-bg);
      border-bottom: 1px solid var(--app-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 12px;

      @include desktop {
        padding: 0 16px;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        flex: 1;

        @include desktop {
          gap: 16px;
        }

        .collapse-btn {
          padding: 6px;
          border: none;
          background: transparent;
          color: var(--app-text-primary);
          flex-shrink: 0;

          &:hover {
            background-color: var(--app-surface-muted);
          }
        }

        /* 手机端当前页标题：替代面包屑 */
        .mobile-page-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--app-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;

        @include desktop {
          gap: 12px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: 4px;

          @include desktop {
            gap: 8px;
            padding: 4px 8px;
          }

          &:hover {
            background-color: var(--app-surface-muted);
          }

          .username {
            font-size: 14px;
            color: var(--app-text-primary);
          }
        }
      }
    }

    .el-main {
      background-color: var(--app-bg);
      padding: 8px;

      @include desktop {
        padding: 16px;
      }

      .fade-enter-active,
      .fade-leave-active {
        transition: opacity 0.3s ease;
      }

      .fade-enter-from,
      .fade-leave-to {
        opacity: 0;
      }
    }
  }
}

/* 手机端 Drawer 内部样式 */
.drawer-header {
  display: flex;
  align-items: center;
  gap: 10px;

  .logo {
    width: 32px;
    height: 32px;
  }

  .logo-text {
    font-size: 16px;
    font-weight: 600;
    color: var(--app-text-primary);
  }
}

:deep(.mobile-drawer) {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px;
    border-bottom: 1px solid var(--app-border);
  }

  .el-drawer__body {
    padding: 0;
  }
}

.drawer-menu {
  border-right: none;
}
</style>
