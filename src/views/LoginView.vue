<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少为3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ]
})

const loginFormRef = ref<FormInstance>()

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  loading.value = true
  try {
    await formEl.validate((valid: boolean) => {
      if (valid) {
        // TODO: Implement actual login logic
        setTimeout(() => {
          router.push('/')
          loading.value = false
        }, 1000)
      } else {
        loading.value = false
      }
    })
  } catch (error) {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo">
        <h2>学习管理系统</h2>
        <p class="subtitle">记录每一步学习的进步</p>
      </div>
      
      <el-card class="login-card">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
          class="login-form"
        >
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="loginForm.username" 
              placeholder="请输入用户名"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item class="remember-forgot">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary">忘记密码？</el-link>
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleLogin(loginFormRef)" 
              class="login-button"
              :loading="loading"
              block
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .login-content {
    width: 100%;
    max-width: 440px;
    padding: 0 20px;
    animation: fadeIn 0.5s ease-out;
    
    .login-header {
      text-align: center;
      margin-bottom: 24px;
      
      .logo {
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }
      
      h2 {
        color: white;
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .subtitle {
        color: rgba(255, 255, 255, 0.9);
        font-size: 16px;
      }
    }

    .login-card {
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.95);
      border: none;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      
      .login-form {
        padding: 20px 0;
        
        :deep(.el-input__wrapper) {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border-radius: 8px;
          
          &:hover, &:focus {
            box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
          }
        }
        
        .remember-forgot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .login-button {
          height: 44px;
          font-size: 16px;
          border-radius: 8px;
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
          }
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 