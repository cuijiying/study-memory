<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import AuthShell from '@/components/AuthShell.vue'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const loading = ref(false)

const registerForm = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
})

const registerRules = reactive<FormRules>({
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少为3个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
})

const registerFormRef = ref<FormInstance>()

const handleRegister = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  loading.value = true

  try {
    await formEl.validate(async (valid: boolean) => {
      if (!valid) return

      const { data, error } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: { username: registerForm.username },
        },
      })

      if (error) {
        ElMessage.error(error.message)
        return
      }

      if (data.user) {
        ElMessage.success('注册成功！请登录您的邮箱验证账号')
        router.push('/login')
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
  <AuthShell title="加入学习之旅" subtitle="创建账号，开启科学记忆">
    <h2 class="form-title">注册账号</h2>
    <p class="form-desc">填写以下信息完成注册</p>

    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      label-position="top"
      class="auth-form mobile-form"
    >
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="registerForm.email" placeholder="请输入邮箱" size="large" />
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="registerForm.username" placeholder="请输入用户名" :prefix-icon="User" size="large" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码"
          :prefix-icon="Lock"
          show-password
          size="large"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          :prefix-icon="Lock"
          show-password
          size="large"
        />
      </el-form-item>

      <el-button
        type="primary"
        size="large"
        class="submit-btn"
        :loading="loading"
        @click="handleRegister(registerFormRef)"
      >
        注册
      </el-button>

      <div class="form-footer">
        已有账号？
        <el-link type="primary" @click="goToLogin">立即登录</el-link>
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
  margin-bottom: 24px;
}

.auth-form {
  :deep(.el-form-item__label) {
    color: var(--app-text-secondary);
    font-weight: 500;
  }
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
