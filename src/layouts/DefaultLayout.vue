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

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

const currentMenuTitle = computed(() => {
  switch (route.path) {
    case '/':
      return '首页'
    case '/study-plan':
      return '学习计划'
    case '/study-notes':
      return '学习笔记'
    case '/study-statistics':
      return '学习统计'
    case '/system-settings':
      return '系统设置'
    case '/learning-types':
      return '学习类型'
    default:
      return '当前页面'
  }
})

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // TODO: Navigate to profile page
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
  // 获取当前路由的index
  const path = route.path.split('/').pop()
  switch (path) {
    case '':
      return '1'
    case 'learning-types':
      return '2'
    case 'study-plan':
      return '3'
    case 'study-notes':
      return '4'
    case 'study-statistics':
      return '5'
    case 'system-settings':
      return '6'
    
    default:
      return '1'
  } 
})

// 获取用户名
const user = ref({
  username: 'guest'
})


// 获取用户名
const getUsername = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error fetching user:', error)
  }
  user.value.username = data.user?.email || 'guest'
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
          <el-menu-item index="1" route="/">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>

          <el-menu-item index="2" route="/learning-types">
            <el-icon><Document /></el-icon>
            <template #title>学习类型</template>
          </el-menu-item>
          
          <el-menu-item index="3" route="/study-plan">
            <el-icon><Calendar /></el-icon>
            <template #title>学习计划</template>
          </el-menu-item>
          
          <el-menu-item index="4" route="/study-notes">
            <el-icon><Document /></el-icon>
            <template #title>学习笔记</template>
          </el-menu-item>
          
          <el-menu-item index="5" route="/study-statistics">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>学习统计</template>
          </el-menu-item>
          
          <el-menu-item index="6" route="/system-settings">
            <el-icon><Setting /></el-icon>
            <template #title>系统设置</template>
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
            <el-button class="icon-btn">
              <el-badge :value="3">
                <el-icon><Bell /></el-icon>
              </el-badge>
            </el-button>
            
            <el-dropdown @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                <!-- 获取用户名 -->
                <span class="username">{{ user.username }}</span>
                <el-icon><CaretBottom /></el-icon>
              </div>

              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人信息
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>账号设置
                  </el-dropdown-item>
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