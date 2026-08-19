<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthUser } from '@/composables/useAuthUser'
import { useTableHeight } from '@/composables/useTableHeight'
import { studyRecordService } from '@/services/studyRecordService'
import { useLearningTypeStore } from '@/stores/learningType'
import type { StudyRecord } from '@/types'
import { formatDateTime, isSameDay } from '@/utils/date'

const { requireUserId } = useAuthUser()
const { tableHeight } = useTableHeight()
const learningTypeStore = useLearningTypeStore()
const { learningTypes } = storeToRefs(learningTypeStore)

const notes = ref<StudyRecord[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const formRef = ref<FormInstance>()

const queryParams = ref({
  learningTypeId: undefined as number | undefined,
  reviewStatus: 'incomplete' as 'all' | 'complete' | 'incomplete',
})

const emptyForm = (): StudyRecord => ({
  id: 0,
  title: '',
  description: '',
  link: '',
  learning_type_id: undefined,
  created_at: '',
  updated_at: '',
})

const formData = ref<StudyRecord>(emptyForm())

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  learning_type_id: [{ required: true, message: '请选择学习类型', trigger: 'change' }],
}

const reviewTimeFields = [
  { key: 'review1_time', index: 0, label: '第一次复习时间' },
  { key: 'review2_time', index: 1, label: '第二次复习时间' },
  { key: 'review3_time', index: 2, label: '第三次复习时间' },
  { key: 'review4_time', index: 3, label: '第四次复习时间' },
  { key: 'review5_time', index: 4, label: '第五次复习时间' },
] as const

const getReviewCellClass = (row: StudyRecord, index: number, time?: string) => {
  if (!time || !row.review_status) return ''
  if (isSameDay(time) && row.review_status[index] === '0') return 'review-today'
  if (isSameDay(time) && row.review_status[index] === '1') return 'review-completed'
  return ''
}

const fetchNotes = async () => {
  loading.value = true
  try {
    const userId = requireUserId()
    const { data, total: totalCount } = await studyRecordService.list(userId, {
      learningTypeId: queryParams.value.learningTypeId,
      reviewStatus: queryParams.value.reviewStatus,
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    notes.value = data
    total.value = totalCount
  } catch (error) {
    if ((error as Error).message !== 'NOT_AUTHENTICATED') {
      ElMessage.error('获取笔记列表失败')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const updateReviewStatus = async (recordId: number, index: number) => {
  try {
    const record = notes.value.find((note) => note.id === recordId)
    if (!record?.review_status) return

    const newStatus = record.review_status.split('')
    if (newStatus[index] === '1') return

    newStatus[index] = '1'
    await studyRecordService.updateReviewStatus(recordId, newStatus.join(''))
    record.review_status = newStatus.join('')
    ElMessage.success('更新复习状态成功')
  } catch (error) {
    ElMessage.error('更新复习状态失败')
    console.error(error)
  }
}

const openDialog = (note?: StudyRecord) => {
  isEdit.value = Boolean(note)
  formData.value = note ? { ...note } : emptyForm()
  dialogVisible.value = true
}

const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    const userId = requireUserId()
    const payload = {
      title: formData.value.title,
      description: formData.value.description,
      link: formData.value.link,
      learning_type_id: formData.value.learning_type_id,
    }

    if (isEdit.value) {
      await studyRecordService.update(userId, formData.value.id, payload)
      ElMessage.success('更新成功')
    } else {
      await studyRecordService.create(userId, payload)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    currentPage.value = 1
    await fetchNotes()
  } catch (error) {
    if ((error as Error).message !== 'NOT_AUTHENTICATED') {
      ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      console.error(error)
    }
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条笔记吗？', '提示', { type: 'warning' })
    await studyRecordService.remove(id)
    ElMessage.success('删除成功')
    if (notes.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
    await fetchNotes()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchNotes()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchNotes()
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchNotes()
}

onMounted(async () => {
  await learningTypeStore.fetchLearningTypes()
  await fetchNotes()
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
            @change="handleFilterChange"
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
          <el-select v-model="queryParams.reviewStatus" @change="handleFilterChange">
            <el-option label="全部" value="all" />
            <el-option label="已完成复习" value="complete" />
            <el-option label="未完成复习" value="incomplete" />
          </el-select>
        </div>
      </div>

      <el-button type="primary" @click="openDialog()">新增笔记</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="notes"
      :height="tableHeight"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column prop="title" label="标题" align="center" min-width="120" />
      <el-table-column label="学习类型" align="center" width="120">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column prop="description" label="描述" show-overflow-tooltip align="center" min-width="140" />
      <el-table-column prop="link" label="链接" show-overflow-tooltip align="center" min-width="120">
        <template #default="{ row }">
          <el-link v-if="row.link" type="primary" :href="row.link" target="_blank">{{ row.link }}</el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="复习状态" width="140" align="center">
        <template #default="{ row }">
          <div class="review-status">
            <div
              v-for="(status, index) in row.review_status?.split('')"
              :key="index"
              class="status-circle"
              :class="{ completed: status === '1', clickable: status === '0' }"
              @click="status === '0' && updateReviewStatus(row.id, index)"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-for="field in reviewTimeFields"
        :key="field.key"
        :prop="field.key"
        :label="field.label"
        width="180"
        align="center"
      >
        <template #default="{ row }">
          <span :class="getReviewCellClass(row, field.index, row[field.key])">
            {{ formatDateTime(row[field.key]) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑笔记' : '新增笔记'" width="500px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
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
          <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="链接" prop="link">
          <el-input v-model="formData.link" placeholder="请输入链接" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
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
    }
  }

  .review-status {
    display: flex;
    justify-content: center;
    gap: 8px;

    .status-circle {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: #909399;

      &.completed {
        background-color: #67c23a;
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
