<script setup lang="ts">
import {
  HomeFilled,
  Calendar,
  Document,
  DataAnalysis,
  Setting,
  Bell,
  Fold,
  Expand,
  User,
  CaretBottom,
  SwitchButton
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { supabase } from '@/lib/supabase'
import WeatherWidget from '@/components/WeatherWidget.vue'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)
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
      meta: route.meta || {}
    }))
})

// 获取菜单图标
const getMenuIcon = (path: string) => {
  const menuIcons: Record<string, any> = {
    '/': HomeFilled,
    '/study-plan': Calendar,
    '/study-notes': Document,
    '/study-statistics': DataAnalysis,
    '/system-settings': Setting,
    '/learning-types': Document,
    '/issues': Document
  }
  return menuIcons[path] || Document
}

const currentMenuTitle = computed(() => {
  const currentRoute = router.currentRoute.value
  return currentRoute.meta.title as string || '当前页面'
})

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      showProfileDialog.value = true
      break
    case 'settings':
      // TODO: Navigate to settings page
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      ElMessage.error('退出失败，请重试')
      return
    }
    ElMessage.success('已成功退出')
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    ElMessage.error('退出失败，请重试')
  }
}

// 根据路由获取当前路由的index
const activeIndex = computed(() => {
  const currentPath = route.path === '/' ? '/' : `/${route.path.split('/')[1]}`
  const menuItem = menuItems.value.find(item => item.path === currentPath)
  return menuItem?.index || '1'
})

// 获取用户名
const user = ref({
  username: 'guest',
  email: '',
  created_at: '',
  last_sign_in_at: ''
})

// 获取用户名
const getUsername = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error fetching user:', error)
  }
  user.value.username = data.user?.email || 'guest'
  user.value.email = data.user?.email || ''
  user.value.created_at = data.user?.created_at || ''
  user.value.last_sign_in_at = data.user?.last_sign_in_at || ''
}

onMounted(() => {
  getUsername()
})

</script>
<template>

  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside-container">
      <div class="logo-container">
        <img src="@/assets/images/logo.svg" alt="Logo" class="logo">
        <span class="logo-text" v-show="!isCollapse">学习管理系统</span>
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
    
    <el-container class="main-container">
      <el-header height="60px">
        <div class="header-left">
          <el-button 
            class="collapse-btn"
            @click="isCollapse = !isCollapse"
          >
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentMenuTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-space>
            <WeatherWidget />
            <!-- <el-button class="icon-btn">
              <el-badge :value="3">
                <el-icon><Bell /></el-icon>
              </el-badge>
            </el-button> -->
            
            <el-dropdown @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                <!-- 获取用户名 -->
                <span class="username">{{ user.username }}</span>
                <el-icon><CaretBottom /></el-icon>
              </div>0

              <template #dropdown>
                <el-dropdown-menu>
                  <!-- TODO -->
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人信息
                  </el-dropdown-item>
                  <!-- <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>账号设置
                  </el-dropdown-item> -->
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </div>
      </el-header>
      
      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>

      <!-- 个人信息弹框 -->
      <el-dialog
        v-model="showProfileDialog"
        title="个人信息"
        width="30%"
      >
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">
            {{ user.username }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ user.email }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">
            {{ new Date(user.created_at).toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录时间">
            {{ new Date(user.last_sign_in_at).toLocaleString() }}
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

  .aside-container {
    background-color: #304156;
    transition: width 0.3s;
    display: flex;
    flex-direction: column;
    
    .logo-container {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      overflow: hidden;
      
      .logo {
        width: 32px;
        height: 32px;
        margin-right: 8px;
      }
      
      .logo-text {
        color: white;
        font-size: 18px;
        font-weight: 600;
        white-space: nowrap;
      }
    }
    
    .sidebar-menu {
      border-right: none;
      background: transparent;
        // 文字颜色设置
        .el-menu-item {
            color: white;
        }
        
      :deep(.el-menu-item) {
        &.is-active {
          background-color: var(--el-color-primary);
        }
        
        &:hover {
          background-color: #99afe2;
        }
      }
    }
  }

  .main-container {
    .el-header {
      background-color: white;
      border-bottom: 1px solid #dcdfe6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .collapse-btn {
          padding: 6px;
          border: none;
          
          &:hover {
            background-color: var(--el-color-primary-light-9);
          }
        }
      }
      
      .header-right {
        .icon-btn {
          padding: 8px;
          border: none;
          
          &:hover {
            background-color: var(--el-color-primary-light-9);
          }
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          
          &:hover {
            background-color: var(--el-color-primary-light-9);
          }
          
          .username {
            font-size: 14px;
            color: var(--el-text-color-primary);
          }
        }
      }
    }

    .el-main {
      background-color: #f0f2f5;
      padding: 16px;
      
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
</style> 