<script setup lang="ts">
import { supabase } from '@/lib/supabase'
import type { StudyRecord } from '@/types'
import { ref, onMounted } from 'vue'

const statistics = ref([
  {
    title: '今日需完成任务',
    value: '0',
    unit: '个',
    icon: 'Timer', 
    color: '#409eff'
  },
  {
    title: '已经完成任务',
    value: '0',
    unit: '个',
    icon: 'Check',
    color: '#67c23a'
  },
  {
    title: '未完成任务', 
    value: '0',
    unit: '个',
    icon: 'List',
    color: '#e6a23c'
  },
  {
    title: '完成率',
    value: '0',
    unit: '%',
    icon: 'TrendCharts',
    color: '#f56c6c'
  }
])

const recentActivities = ref<{
  title: string,
  time: string,
  type: 'success' | 'info' | 'warning' | 'primary' | 'danger'
}[]>([])

// 获取今天的开始和结束时间
const getTodayRange = () => {
  const today = new Date()
  const start = new Date(today.setHours(0, 0, 0, 0))
  const end = new Date(today.setHours(23, 59, 59, 999))
  return { start, end }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const { start, end } = getTodayRange()
    
    // 获取今日需要复习的记录
    const { data: todayRecords, error: error1 } = await supabase
      .from('study_records')
      .select('*')
      .or(`review1_time.gte.${start.toLocaleString()},review1_time.lte.${end.toLocaleString()},` +
          `review2_time.gte.${start.toLocaleString()},review2_time.lte.${end.toLocaleString()},` +
          `review3_time.gte.${start.toLocaleString()},review3_time.lte.${end.toLocaleString()},` +
          `review4_time.gte.${start.toLocaleString()},review4_time.lte.${end.toLocaleString()},` +
          `review5_time.gte.${start.toLocaleString()},review5_time.lte.${end.toLocaleString()}`)

    if (error1) throw error1

    const totalTasks = todayRecords?.length || 0
    let completedTasks = 0

    todayRecords?.forEach(record => {
      const status = record.review_status.split('')
      const reviewTimes = [
        record.review1_time,
        record.review2_time,
        record.review3_time,
        record.review4_time,
        record.review5_time
      ]

      const resFlag =  reviewTimes.some((time, index) => {
        const reviewTime = new Date(time)
        return reviewTime >= start && reviewTime <= end && status[index] === '1'
      })
      if (resFlag) {
        completedTasks++
      }
    })

    const incompleteTasks = totalTasks - completedTasks
    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

    statistics.value[0].value = totalTasks.toString()
    statistics.value[1].value = completedTasks.toString()
    statistics.value[2].value = incompleteTasks.toString()
    statistics.value[3].value = completionRate.toString()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取最近活动
const fetchRecentActivities = async () => {
  try {
    const { start, end } = getTodayRange()

    // 获取今日新增的笔记
    const { data: newRecords, error: error1 } = await supabase
      .from('study_records')
      .select('*')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())

    if (error1) throw error1

    // 获取今日更新状态的笔记
    const { data: updatedRecords, error: error2 } = await supabase
      .from('study_records')
      .select('*')
      .gte('updated_at', start.toISOString())
      .lte('updated_at', end.toISOString())

    if (error2) throw error2

    const activities: {
      title: string,
      time: string,
      type: 'success' | 'info' | 'warning' | 'primary' | 'danger',
      timestamp: Date
    }[] = []

    newRecords?.forEach(record => {
      const createdTime = new Date(record.created_at)
      createdTime.setHours(createdTime.getHours() + 8)
      activities.push({
        title: `新增学习: ${record.title}`,
        time: createdTime.toLocaleString(),
        type: 'success',
        timestamp: new Date(record.created_at)
      })
    })

    updatedRecords?.forEach(record => {
      if(record.updated_at !== record.created_at) {
        const updatedTime = new Date(record.updated_at)
        updatedTime.setHours(updatedTime.getHours() + 8)
        activities.push({
          title: `更新笔记状态: ${record.title}`,
          time: updatedTime.toLocaleString(),
          type: 'info',
          timestamp: new Date(record.updated_at)
        })
      }
    })

    // 按时间戳排序
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    recentActivities.value = activities.map(({ title, time, type }) => ({
      title,
      time,
      type
    }))
  } catch (error) {
    console.error('获取最近活动失败:', error)
  }
}

onMounted(() => {
  fetchStatistics()
  fetchRecentActivities()
})
</script>

<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1>学习数据概览</h1>
      <p class="subtitle">温故而知新；学而时习之； 稳故-> 学新 -> 创新； 知行合一。</p>
    </div>

    <div class="statistics-grid">
      <el-card
        v-for="(stat, index) in statistics"
        :key="index"
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
              {{ stat.value }}
              <span class="stat-unit">{{ stat.unit }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="activities-section">
      <h2>最近活动</h2>
      <el-timeline>
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
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

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
