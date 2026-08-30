<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { issueService, type Issue } from '@/services/issueService'
import { ElMessage } from 'element-plus'
import { useMobileForm } from '@/composables/useMobileForm'

const route = useRoute()
const router = useRouter()
const { formLabelWidth, formLabelPosition, formClass } = useMobileForm('100px')
const loading = ref(false)
const issue = ref<Issue | null>(null)
const isEditing = ref(false)

const issueTypes = [
  '代码问题',
  '环境配置',
  '业务逻辑',
  '性能优化',
  '安全问题',
  '其他',
]

const fetchIssue = async () => {
  loading.value = true
  try {
    const issueId = parseInt(route.params.id as string)
    issue.value = await issueService.getIssueById(issueId)
  } catch (error) {
    ElMessage.error('获取问题详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleUpdate = async () => {
  if (!issue.value) return

  try {
    await issueService.updateIssue(issue.value.issue_id, {
      title: issue.value.title,
      issue_type: issue.value.issue_type,
      description: issue.value.description,
      status: issue.value.status,
      priority: issue.value.priority,
      solution: issue.value.solution,
      cause: issue.value.cause,
      preventive_measures: issue.value.preventive_measures,
    })
    ElMessage.success('更新成功')
    isEditing.value = false
  } catch (error) {
    ElMessage.error('更新失败')
    console.error(error)
  }
}

const handleDelete = async () => {
  if (!issue.value) return

  try {
    await issueService.deleteIssue(issue.value.issue_id)
    ElMessage.success('删除成功')
    router.push('/issues')
  } catch (error) {
    ElMessage.error('删除失败')
    console.error(error)
  }
}

onMounted(fetchIssue)
</script>

<template>
  <div v-loading="loading" class="issue-detail-container page-panel">
    <!-- 顶栏操作区：手机端纵向堆叠 -->
    <div class="header">
      <el-button @click="router.push('/issues')">返回列表</el-button>
      <div class="actions">
        <el-button type="primary" @click="isEditing = !isEditing">
          {{ isEditing ? '取消编辑' : '编辑' }}
        </el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
      </div>
    </div>

    <template v-if="issue">
      <el-form
        :model="issue"
        :class="formClass"
        :label-width="formLabelWidth"
        :label-position="formLabelPosition"
      >
        <el-form-item label="标题">
          <el-input v-if="isEditing" v-model="issue.title" />
          <span v-else class="field-value">{{ issue.title }}</span>
        </el-form-item>

        <el-form-item label="问题类型">
          <el-select v-if="isEditing" v-model="issue.issue_type" style="width: 100%">
            <el-option
              v-for="type in issueTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
          <span v-else class="field-value">{{ issue.issue_type }}</span>
        </el-form-item>

        <el-form-item label="优先级">
          <el-select v-if="isEditing" v-model="issue.priority" style="width: 100%">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
          <el-tag v-else :type="issue.priority === '高' ? 'danger' : issue.priority === '中' ? 'warning' : 'info'">
            {{ issue.priority }}
          </el-tag>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-if="isEditing" v-model="issue.status" style="width: 100%">
            <el-option label="待处理" value="待处理" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已解决" value="已解决" />
          </el-select>
          <el-tag v-else :type="issue.status === '已解决' ? 'success' : issue.status === '处理中' ? 'warning' : 'info'">
            {{ issue.status }}
          </el-tag>
        </el-form-item>

        <el-form-item label="问题描述">
          <el-input
            v-if="isEditing"
            v-model="issue.description"
            type="textarea"
            :rows="4"
          />
          <div v-else class="pre-wrap field-value">{{ issue.description }}</div>
        </el-form-item>

        <el-form-item label="出现原因">
          <el-input
            v-if="isEditing"
            v-model="issue.cause"
            type="textarea"
            :rows="4"
          />
          <div v-else class="pre-wrap field-value">{{ issue.cause || '-' }}</div>
        </el-form-item>

        <el-form-item label="解决方案">
          <el-input
            v-if="isEditing"
            v-model="issue.solution"
            type="textarea"
            :rows="4"
          />
          <div v-else class="pre-wrap field-value">{{ issue.solution || '-' }}</div>
        </el-form-item>

        <el-form-item label="预防措施">
          <el-input
            v-if="isEditing"
            v-model="issue.preventive_measures"
            type="textarea"
            :rows="4"
          />
          <div v-else class="pre-wrap field-value">{{ issue.preventive_measures || '-' }}</div>
        </el-form-item>

        <el-form-item v-if="isEditing">
          <el-button type="primary" class="btn-block-mobile" @click="handleUpdate">保存</el-button>
        </el-form-item>
      </el-form>

      <div class="timestamps">
        <p>创建时间：{{ new Date(issue.created_at).toLocaleString() }}</p>
        <p>更新时间：{{ new Date(issue.updated_at).toLocaleString() }}</p>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.issue-detail-container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;

  /* 手机端：返回按钮与操作按钮分行显示 */
  @include mobile {
    flex-direction: column;
    align-items: stretch;
  }
}

.actions {
  display: flex;
  gap: 10px;

  @include mobile {
    width: 100%;

    .el-button {
      flex: 1;
    }
  }
}

.field-value {
  color: var(--app-text-primary);
  line-height: 1.6;
}

.pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}

.timestamps {
  margin-top: 20px;
  color: var(--app-text-muted);
  font-size: 0.9em;

  p {
    margin: 4px 0;
  }
}
</style>
