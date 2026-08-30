<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { issueService, type Issue } from '@/services/issueService'
import { ElMessage } from 'element-plus'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { usePaginationLayout } from '@/composables/useResponsiveDialog'
import { useMobileForm } from '@/composables/useMobileForm'

const { isMobile } = useBreakpoint()
const { paginationLayout } = usePaginationLayout()
const { formLabelWidth, formLabelPosition, formClass, dialogWidth, dialogFullscreen, dialogClass } =
  useMobileForm('100px', '50%')

const issues = ref<Issue[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const currentIssue = ref<Partial<Issue>>({
  title: '',
  issue_type: '',
  description: '',
  status: '待处理',
  priority: '中',
  solution: '',
  cause: '',
  preventive_measures: '',
})

const issueTypes = [
  '代码问题',
  '环境配置',
  '业务逻辑',
  '性能优化',
  '安全问题',
  '其他',
]

const fetchIssues = async () => {
  loading.value = true
  try {
    issues.value = await issueService.getIssues()
    total.value = issues.value.length
  } catch (error) {
    ElMessage.error('获取问题列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleCreateIssue = async () => {
  try {
    await issueService.createIssue(currentIssue.value as any)
    ElMessage.success('创建成功')
    dialogVisible.value = false
    currentIssue.value = {
      title: '',
      issue_type: '',
      description: '',
      status: '待处理',
      priority: '中',
      solution: '',
      cause: '',
      preventive_measures: '',
    }
    await fetchIssues()
  } catch (error) {
    ElMessage.error('创建失败')
    console.error(error)
  }
}

const handleUpdateStatus = async (issue: Issue, newStatus: Issue['status']) => {
  try {
    await issueService.updateIssue(issue.issue_id, { status: newStatus })
    ElMessage.success('状态更新成功')
    await fetchIssues()
  } catch (error) {
    ElMessage.error('状态更新失败')
    console.error(error)
  }
}

const handleEdit = (issue: Issue) => {
  currentIssue.value = { ...issue }
  isEditing.value = true
  dialogVisible.value = true
}

const handleUpdate = async () => {
  if (!currentIssue.value.issue_id) return

  try {
    await issueService.updateIssue(currentIssue.value.issue_id, {
      title: currentIssue.value.title,
      issue_type: currentIssue.value.issue_type,
      description: currentIssue.value.description,
      priority: currentIssue.value.priority,
    })
    ElMessage.success('更新成功')
    dialogVisible.value = false
    isEditing.value = false
    currentIssue.value = {
      title: '',
      issue_type: '',
      description: '',
      status: '待处理',
      priority: '中',
      solution: '',
      cause: '',
      preventive_measures: '',
    }
    await fetchIssues()
  } catch (error) {
    ElMessage.error('更新失败')
    console.error(error)
  }
}

const handleDelete = async (issueId: number) => {
  ElMessageBox.confirm('确定删除该问题吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await issueService.deleteIssue(issueId)
    ElMessage.success('删除成功')
    await fetchIssues()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const paginatedIssues = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return issues.value.slice(start, end)
})

/** 优先级 Tag 类型映射 */
const getPriorityType = (priority: string) =>
  priority === '高' ? 'danger' : priority === '中' ? 'warning' : 'info'

const openCreateDialog = () => {
  dialogVisible.value = true
  isEditing.value = false
}

onMounted(fetchIssues)
</script>

<template>
  <div class="issues-container page-panel">
    <div class="header page-panel__header">
      <el-button type="primary" class="btn-block-mobile" @click="openCreateDialog">
        新建问题
      </el-button>
    </div>

    <el-card class="table-card">
      <!-- 桌面端表格 -->
      <el-table v-if="!isMobile" v-loading="loading" :data="paginatedIssues" style="width: 100%" border stripe>
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="issue_type" label="类型" width="120" />
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            <el-tooltip :content="row.description" placement="top">
              <span class="ellipsis">{{ row.description }}</span>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-select v-model="row.status" @change="handleUpdateStatus(row, $event)">
              <el-option label="待处理" value="待处理" />
              <el-option label="处理中" value="处理中" />
              <el-option label="已解决" value="已解决" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="$router.push(`/issues/${row.issue_id}`)">
              查看详情
            </el-button>
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row.issue_id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 手机端卡片列表 -->
      <div v-else v-loading="loading" class="mobile-card-list">
        <el-empty v-if="paginatedIssues.length === 0" description="暂无问题" />
        <div v-for="row in paginatedIssues" :key="row.issue_id" class="mobile-card">
          <div class="mobile-card__header">
            <span class="mobile-card__title">{{ row.title }}</span>
            <el-tag size="small" :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
          </div>

          <div class="mobile-card__body">
            <div class="mobile-card__row">
              <span class="mobile-card__label">类型</span>
              <span class="mobile-card__value">{{ row.issue_type }}</span>
            </div>
            <div class="mobile-card__row">
              <span class="mobile-card__label">描述</span>
              <span class="mobile-card__value">{{ row.description }}</span>
            </div>
            <div class="mobile-card__row">
              <span class="mobile-card__label">状态</span>
              <el-select
                v-model="row.status"
                size="small"
                style="flex: 1"
                @change="handleUpdateStatus(row, $event)"
              >
                <el-option label="待处理" value="待处理" />
                <el-option label="处理中" value="处理中" />
                <el-option label="已解决" value="已解决" />
              </el-select>
            </div>
            <div class="mobile-card__row">
              <span class="mobile-card__label">创建</span>
              <span class="mobile-card__value">{{ new Date(row.created_at).toLocaleString() }}</span>
            </div>
          </div>

          <div class="mobile-card__actions">
            <el-button size="small" type="primary" @click="$router.push(`/issues/${row.issue_id}`)">
              详情
            </el-button>
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.issue_id)">删除</el-button>
          </div>
        </div>
      </div>

      <div class="pagination-container" :class="{ 'pagination-container--mobile': isMobile }">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          :layout="paginationLayout"
          :small="isMobile"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑问题' : '新建问题'"
      :width="dialogWidth"
      :fullscreen="dialogFullscreen"
      :class="dialogClass"
      destroy-on-close
    >
      <el-form
        :model="currentIssue"
        :class="formClass"
        :label-width="formLabelWidth"
        :label-position="formLabelPosition"
      >
        <el-form-item label="标题" required>
          <el-input v-model="currentIssue.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="问题类型" required>
          <el-select v-model="currentIssue.issue_type" placeholder="请选择问题类型" style="width: 100%">
            <el-option
              v-for="type in issueTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" required>
          <el-select v-model="currentIssue.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述" required>
          <el-input
            v-model="currentIssue.description"
            type="textarea"
            :rows="4"
            placeholder="请输入问题描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="isEditing ? handleUpdate() : handleCreateIssue()">
            {{ isEditing ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.issues-container {
  .header {
    margin-bottom: 0;
  }

  .table-card {
    margin-bottom: 20px;
    border: none;
    box-shadow: none;
    background: transparent;

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .ellipsis {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
}
</style>
