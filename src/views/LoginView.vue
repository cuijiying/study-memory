<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import AuthShell from '@/components/AuthShell.vue'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
})

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少为3个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' },
  ],
})

const loginFormRef = ref<FormInstance>()

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  loading.value = true

  try {
    await formEl.validate(async (valid: boolean) => {
      if (!valid) return

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.username,
        password: loginForm.password,
      })

      if (error) {
        ElMessage.error(error.message)
        return
      }

      if (data.user) {
        ElMessage.success('登录成功')
        router.push('/')
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
  <AuthShell title="艾宾浩斯记忆学习系统" subtitle="记录每一步学习的进步">
    <h2 class="form-title">登录账号</h2>
    <p class="form-desc">欢迎回来，请登录您的账号</p>

    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      label-position="top"
      class="auth-form"
      @keyup.enter="handleLogin(loginFormRef)"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="请输入邮箱或用户名"
          :prefix-icon="User"
          size="large"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          show-password
          size="large"
        />
      </el-form-item>

      <div class="form-actions">
        <el-checkbox>记住我</el-checkbox>
      </div>

      <el-button
        type="primary"
        size="large"
        class="submit-btn"
        :loading="loading"
        @click="handleLogin(loginFormRef)"
      >
        登录
      </el-button>

      <div class="form-footer">
        还没有账号？
        <el-link type="primary" @click="goToRegister">立即注册</el-link>
      </div>
    </el-form>
  </AuthShell>
</template>

<style lang="scss" scoped>
.form-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--app-text-primary);
  margin-bottom: 8px;
}

.form-desc {
  font-size: 14px;
  color: var(--app-text-muted);
  margin-bottom: 28px;
}

.auth-form {
  :deep(.el-form-item__label) {
    color: var(--app-text-secondary);
    font-weight: 500;
  }
}

.form-actions {
  margin-bottom: 8px;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
  font-size: 16px;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: var(--app-text-secondary);
}
</style>
