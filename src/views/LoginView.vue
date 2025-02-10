<script setup lang="ts">
import type { FormInstance, FormRules, ElMessage} from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { supabase } from '../lib/supabase'

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
    await formEl.validate(async (valid: boolean) => {
      if (valid) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginForm.username,
          password: loginForm.password
        })

        if (error) {
          ElMessage.error(error.message)
          loading.value = false
          return
        }

        if (data.user) {
          ElMessage.success('登录成功')
          router.push('/')
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <div class="cyberpunk-background">
      <div class="grid"></div>
      <div class="circles">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div class="login-content">
      <div class="login-header">
        <div class="logo-container">
          <img src="@/assets/images/logo.svg" alt="Logo" class="logo">
          <div class="logo-glow"></div>
        </div>
        <h2>学习管理系统</h2>
        <p class="subtitle">记录每一步学习的进步</p>

      </div>
      
      <el-card class="login-card">
        <div class="card-decoration">
          <span></span>
          <span></span>
        </div>
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
              class="cyber-input"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              class="cyber-input"
            />
          </el-form-item>
          <el-form-item class="remember-forgot">
            <el-checkbox class="cyber-checkbox">记住我</el-checkbox>
            <el-link type="primary" class="forgot-link">忘记密码？</el-link>
          </el-form-item>
          <el-form-item>
            <el-button 
              type="primary" 
              @click="handleLogin(loginFormRef)" 
              class="login-button"
              :loading="loading"
              block
            >
              <span class="button-content">登录</span>
              <div class="button-glitch"></div>
            </el-button>
          </el-form-item>
          <div class="register-link">
            还没有账号？
            <el-link type="primary" @click="goToRegister" class="register-button">立即注册</el-link>
          </div>
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
  background: #0a0a1f;
  position: relative;
  overflow: hidden;
  
  .cyberpunk-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    
    .grid {
      position: absolute;
      width: 200%;
      height: 200%;
      background-image: 
        linear-gradient(transparent 95%, rgba(64, 158, 255, 0.3) 95%),
        linear-gradient(90deg, transparent 95%, rgba(64, 158, 255, 0.3) 95%);
      background-size: 40px 40px;
      animation: gridMove 20s linear infinite;
      transform: perspective(500px) rotateX(60deg);
      top: -100%;
    }

    .circles {
      position: absolute;
      width: 100%;
      height: 100%;
      
      div {
        position: absolute;
        border: 2px solid rgba(64, 158, 255, 0.2);
        border-radius: 50%;
        animation: circleFloat 10s infinite;
        
        &:nth-child(1) {
          width: 200px;
          height: 200px;
          left: 10%;
          top: 20%;
          animation-delay: 0s;
        }
        
        &:nth-child(2) {
          width: 300px;
          height: 300px;
          right: 15%;
          bottom: 25%;
          animation-delay: -3s;
        }
        
        &:nth-child(3) {
          width: 150px;
          height: 150px;
          right: 30%;
          top: 30%;
          animation-delay: -6s;
        }
      }
    }
  }

  .login-content {
    width: 100%;
    max-width: 440px;
    padding: 0 20px;
    position: relative;
    z-index: 1;
    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    
    .login-header {
      text-align: center;
      margin-bottom: 32px;
      
      .logo-container {
        position: relative;
        display: inline-block;
        margin-bottom: 20px;
        
        .logo {
          width: 80px;
          height: 80px;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 0 8px rgba(64, 158, 255, 0.6));
        }
        
        .logo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(64, 158, 255, 0.4) 0%, transparent 70%);
          animation: glowPulse 2s infinite;
        }
      }
      
      h2 {
        color: #fff;
        font-size: 32px;
        font-weight: 600;
        margin-bottom: 12px;
        text-shadow: 0 0 20px rgba(64, 158, 255, 0.5);
      }
      
      .subtitle {
        color: rgba(255, 255, 255, 0.9);
        font-size: 18px;
        text-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
      }
    }

    .login-card {
      backdrop-filter: blur(20px);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      position: relative;
      overflow: hidden;
      
      .card-decoration {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        
        span {
          position: absolute;
          background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.2), transparent);
          width: 50%;
          height: 2px;
          animation: decorationMove 3s linear infinite;
          
          &:nth-child(1) {
            top: 20%;
            transform: translateX(-100%);
          }
          
          &:nth-child(2) {
            bottom: 20%;
            transform: translateX(100%);
            animation-delay: -1.5s;
          }
        }
      }
      
      .login-form {
        padding: 30px 20px;
        
        :deep(.el-input__wrapper) {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(64, 158, 255, 0.3);
          box-shadow: none;
          border-radius: 8px;
          transition: all 0.3s;
          
          &:hover {
            border-color: rgba(64, 158, 255, 0.5);
            box-shadow: 0 0 15px rgba(64, 158, 255, 0.2);
          }
          
          &.is-focus {
            border-color: #409EFF;
            box-shadow: 0 0 20px rgba(64, 158, 255, 0.3);
          }

          .el-input__inner {
            color: #fff;
            
            &::placeholder {
              color: rgba(255, 255, 255, 0.5);
            }
          }
        }
        
        .remember-forgot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 24px 0;
          
          :deep(.el-checkbox__label) {
            color: rgba(255, 255, 255, 0.9);
          }
          
          .forgot-link {
            color: #409EFF;
            text-decoration: none;
            
            &:hover {
              text-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
            }
          }
        }
        
        .login-button {
          height: 48px;
          font-size: 18px;
          font-weight: 500;
          border-radius: 8px;
          background: linear-gradient(45deg, #409EFF, #36cfc9);
          border: none;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          
          .button-content {
            position: relative;
            z-index: 2;
          }
          
          .button-glitch {
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            animation: buttonGlitch 2s infinite;
          }
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(64, 158, 255, 0.4);
          }
          
          &:active {
            transform: translateY(1px);
          }
        }

        .register-link {
          text-align: center;
          margin-top: 20px;
          color: rgba(255, 255, 255, 0.9);
          
          .register-button {
            color: #409EFF;
            font-weight: 500;
            margin-left: 8px;
            
            &:hover {
              text-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
            }
          }
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gridMove {
  0% {
    transform: perspective(500px) rotateX(60deg) translateY(0);
  }
  100% {
    transform: perspective(500px) rotateX(60deg) translateY(40px);
  }
}

@keyframes circleFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes decorationMove {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

@keyframes buttonGlitch {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}
</style> 