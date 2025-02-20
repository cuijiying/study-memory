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
const tableHeight = ref('400px')

// 查询条件
const queryParams = ref({
  learningTypeId: undefined as number | undefined,
  reviewStatus: 'incomplete' // 'all' | 'complete' | 'incomplete'
})

// 引入学习类型 store
const learningTypeStore = useLearningTypeStore()
const { learningTypes } = storeToRefs(learningTypeStore)

const formData = ref<StudyRecord>({
  id: 0,
  title: '',
  description: '',
  link: '',
  learning_type_id: undefined,
  created_at: '',
  updated_at: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  learning_type_id: [{ required: true, message: '请选择学习类型', trigger: 'change' }]
}

// 计算表格高度
const calcTableHeight = () => {
  // 获取视窗高度
  const windowHeight = window.innerHeight
  // 减去其他元素的高度(header + pagination + padding等)
  tableHeight.value = `${windowHeight - 280}px`
}

// 监听窗口大小变化
window.addEventListener('resize', calcTableHeight)

// 判断是否是当天
const isToday = (date: string) => {
  const today = new Date()
  const compareDate = new Date(date)
  return today.getDate() === compareDate.getDate() &&
    today.getMonth() === compareDate.getMonth() &&
    today.getFullYear() === compareDate.getFullYear()
}

// 更新复习状态
const updateReviewStatus = async (recordId: number, index: number) => {
  try {
    const record = notes.value.find(note => note.id === recordId)
    if (!record || !record.review_status) return
    
    const newStatus = record.review_status.split('')
    if (newStatus[index] === '1') return // 已完成不能修改
    
    newStatus[index] = '1'
    const { error } = await supabase
      .from('study_records')
      .update({ review_status: newStatus.join('') })
      .eq('id', recordId)

    if (error) throw error
    record.review_status = newStatus.join('')
    ElMessage.success('更新复习状态成功')
  } catch (error) {
    ElMessage.error('更新复习状态失败')
    console.error(error)
  }
}

// 获取笔记列表
const fetchNotes = async () => {
  loading.value = true
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      ElMessage.error('用户未登录')
      return
    }

    let query = supabase
      .from('study_records_types')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)

    // 添加学习类型筛选
    if (queryParams.value.learningTypeId) {
      query = query.eq('learning_type_id', queryParams.value.learningTypeId)
    }

    // 添加复习状态筛选
    if (queryParams.value.reviewStatus === 'complete') {
      query = query.eq('review_status', '11111')
    } else if (queryParams.value.reviewStatus === 'incomplete') {
      query = query.neq('review_status', '11111')
    }

    // Get paginated data with count
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value - 1)
    
    if (error) throw error
    notes.value = data
    total.value = count || 0
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
      title: '',
      description: '',
      link: '',
      learning_type_id: undefined,
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
      const review2Time = new Date(new Date().getTime() + 27 * 60 * 60 * 1000)
      const review3Time = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000)
      const review4Time = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
      const review5Time = new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000)

      const { error } = await supabase
        .from('study_records')
        .insert({
          title: formData.value.title,
          description: formData.value.description,
          link: formData.value.link,
          learning_type_id: formData.value.learning_type_id,
          user_id: userId,
          review1_time: review1Time.toLocaleString(),
          review2_time: review2Time.toLocaleString(),
          review3_time: review3Time.toLocaleString(),
          review4_time: review4Time.toLocaleString(),
          review5_time: review5Time.toLocaleString(),
          review_status: '00000'
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
      currentPage.value--
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
   calcTableHeight()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', calcTableHeight)
})
</script>

<template>
  <div class="study-notes">
    <div class="header">
      <div class="filters">
        <div class="filter-item">
          <label>学习类型:</label>
          <el-select 
            v-model="queryParams.learningTypeId" 
            placeholder="选择学习类型"
            clearable
            @change="fetchNotes"
          >
            <el-option
              v-for="type in learningTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </div>

        <div class="filter-item">
          <label>复习状态:</label>
          <el-select 
            v-model="queryParams.reviewStatus" 
            placeholder="复习状态"
            @change="fetchNotes"
          >
            <el-option label="全部" value="all" />
            <el-option label="已完成复习" value="complete" />
            <el-option label="未完成复习" value="incomplete" />
          </el-select>
        </div>
      </div>

      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>新增笔记
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="notes"
      :height="tableHeight"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column prop="title" label="标题" align="center" />
      <el-table-column label="学习类型" align="center" width="120">
        <template #default="{ row }">
          {{ row?.name }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" show-overflow-tooltip align="center" />
      <el-table-column prop="link" label="链接" show-overflow-tooltip align="center">
        <template #default="{ row }">
          <el-link type="primary" :href="row.link" target="_blank">{{ row.link }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="复习状态" width="200" align="center">
        <template #default="{ row }">
          <div class="review-status">
            <div
              v-for="(status, index) in row.review_status?.split('')"
              :key="index"
              class="status-circle"
              :class="{
                'completed': status === '1',
                'clickable': status === '0'
              }"
              @click="status === '0' && updateReviewStatus(row.id, index)"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="review1_time" label="第一次复习时间" width="180" align="center">
        <template #default="{ row }">
          <span :class="{ 
            'review-today': isToday(row.review1_time) && row.review_status[0] === '0',
            'review-completed': isToday(row.review1_time) && row.review_status[0] === '1'
          }">
            {{ new Date(row.review1_time).toLocaleString() }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="review2_time" label="第二次复习时间" width="180" align="center">
        <template #default="{ row }">
          <span :class="{ 
            'review-today': isToday(row.review2_time) && row.review_status[1] === '0',
            'review-completed': isToday(row.review2_time) && row.review_status[1] === '1'
          }">
            {{ new Date(row.review2_time).toLocaleString() }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="review3_time" label="第三次复习时间" width="180" align="center">
        <template #default="{ row }">
          <span :class="{ 
            'review-today': isToday(row.review3_time) && row.review_status[2] === '0',
            'review-completed': isToday(row.review3_time) && row.review_status[2] === '1'
          }">
            {{ new Date(row.review3_time).toLocaleString() }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="review4_time" label="第四次复习时间" width="180" align="center">
        <template #default="{ row }">
          <span :class="{ 
            'review-today': isToday(row.review4_time) && row.review_status[3] === '0',
            'review-completed': isToday(row.review4_time) && row.review_status[3] === '1'
          }">
            {{ new Date(row.review4_time).toLocaleString() }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="review5_time" label="第五次复习时间" width="180" align="center">
        <template #default="{ row }">
          <span :class="{ 
            'review-today': isToday(row.review5_time) && row.review_status[4] === '0',
            'review-completed': isToday(row.review5_time) && row.review_status[4] === '1'
          }">
            {{ new Date(row.review5_time).toLocaleString() }}
          </span>
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
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 8px;

    .filters {
      display: flex;
      gap: 24px;
      align-items: center;

      .filter-item {
        display: flex;
        align-items: center;
        gap: 8px;

        label {
          font-size: 14px;
          color: #606266;
          white-space: nowrap;
        }

        .el-select {
          width: 180px;
        }
      }
    }

    .el-button {
      padding: 8px 16px;
      .el-icon {
        margin-right: 4px;
      }
    }
  }

  .review-status {
    padding: 5px;
    display: flex;
    justify-content: center;
    gap: 8px;

    .status-circle {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: #909399;
      border: 1px solid #fff;
      box-shadow: 0 0 3px 1px rgba(0, 0, 0, 0.5);
      &.completed {
        background-color: #67C23A;
      }

      &.clickable {
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }

  .review-today {
    background-color: #fef0f0;
    padding: 4px 8px;
    border-radius: 4px;
    color: #f56c6c;
  }

  .review-completed {
    background-color: #f0f9eb;
    padding: 4px 8px;
    border-radius: 4px;
    color: #67c23a;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

</style> 