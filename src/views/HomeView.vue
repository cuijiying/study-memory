<script setup lang="ts">
import { Timer, Check, List, DataAnalysis } from '@element-plus/icons-vue'
import { useAuthUser } from '@/composables/useAuthUser'
import { studyRecordService } from '@/services/studyRecordService'

const { requireUserId } = useAuthUser()
const loading = ref(false)

const statConfig = [
  { title: '今日需完成任务', key: 'totalTasks' as const, unit: '个', icon: Timer, color: '#409eff' },
  { title: '已经完成任务', key: 'completedTasks' as const, unit: '个', icon: Check, color: '#67c23a' },
  { title: '未完成任务', key: 'incompleteTasks' as const, unit: '个', icon: List, color: '#e6a23c' },
  { title: '完成率', key: 'completionRate' as const, unit: '%', icon: DataAnalysis, color: '#f56c6c' },
]

const statistics = ref({
  totalTasks: 0,
  completedTasks: 0,
  incompleteTasks: 0,
  completionRate: 0,
})

const recentActivities = ref<
  { title: string; time: string; type: 'success' | 'info' | 'warning' | 'primary' | 'danger' }[]
>([])

const loadDashboard = async () => {
  loading.value = true
  try {
    const userId = requireUserId()
    const [stats, activities] = await Promise.all([
      studyRecordService.getTodayStatistics(userId),
      studyRecordService.getRecentActivities(userId),
    ])
    statistics.value = stats
    recentActivities.value = activities
  } catch (error) {
    if ((error as Error).message !== 'NOT_AUTHENTICATED') {
      console.error('加载首页数据失败:', error)
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div v-loading="loading" class="home-container">
    <div class="welcome-section">
      <h1>学习数据概览</h1>
      <p class="subtitle">温故而知新；学而时习之；稳故 → 学新 → 创新；知行合一。</p>
    </div>

    <div class="statistics-grid">
      <el-card
        v-for="stat in statConfig"
        :key="stat.key"
        class="stat-card"
        :body-style="{ padding: '20px' }"
      >
        <div class="stat-content">
          <div class="stat-icon" :style="{ backgroundColor: stat.color + '15' }">
            <el-icon :style="{ color: stat.color }">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ stat.title }}</div>
            <div class="stat-value">
              {{ statistics[stat.key] }}
              <span class="stat-unit">{{ stat.unit }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="activities-section">
      <h2>最近活动</h2>
      <el-empty v-if="recentActivities.length === 0" description="今日暂无活动" />
      <el-timeline v-else>
        <el-timeline-item
          v-for="(activity, index) in recentActivities"
          :key="index"
          :type="activity.type"
          :timestamp="activity.time"
        >
          {{ activity.title }}
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-container {
  padding: 24px;

  .welcome-section {
    margin-bottom: 32px;

    h1 {
      font-size: 28px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #606266;
      font-size: 16px;
    }
  }

  .statistics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    margin-bottom: 32px;

    .stat-card {
      border-radius: 8px;

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;

          .el-icon {
            font-size: 24px;
          }
        }

        .stat-info {
          .stat-title {
            font-size: 14px;
            color: #606266;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 600;
            color: #303133;

            .stat-unit {
              font-size: 14px;
              color: #909399;
              margin-left: 4px;
            }
          }
        }
      }
    }
  }

  .activities-section {
    background: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    h2 {
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 24px;
    }
  }
}
</style>
