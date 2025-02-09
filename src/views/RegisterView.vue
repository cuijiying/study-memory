<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { supabase } from '../lib/supabase'

const router = useRouter()
const loading = ref(false)

const registerForm = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: ''
})

const registerRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少为3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const registerFormRef = ref<FormInstance>()

const handleRegister = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  loading.value = true
  
  try {
    await formEl.validate(async (valid: boolean) => {
      if (valid) {
        const { data, error } = await supabase.auth.signUp({
          email: registerForm.email,
          password: registerForm.password,
          options: {
            data: {
              username: registerForm.username
            }
          }
        })

        if (error) {
          ElMessage.error(error.message)
          return
        }

        if (data.user) {
          ElMessage.success('注册成功！请登录您的邮箱验证账号')
          router.push('/login')
        }
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    ElMessage.error('注册失败，请重试')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-content">
      <div class="register-header">
        <img src="@/assets/images/logo.svg" alt="Logo" class="logo">
        <h2>创建新账号</h2>
        <p class="subtitle">开始您的学习之旅</p>
      </div>

      
      <el-card class="register-card">
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-position="top"
          class="register-form"
        >
          <el-form-item label="邮箱" prop="email">
            <el-input 
              v-model="registerForm.email" 
              placeholder="请输入邮箱"
              :prefix-icon="Message"
            ></el-input>
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="registerForm.username" 
              placeholder="请输入用户名"
              :prefix-icon="User"
            ></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="registerForm.password" 
              type="password" 
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            ></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input 
              v-model="registerForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码"
              :prefix-icon="Lock"
              show-password
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleRegister(registerFormRef)" 
              class="register-button"
              :loading="loading"
              block
            >
              注册
            </el-button>
          </el-form-item>
          <div class="login-link">
            已有账号？
            <el-link type="primary" @click="goToLogin">立即登录</el-link>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  .register-content {
    width: 100%;
    max-width: 440px;
    padding: 0 20px;
    animation: fadeIn 0.5s ease-out;
    
    .register-header {
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

    .register-card {
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.95);
      border: none;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      
      .register-form {
        padding: 20px 0;
        
        :deep(.el-input__wrapper) {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border-radius: 8px;
          
          &:hover, &:focus {
            box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
          }
        }
        
        .register-button {
          height: 44px;
          font-size: 16px;
          border-radius: 8px;
          margin-top: 12px;
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
          }
        }

        .login-link {
          text-align: center;
          margin-top: 16px;
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