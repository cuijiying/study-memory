<script setup lang="ts">
import { supabase } from '@/lib/supabase'
import type { StudyRecord } from '@/types'
import { useLearningTypeStore } from '@/stores/learningType'

const notes = ref<StudyRecord[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 引入学习类型 store
const learningTypeStore = useLearningTypeStore()
const { learningTypes } = storeToRefs(learningTypeStore)

const formData = ref<StudyRecord>({
  id: 0,
  category: '',
  title: '',
  description: '',
  link: '',
  learning_type_id: 0,
  created_at: '',
  updated_at: ''
})

const rules = {
  category: [{ required: true, message: '请选择分类', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
  link: [{ required: true, message: '请输入链接', trigger: 'blur' }],
  learning_type_id: [{ required: true, message: '请选择学习类型', trigger: 'change' }]
}

const categories = [
  '编程',
  '语言',
  '数学',
  '其他'
]

// 获取笔记列表
const fetchNotes = async () => {
  loading.value = true
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      ElMessage.error('用户未登录')
      return
    }

    // Get total count
    const countResult = await supabase
      .from('study_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (countResult.error) throw countResult.error
    total.value = countResult.count || 0

    // Get paginated data with learning type
    const { data, error } = await supabase
      .from('study_records')
      .select(`
        *
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value - 1)
    
    if (error) throw error
    notes.value = data
  } catch (error) {
    ElMessage.error('获取笔记列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 打开新增/编辑对话框
const openDialog = (note?: StudyRecord) => {
  if (note) {
    isEdit.value = true
    formData.value = { ...note }
  } else {
    isEdit.value = false
    formData.value = {
      id: 0,
      category: '',
      title: '',
      description: '',
      link: '',
      learning_type_id: 0,
      created_at: '',
      updated_at: ''
    }
  }
  dialogVisible.value = true
}

// Add pagination handlers
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchNotes()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchNotes()
}

// 保存笔记
const handleSave = async () => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      ElMessage.error('用户未登录')
      return
    }

    if (isEdit.value) {
      const { error } = await supabase
        .from('study_records')
        .update({
          category: formData.value.category,
          title: formData.value.title,
          description: formData.value.description,
          link: formData.value.link,
          learning_type_id: formData.value.learning_type_id
        })
        .eq('id', formData.value.id)
        .eq('user_id', userId)
      
      if (error) throw error
      ElMessage.success('更新成功')
    } else {
      const review1Time = new Date(new Date().getTime() + 3 * 60 * 60 * 1000)
      const review2Time = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      const review3Time = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)
      const review4Time = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
      const review5Time = new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000)

      const { error } = await supabase
        .from('study_records')
        .insert({
          category: formData.value.category,
          title: formData.value.title,
          description: formData.value.description,
          link: formData.value.link,
          learning_type_id: formData.value.learning_type_id,
          user_id: userId,
          review1_time: review1Time.toISOString(),
          review2_time: review2Time.toISOString(),
          review3_time: review3Time.toISOString(),
          review4_time: review4Time.toISOString(),
          review5_time: review5Time.toISOString()
        })

      if (error) throw error
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    currentPage.value = 1
    fetchNotes()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
    console.error(error)
  }
}

// 删除笔记
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条笔记吗？', '提示', {
      type: 'warning'
    })
    
    const { error } = await supabase
      .from('study_records')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    ElMessage.success('删除成功')
    if (notes.value.length === 1 && currentPage.value > 1) {
      currentPage.value-- // Go to previous page if current page becomes empty
    }
    fetchNotes()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

onMounted(async () => {
  await learningTypeStore.fetchLearningTypes()
  fetchNotes()
})
</script>

<template>
  <div class="study-notes">
    <div class="header">
      <!-- <h2>学习笔记</h2> -->
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>新增笔记
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="notes"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column prop="category" label="分类" width="100" align="center" />
      <el-table-column prop="title" label="标题" align="center" />
      <el-table-column label="学习类型" align="center" width="120">
        <template #default="{ row }">
          {{ row.learning_type?.name }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" show-overflow-tooltip align="center" />
      <el-table-column prop="link" label="链接" show-overflow-tooltip align="center">
        <template #default="{ row }">
          <el-link type="primary" :href="row.link" target="_blank">{{ row.link }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="review1_time" label="第一次复习时间" width="180" align="center">
        <template #default="{ row }">
          {{ new Date(row.review1_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="review2_time" label="第二次复习时间" width="180" align="center">
        <template #default="{ row }">
          {{ new Date(row.review2_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="review3_time" label="第三次复习时间" width="180" align="center">
        <template #default="{ row }">
          {{ new Date(row.review3_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="review4_time" label="第四次复习时间" width="180" align="center">
        <template #default="{ row }">
          {{ new Date(row.review4_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="review5_time" label="第五次复习时间" width="180" align="center">
        <template #default="{ row }">
          {{ new Date(row.review5_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" align="center">
        <template #default="{ row }">
          {{ new Date(row.created_at).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right" align="center">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" @click="openDialog(row)" link>
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" @click="handleDelete(row.id)" link>
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑笔记' : '新增笔记'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类">
            <el-option
              v-for="item in categories"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="学习类型" prop="learning_type_id">
          <el-select v-model="formData.learning_type_id" placeholder="请选择学习类型">
            <el-option
              v-for="type in learningTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入描述"
          />
        </el-form-item>

        <el-form-item label="链接" prop="link">
          <el-input v-model="formData.link" placeholder="请输入链接" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.study-notes {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 