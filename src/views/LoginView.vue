<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { supabase } from '@/lib/supabase'

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
    <div class="login-content">
      <div class="login-header">
        <img src="@/assets/images/logo.svg" alt="Logo" class="logo">
        <h2>艾宾浩斯记忆学习系统</h2>
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
          <el-form-item class="form-actions">
            <el-checkbox>记住我</el-checkbox>
            <el-button
              type="primary"
              @click="handleLogin(loginFormRef)"
              :loading="loading"
            >
              登录
            </el-button>
          </el-form-item>
          <div class="register-link">
            还没有账号？
            <el-link type="primary" @click="goToRegister">立即注册</el-link>
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
  background: #f0f2f5;
}

.login-content {
  width: 100%;
  max-width: 440px;
  padding: 0 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .logo {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .subtitle {
    color: #909399;
    font-size: 14px;
  }
}

.login-card {
  border-radius: 8px;
}

.login-form {
  padding: 8px 4px;

  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
  }

  .register-link {
    text-align: center;
    margin-top: 16px;
    color: #606266;
    font-size: 14px;
  }
}
</style>
