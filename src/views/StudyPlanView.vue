<script setup lang="ts">
import type { StudyPlan } from '@/types'

import { supabase } from '@/lib/supabase'
import { useLearningTypeStore } from '@/stores/learningType'

const loading = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const selectedPlan = ref<StudyPlan | null>(null)
const studyPlans = ref<StudyPlan[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 引入学习类型 store
const learningTypeStore = useLearningTypeStore()
const { learningTypes } = storeToRefs(learningTypeStore)

const newPlan = ref({
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  status: 'pending' as const,
  priority: 'medium' as const,
  learning_type_id: undefined as number | undefined
})

const fetchStudyPlans = async () => {
  loading.value = true
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      ElMessage.error('用户未登录')
      return
    }

    // Get total count
    const countResult = await supabase
      .from('study_plan')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (countResult.error) throw countResult.error
    total.value = countResult.count || 0

    // Get paginated data with learning type
    const { data, error } = await supabase
      .from('study_plan_types') // 视图
      .select(`
        *
      `)
      .eq('user_id', userId)
      // .eq('study_plan.learning_type_id', 'learning_types.id') // 手动指定连接条件
      .order('created_at', { ascending: false })
      .range((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value - 1)
    if (error) throw error
    studyPlans.value = data
  } catch (error) {
    ElMessage.error('获取学习计划列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await learningTypeStore.fetchLearningTypes()
  fetchStudyPlans()
})

const handleCreate = async () => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      ElMessage.error('用户未登录')
      return
    }

    const { error } = await supabase
      .from('study_plan')
      .insert([{ ...newPlan.value, user_id: userId }])
    
    if (error) throw error
    
    showCreateDialog.value = false
    ElMessage.success('学习计划创建成功')
    resetForm()
    currentPage.value = 1 // Reset to first page after creating
    fetchStudyPlans()
  } catch (error) {
    ElMessage.error('学习计划创建失败')
    console.error(error)
  }
}

const handleEdit = async () => {
  if (!selectedPlan.value) return
  try {
    // 从selectedPlan中排除name
    const { name, id, created_at, updated_at, learning_type, ...updates } = selectedPlan.value
    const { error } = await supabase
      .from('study_plan')
      .update(updates)
      .eq('id', id)
    
    if (error) throw error
    
    showEditDialog.value = false
    ElMessage.success('学习计划更新成功')
    fetchStudyPlans()
  } catch (error) {
    ElMessage.error('学习计划更新失败')
    console.error(error)
  }
}

const handleDelete = async (id: number) => {
  //确认 是否删除
  ElMessageBox.confirm('确定删除该学习计划吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
  try {
    const { error } = await supabase
      .from('study_plan')
      .delete()
      .eq('id', id)
    if (error) throw error
    
    ElMessage.success('学习计划删除成功')
    if (studyPlans.value.length === 1 && currentPage.value > 1) {
      currentPage.value-- // Go to previous page if current page becomes empty
    }
    fetchStudyPlans()
  } catch (error) {
    ElMessage.error('学习计划删除失败')
    console.error(error)
  }
  })
}

const resetForm = () => {
  newPlan.value = {
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    status: 'pending',
    priority: 'medium',
    learning_type_id: undefined
  }
}

const editPlan = (plan: StudyPlan) => {
  selectedPlan.value = { ...plan }
  showEditDialog.value = true
}

const getPriorityType = (priority: string) => {
  const types = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority as keyof typeof types] || 'info'
}

const getStatusType = (status: string) => {
  const types = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success'
  }
  return types[status as keyof typeof types] || 'info'
}

// Add pagination handlers
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchStudyPlans()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchStudyPlans()
}
</script>

<template>
  <div class="study-plan-view">
    <div class="header">
      <el-button type="primary" @click="showCreateDialog = true">
        新增学习计划
      </el-button>
    </div>

    <el-table v-loading="loading" :data="studyPlans" style="width: 100%" border stripe>
      <el-table-column prop="title" label="标题" align="center" />
      <el-table-column label="学习类型" align="center" width="120">
        <template #default="{ row }">
          {{ row?.name }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" show-overflow-tooltip align="center" />
      <el-table-column prop="start_time" label="开始时间" align="center">
        <template #default="{ row }">
          {{ new Date(row.start_time).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="end_time" label="结束时间" align="center">
        <template #default="{ row }">
          {{ new Date(row.end_time).toLocaleString() }}
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
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" @click="editPlan(row)" link>
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
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- Create Dialog -->
    <el-dialog 
      v-model="showCreateDialog" 
      title="新增学习计划"
      width="500px"
    >
      <el-form :model="newPlan" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="newPlan.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="学习类型" required>
          <el-select v-model="newPlan.learning_type_id" placeholder="请选择学习类型">
            <el-option
              v-for="type in learningTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="newPlan.description"
            type="textarea"
            placeholder="请输入描述"
          />
        </el-form-item>

        <el-form-item label="开始时间" required>
          <el-date-picker
            v-model="newPlan.start_time"
            type="datetime"
            placeholder="选择开始时间"
          />
        </el-form-item>

        <el-form-item label="结束时间" required>
          <el-date-picker
            v-model="newPlan.end_time"
            type="datetime"
            placeholder="选择结束时间"
          />
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
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Edit Dialog -->
    <el-dialog 
      v-model="showEditDialog" 
      title="编辑学习计划"
      width="500px"
    >
      <el-form v-if="selectedPlan" :model="selectedPlan" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="selectedPlan.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="学习类型" required>
          <el-select v-model="selectedPlan.learning_type_id" placeholder="请选择学习类型">
            <el-option
              v-for="type in learningTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="selectedPlan.description"
            type="textarea"
            placeholder="请输入描述"
          />
        </el-form-item>

        <el-form-item label="开始时间" required>
          <el-date-picker
            v-model="selectedPlan.start_time"
            type="datetime"
            placeholder="选择开始时间"
          />
        </el-form-item>

        <el-form-item label="结束时间" required>
          <el-date-picker
            v-model="selectedPlan.end_time"
            type="datetime"
            placeholder="选择结束时间"
          />
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
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="handleEdit">确定</el-button>
        </span>
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

</style>