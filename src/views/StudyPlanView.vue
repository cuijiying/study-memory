<script setup lang="ts">
import type { StudyPlan, StudyPlanTreeRow, StudyPlanUnitGroup } from '@/types'
import { useAuthUser } from '@/composables/useAuthUser'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useMobileForm } from '@/composables/useMobileForm'
import { studyPlanService } from '@/services/studyPlanService'
import { useLearningTypeStore } from '@/stores/learningType'

const { requireUserId } = useAuthUser()
const { isMobile } = useBreakpoint()
const { formLabelWidth, formLabelPosition, formClass, dialogWidth, dialogFullscreen, dialogClass } =
  useMobileForm('120px', '50%')
const learningTypeStore = useLearningTypeStore()
const { learningTypes } = storeToRefs(learningTypeStore)

type StudyPlanEditForm = Omit<
  StudyPlan,
  'unit_number' | 'week_number' | 'learning_type_id' | 'start_time' | 'end_time'
> & {
  learning_type_id?: number
  unit_number?: number
  week_number?: number
  start_time?: string
  end_time?: string
}

const loading = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const createDialogTitle = ref('新增学习计划')
const selectedPlan = ref<StudyPlanEditForm | null>(null)
const studyPlans = ref<StudyPlan[]>([])
const treeData = ref<StudyPlanTreeRow[]>([])

const queryParams = ref({
  learningTypeId: undefined as number | undefined,
  status: 'all' as 'all' | StudyPlan['status'],
  priority: 'all' as 'all' | StudyPlan['priority'],
  unitNumber: undefined as number | undefined,
  weekNumber: undefined as number | undefined,
})

type TagType = 'success' | 'warning' | 'info' | 'primary' | 'danger'

const emptyPlanForm = () => ({
  title: '',
  description: '',
  start_time: undefined as string | undefined,
  end_time: undefined as string | undefined,
  status: 'not_started' as const,
  priority: 'medium' as const,
  learning_type_id: undefined as number | undefined,
  unit_number: undefined as number | undefined,
  week_number: undefined as number | undefined,
})

const newPlan = ref(emptyPlanForm())

const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  learning_type_id: [{ required: true, message: '请选择学习类型', trigger: 'change' }],
}

const isUnitRow = (row: StudyPlanTreeRow): row is StudyPlanUnitGroup => Boolean(row.isUnit)

/** 是否可在该单元/计划下快速添加 */
const canAddUnder = (row: StudyPlanTreeRow) => {
  if (isUnitRow(row)) return row.unit_number != null
  return row.unit_number != null || row.week_number != null
}

const fillPlanFromTemplate = (template: StudyPlan) => ({
  title: '',
  description: template.description,
  start_time: template.start_time ?? undefined,
  end_time: template.end_time ?? undefined,
  status: 'not_started' as const,
  priority: template.priority,
  learning_type_id: template.learning_type_id ?? undefined,
  unit_number: template.unit_number ?? undefined,
  week_number: template.week_number ?? undefined,
})

const openCreateDialog = (source?: StudyPlan | StudyPlanUnitGroup) => {
  newPlan.value = emptyPlanForm()
  createDialogTitle.value = '新增学习计划'

  if (!source) {
    showCreateDialog.value = true
    return
  }

  if (isUnitRow(source)) {
    if (source.unit_number == null) {
      showCreateDialog.value = true
      return
    }
    createDialogTitle.value = `在第 ${source.unit_number} 单元下新增计划`
    newPlan.value.unit_number = source.unit_number
    const template = source.children[0]
    if (template) {
      newPlan.value = { ...fillPlanFromTemplate(template), unit_number: source.unit_number }
    }
  } else {
    createDialogTitle.value =
      source.unit_number != null
        ? `在第 ${source.unit_number} 单元下新增计划`
        : '新增学习计划'
    newPlan.value = fillPlanFromTemplate(source)
  }

  showCreateDialog.value = true
}

const getLearningTypeName = (row: StudyPlan) =>
  row.learning_type_name || row.name || '-'

const buildPlanTree = (plans: StudyPlan[]): StudyPlanTreeRow[] => {
  const groups = new Map<number | 'unset', StudyPlan[]>()

  for (const plan of plans) {
    const key = plan.unit_number ?? 'unset'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(plan)
  }

  const sortedKeys = [...groups.keys()].sort((a, b) => {
    if (a === 'unset') return 1
    if (b === 'unset') return -1
    return a - b
  })

  return sortedKeys.map((key) => ({
    id: `unit-${key}`,
    isUnit: true as const,
    title: key === 'unset' ? '未指定单元' : `第 ${key} 单元`,
    unit_number: key === 'unset' ? null : key,
    children: groups
      .get(key)!
      .sort((a, b) => (a.week_number ?? 0) - (b.week_number ?? 0)),
  }))
}

const fetchStudyPlans = async () => {
  loading.value = true
  try {
    const userId = requireUserId()
    const { data } = await studyPlanService.list(userId, {
      learningTypeId: queryParams.value.learningTypeId,
      status: queryParams.value.status,
      priority: queryParams.value.priority,
      unitNumber: queryParams.value.unitNumber,
      weekNumber: queryParams.value.weekNumber,
    })
    studyPlans.value = data
    treeData.value = buildPlanTree(data)
  } catch (error) {
    if ((error as Error).message !== 'NOT_AUTHENTICATED') {
      ElMessage.error('获取学习计划列表失败')
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  fetchStudyPlans()
}

const handleCreate = async () => {
  try {
    const userId = requireUserId()
    await studyPlanService.create(userId, {
      title: newPlan.value.title,
      description: newPlan.value.description,
      start_time: newPlan.value.start_time || null,
      end_time: newPlan.value.end_time || null,
      status: newPlan.value.status,
      priority: newPlan.value.priority,
      learning_type_id: newPlan.value.learning_type_id ?? null,
      unit_number: newPlan.value.unit_number ?? null,
      week_number: newPlan.value.week_number ?? null,
    })
    showCreateDialog.value = false
    ElMessage.success('学习计划创建成功')
    resetForm()
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
    await fetchStudyPlans()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('学习计划删除失败')
      console.error(error)
    }
  }
}

const handleStatusToggle = async (plan: StudyPlan, val: string | number | boolean) => {
  const checked = val === true
  const newStatus = checked ? 'completed' : 'not_started'
  if (plan.status === newStatus) return

  try {
    await studyPlanService.updateStatus(plan.id, newStatus)
    plan.status = newStatus
    ElMessage.success(checked ? '已标记为完成' : '已标记为待完成')
  } catch (error) {
    ElMessage.error('更新状态失败')
    console.error(error)
  }
}

const resetForm = () => {
  newPlan.value = emptyPlanForm()
  createDialogTitle.value = '新增学习计划'
}

const editPlan = (plan: StudyPlan) => {
  selectedPlan.value = {
    ...plan,
    learning_type_id: plan.learning_type_id ?? undefined,
    unit_number: plan.unit_number ?? undefined,
    week_number: plan.week_number ?? undefined,
    start_time: plan.start_time ?? undefined,
    end_time: plan.end_time ?? undefined,
  }
  showEditDialog.value = true
}

const getPriorityType = (priority: string): TagType => {
  const types: Record<string, TagType> = {
    urgent: 'danger',
    high: 'danger',
    medium: 'warning',
    low: 'info',
  }
  return types[priority] || 'info'
}

const getStatusType = (status: string): TagType => {
  const types: Record<string, TagType> = {
    not_started: 'info',
    in_progress: 'warning',
    completed: 'success',
  }
  return types[status] || 'info'
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    urgent: '紧急',
    high: '高',
    medium: '中',
    low: '低',
  }
  return labels[priority] || priority
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    not_started: '未开始',
    in_progress: '进行中',
    completed: '已完成',
  }
  return labels[status] || status
}

/** 手机端折叠面板：按单元分组 */
const mobileGroups = computed(() =>
  treeData.value.filter((row): row is StudyPlanUnitGroup => isUnitRow(row))
)

onMounted(async () => {
  await learningTypeStore.fetchLearningTypes()
  await fetchStudyPlans()
})
</script>

<template>
  <div class="study-plan-view page-panel">
    <div class="header page-panel__header">
      <div class="filters" :class="{ 'filters--mobile': isMobile }">
        <div class="filter-item filter-item--full">
          <label>学习类型</label>
          <el-select
            v-model="queryParams.learningTypeId"
            placeholder="全部"
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
          <label>状态</label>
          <el-select v-model="queryParams.status" @change="handleFilterChange">
            <el-option label="全部" value="all" />
            <el-option label="未开始" value="not_started" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </div>

        <div class="filter-item">
          <label>优先级</label>
          <el-select v-model="queryParams.priority" @change="handleFilterChange">
            <el-option label="全部" value="all" />
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </div>

        <div class="filter-item">
          <label>单元</label>
          <el-input-number
            v-model="queryParams.unitNumber"
            :min="0"
            placeholder="全部"
            controls-position="right"
            @change="handleFilterChange"
          />
        </div>

        <div class="filter-item">
          <label>周次</label>
          <el-input-number
            v-model="queryParams.weekNumber"
            :min="0"
            placeholder="全部"
            controls-position="right"
            @change="handleFilterChange"
          />
        </div>
      </div>

      <el-button type="primary" class="btn-block-mobile" @click="openCreateDialog()">
        新增学习计划
      </el-button>
    </div>

    <!-- 桌面端：按单元树形表格 -->
    <el-table
      v-if="!isMobile"
      v-loading="loading"
      :data="treeData"
      row-key="id"
      :tree-props="{ children: 'children' }"
      default-expand-all
      style="width: 100%"
      border
      stripe
    >
      <el-table-column label="计划" min-width="220" align="left">
        <template #default="{ row }">
          <div class="plan-title-cell">
            <template v-if="isUnitRow(row)">
              <span class="unit-group-title">{{ row.title }}</span>
              <el-button
                v-if="canAddUnder(row)"
                link
                type="primary"
                size="small"
                @click="openCreateDialog(row)"
              >
                添加计划
              </el-button>
            </template>
            <template v-else>
              <el-checkbox
                :model-value="row.status === 'completed'"
                @change="(val) => handleStatusToggle(row, val)"
              />
              <span>{{ row.title }}</span>
              <el-tag v-if="row.week_number != null" size="small" type="info">
                第 {{ row.week_number }} 周
              </el-tag>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="学习类型" align="center" width="120">
        <template #default="{ row }">
          {{ isUnitRow(row) ? '' : getLearningTypeName(row) }}
        </template>
      </el-table-column>
      <el-table-column label="描述" show-overflow-tooltip align="center">
        <template #default="{ row }">
          {{ isUnitRow(row) ? '' : row.description }}
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" width="170">
        <template #default="{ row }">
          <template v-if="!isUnitRow(row)">
            {{ row.start_time ? new Date(row.start_time).toLocaleString() : '未设置' }}
          </template>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" width="170">
        <template #default="{ row }">
          <template v-if="!isUnitRow(row)">
            {{ row.end_time ? new Date(row.end_time).toLocaleString() : '未设置' }}
          </template>
        </template>
      </el-table-column>
      <el-table-column label="优先级" align="center" width="90">
        <template #default="{ row }">
          <el-tag v-if="!isUnitRow(row)" :type="getPriorityType(row.priority)">
            {{ getPriorityLabel(row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="90">
        <template #default="{ row }">
          <el-tag v-if="!isUnitRow(row)" :type="getStatusType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <template v-if="!isUnitRow(row)">
            <!-- <el-button
              v-if="canAddUnder(row)"
              link
              type="primary"
              @click="openCreateDialog(row)"
            >
              添加
            </el-button> -->
            <el-button link type="primary" @click="editPlan(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 手机端：按单元折叠 -->
    <div v-else v-loading="loading" class="mobile-unit-list">
      <el-empty v-if="studyPlans.length === 0" description="暂无学习计划" />
      <el-collapse v-else>
        <el-collapse-item
          v-for="group in mobileGroups"
          :key="group.id"
          :name="group.id"
        >
          <template #title>
            <div class="collapse-unit-header">
              <span>{{ group.title }}</span>
              <el-button
                v-if="canAddUnder(group)"
                link
                type="primary"
                size="small"
                @click.stop="openCreateDialog(group)"
              >
                添加计划
              </el-button>
            </div>
          </template>
          <div v-for="row in group.children" :key="row.id" class="mobile-card">
            <div class="mobile-card__header">
              <el-checkbox
                :model-value="row.status === 'completed'"
                @change="(val) => handleStatusToggle(row, val)"
              />
              <span class="mobile-card__title">{{ row.title }}</span>
              <div class="mobile-card__tags">
                <el-tag v-if="row.week_number != null" size="small" type="info">
                  第 {{ row.week_number }} 周
                </el-tag>
                <el-tag size="small" :type="getPriorityType(row.priority)">
                  {{ getPriorityLabel(row.priority) }}
                </el-tag>
                <el-tag size="small" :type="getStatusType(row.status)">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </div>
            </div>

            <div class="mobile-card__body">
              <div class="mobile-card__row">
                <span class="mobile-card__label">类型</span>
                <span class="mobile-card__value">{{ getLearningTypeName(row) }}</span>
              </div>
              <div v-if="row.description" class="mobile-card__row">
                <span class="mobile-card__label">描述</span>
                <span class="mobile-card__value">{{ row.description }}</span>
              </div>
              <div class="mobile-card__row">
                <span class="mobile-card__label">开始</span>
                <span class="mobile-card__value">
                  {{ row.start_time ? new Date(row.start_time).toLocaleString() : '未设置' }}
                </span>
              </div>
              <div class="mobile-card__row">
                <span class="mobile-card__label">结束</span>
                <span class="mobile-card__value">
                  {{ row.end_time ? new Date(row.end_time).toLocaleString() : '未设置' }}
                </span>
              </div>
            </div>

            <div class="mobile-card__actions">
              <!-- <el-button
                v-if="canAddUnder(row)"
                size="small"
                @click="openCreateDialog(row)"
              >
                添加
              </el-button> -->
              <el-button size="small" type="primary" @click="editPlan(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 新增 Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      :title="createDialogTitle"
      :width="dialogWidth"
      :fullscreen="dialogFullscreen"
      :class="dialogClass"
      destroy-on-close
    >
      <el-form
        :model="newPlan"
        :class="formClass"
        :label-width="formLabelWidth"
        :label-position="formLabelPosition"
        :rules="formRules"
      >
        <el-form-item label="标题" prop="title" required class="form-item--full">
          <el-input v-model="newPlan.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="学习类型" prop="learning_type_id" required class="form-item--full">
          <el-select v-model="newPlan.learning_type_id" placeholder="请选择学习类型" style="width: 100%">
            <el-option v-for="type in learningTypes" :key="type.id" :label="type.name" :value="type.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="单元">
          <el-input-number
            v-model="newPlan.unit_number"
            :min="0"
            placeholder="第几单元"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="周次">
          <el-input-number
            v-model="newPlan.week_number"
            :min="0"
            placeholder="第几周"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述" class="form-item--full">
          <el-input v-model="newPlan.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="newPlan.start_time"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="newPlan.end_time"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="newPlan.priority" style="width: 100%">
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="newPlan.status" style="width: 100%">
            <el-option label="未开始" value="not_started" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑 Dialog -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑学习计划"
      :width="dialogWidth"
      :fullscreen="dialogFullscreen"
      :class="dialogClass"
      destroy-on-close
    >
      <el-form
        v-if="selectedPlan"
        :model="selectedPlan"
        :class="formClass"
        :label-width="formLabelWidth"
        :label-position="formLabelPosition"
        :rules="formRules"
      >
        <el-form-item label="标题" prop="title" required class="form-item--full">
          <el-input v-model="selectedPlan.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="学习类型" prop="learning_type_id" required class="form-item--full">
          <el-select v-model="selectedPlan.learning_type_id" placeholder="请选择学习类型" style="width: 100%">
            <el-option v-for="type in learningTypes" :key="type.id" :label="type.name" :value="type.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="单元">
          <el-input-number
            v-model="selectedPlan.unit_number"
            :min="0"
            placeholder="第几单元"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="周次">
          <el-input-number
            v-model="selectedPlan.week_number"
            :min="0"
            placeholder="第几周"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述" class="form-item--full">
          <el-input v-model="selectedPlan.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="selectedPlan.start_time"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="selectedPlan.end_time"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="selectedPlan.priority" style="width: 100%">
            <el-option label="紧急" value="urgent" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="selectedPlan.status" style="width: 100%">
            <el-option label="未开始" value="not_started" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="handleEdit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.study-plan-view {
  .header {
    margin-bottom: 20px;

    .filters {
      display: flex;
      gap: 24px;
      align-items: center;
      flex-wrap: wrap;

      .filter-item {
        display: flex;
        align-items: center;
        gap: 8px;

        label {
          font-size: 14px;
          color: var(--app-text-secondary);
          white-space: nowrap;
        }

        .el-select {
          width: 140px;
        }

        .el-input-number {
          width: 120px;
        }
      }

      @include mobile {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px 10px;
        width: 100%;
        align-items: stretch;

        .filter-item {
          flex-direction: column;
          align-items: stretch;
          min-width: 0;

          label {
            font-size: 13px;
            white-space: normal;
          }

          .el-select,
          .el-input-number {
            width: 100%;
          }
        }

        .filter-item--full {
          grid-column: 1 / -1;
        }
      }
    }
  }

  .plan-title-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .unit-group-title {
      font-weight: 600;
      color: var(--app-text-primary);
    }
  }

  .collapse-unit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-right: 8px;
    gap: 8px;
  }

  .mobile-unit-list {
    .mobile-card {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .mobile-card__header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .mobile-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex-shrink: 0;
    margin-left: auto;
  }
}
</style>
