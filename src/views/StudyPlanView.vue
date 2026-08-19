<script setup lang="ts">
import type { StudyPlan } from '@/types'
import { useAuthUser } from '@/composables/useAuthUser'
import { studyPlanService } from '@/services/studyPlanService'
import { useLearningTypeStore } from '@/stores/learningType'

const { requireUserId } = useAuthUser()
const learningTypeStore = useLearningTypeStore()
const { learningTypes } = storeToRefs(learningTypeStore)

const loading = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const selectedPlan = ref<StudyPlan | null>(null)
const studyPlans = ref<StudyPlan[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

type TagType = 'success' | 'warning' | 'info' | 'primary' | 'danger'

const newPlan = ref({
  title: '',
  description: '',
  start_time: undefined as string | undefined,
  end_time: undefined as string | undefined,
  status: 'pending' as const,
  priority: 'medium' as const,
  learning_type_id: undefined as number | undefined,
})

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  learning_type_id: [{ required: true, message: '请选择学习类型', trigger: 'change' }],
}

const fetchStudyPlans = async () => {
  loading.value = true
  try {
    const userId = requireUserId()
    const { data, total: totalCount } = await studyPlanService.list(userId, {
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    studyPlans.value = data
    total.value = totalCount
  } catch (error) {
    if ((error as Error).message !== 'NOT_AUTHENTICATED') {
      ElMessage.error('获取学习计划列表失败')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  try {
    const userId = requireUserId()
    await studyPlanService.create(userId, {
      title: newPlan.value.title,
      description: newPlan.value.description,
      start_time: newPlan.value.start_time || '',
      end_time: newPlan.value.end_time || '',
      status: newPlan.value.status,
      priority: newPlan.value.priority,
      learning_type_id: newPlan.value.learning_type_id!,
    })
    showCreateDialog.value = false
    ElMessage.success('学习计划创建成功')
    resetForm()
    currentPage.value = 1
    await fetchStudyPlans()
  } catch (error) {
    if ((error as Error).message !== 'NOT_AUTHENTICATED') {
      ElMessage.error('学习计划创建失败')
      console.error(error)
    }
  }
}

const handleEdit = async () => {
  if (!selectedPlan.value) return
  try {
    await studyPlanService.update(selectedPlan.value.id, selectedPlan.value)
    showEditDialog.value = false
    ElMessage.success('学习计划更新成功')
    await fetchStudyPlans()
  } catch (error) {
    ElMessage.error('学习计划更新失败')
    console.error(error)
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该学习计划吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await studyPlanService.remove(id)
    ElMessage.success('学习计划删除成功')
    if (studyPlans.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
    await fetchStudyPlans()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('学习计划删除失败')
      console.error(error)
    }
  }
}

const resetForm = () => {
  newPlan.value = {
    title: '',
    description: '',
    start_time: undefined,
    end_time: undefined,
    status: 'pending',
    priority: 'medium',
    learning_type_id: undefined,
  }
}

const editPlan = (plan: StudyPlan) => {
  selectedPlan.value = { ...plan }
  showEditDialog.value = true
}

const getPriorityType = (priority: string): TagType => {
  const types: Record<string, TagType> = { high: 'danger', medium: 'warning', low: 'info' }
  return types[priority] || 'info'
}

const getStatusType = (status: string): TagType => {
  const types: Record<string, TagType> = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
  }
  return types[status] || 'info'
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchStudyPlans()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchStudyPlans()
}

onMounted(async () => {
  await learningTypeStore.fetchLearningTypes()
  await fetchStudyPlans()
})
</script>

<template>
  <div class="study-plan-view">
    <div class="header">
      <el-button type="primary" @click="showCreateDialog = true">新增学习计划</el-button>
    </div>

    <el-table v-loading="loading" :data="studyPlans" style="width: 100%" border stripe>
      <el-table-column prop="title" label="标题" align="center" />
      <el-table-column label="学习类型" align="center" width="120">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column prop="description" label="描述" show-overflow-tooltip align="center" />
      <el-table-column prop="start_time" label="开始时间" align="center">
        <template #default="{ row }">
          {{ row.start_time ? new Date(row.start_time).toLocaleString() : '未设置' }}
        </template>
      </el-table-column>
      <el-table-column prop="end_time" label="结束时间" align="center">
        <template #default="{ row }">
          {{ row.end_time ? new Date(row.end_time).toLocaleString() : '未设置' }}
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" align="center">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)">
            {{ row.priority === 'high' ? '高' : row.priority === 'medium' ? '中' : '低' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ row.status === 'pending' ? '待完成' : row.status === 'in_progress' ? '进行中' : '已完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="editPlan(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog v-model="showCreateDialog" title="新增学习计划" width="50%">
      <el-form :model="newPlan" label-width="120px" :rules="formRules">
        <el-form-item label="标题" prop="title" required>
          <el-input v-model="newPlan.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="学习类型" prop="learning_type_id" required>
          <el-select v-model="newPlan.learning_type_id" placeholder="请选择学习类型">
            <el-option v-for="type in learningTypes" :key="type.id" :label="type.name" :value="type.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newPlan.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="newPlan.start_time" type="datetime" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="newPlan.end_time" type="datetime" placeholder="选择结束时间" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="newPlan.priority">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="newPlan.status">
            <el-option label="待完成" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEditDialog" title="编辑学习计划" width="50%">
      <el-form v-if="selectedPlan" :model="selectedPlan" label-width="120px" :rules="formRules">
        <el-form-item label="标题" prop="title" required>
          <el-input v-model="selectedPlan.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="学习类型" prop="learning_type_id" required>
          <el-select v-model="selectedPlan.learning_type_id" placeholder="请选择学习类型">
            <el-option v-for="type in learningTypes" :key="type.id" :label="type.name" :value="type.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="selectedPlan.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="selectedPlan.start_time" type="datetime" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="selectedPlan.end_time" type="datetime" placeholder="选择结束时间" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="selectedPlan.priority">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="selectedPlan.status">
            <el-option label="待完成" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.study-plan-view {
  padding: 20px;
  background: #fff;
  border-radius: 8px;

  .header {
    margin-bottom: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
