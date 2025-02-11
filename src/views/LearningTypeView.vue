<template>
  <div class="learning-type-view">
    <div class="mb-4 flex justify-between items-center">
      <el-button type="primary" @click="showCreateDialog">添加学习类型</el-button>
    </div>

    <!-- 学习类型列表 -->
    <el-table v-loading="loading" :data="learningTypes" class="table-container" border stripe>
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="名称" align="center" />
      <el-table-column prop="description" label="描述" align="center" />
      <el-table-column prop="created_at" label="创建时间" width="180" align="center">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="showEditDialog(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑学习类型' : '添加学习类型'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入学习类型名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入学习类型描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLearningTypeStore } from '@/stores/learningType'
import type { LearningType } from '@/types'
import type { FormInstance, FormRules } from 'element-plus'

const store = useLearningTypeStore()
const { learningTypes, loading, error } = storeToRefs(store)

// 表单相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const form = ref({
  id: undefined as number | undefined,
  name: '',
  description: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入学习类型名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ]
}

// 初始化
onMounted(async () => {
  await store.fetchLearningTypes()
})

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  form.value = {
    id: undefined,
    name: '',
    description: ''
  }
  dialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (row: LearningType) => {
  isEdit.value = true
  form.value = {
    id: row.id,
    name: row.name,
    description: row.description || ''
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value && form.value.id) {
          await store.updateLearningType(form.value.id, {
            name: form.value.name,
            description: form.value.description
          })
          ElMessage.success('更新成功')
        } else {
          await store.createLearningType({
            name: form.value.name,
            description: form.value.description
          })
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
      } catch (err) {
        ElMessage.error(error.value || '操作失败')
      }
    }
  })
}

// 删除
const handleDelete = async (row: LearningType) => {
  try {
    await ElMessageBox.confirm('确定要删除这个学习类型吗？', '提示', {
      type: 'warning'
    })
    await store.deleteLearningType(row.id)
    ElMessage.success('删除成功')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error(error.value || '删除失败')
    }
  }
}
</script> 
<style scoped>
.learning-type-view {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  .table-container {
    margin-top: 20px;
  }
}
</style>

