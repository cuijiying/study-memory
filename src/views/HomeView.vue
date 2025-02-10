<script setup lang="ts">
const statistics = ref([
  {
    title: '总学习时长',
    value: '128',
    unit: '小时',
    icon: 'Timer',
    color: '#409eff'
  },
  {
    title: '完成任务',
    value: '32',
    unit: '个',
    icon: 'Check',
    color: '#67c23a'
  },
  {
    title: '待办事项',
    value: '12',
    unit: '个',
    icon: 'List',
    color: '#e6a23c'
  },
  {
    title: '学习效率',
    value: '89',
    unit: '%',
    icon: 'TrendCharts',
    color: '#f56c6c'
  }
])

const recentActivities = ref([
  {
    title: '完成 Vue.js 课程学习',
    time: '2小时前',
    type: 'success'
  },
  {
    title: '记录 TypeScript 学习笔记',
    time: '4小时前',
    type: 'info'
  },
  {
    title: '完成每日编程练习',
    time: '昨天',
    type: 'warning'
  }
])
</script>

<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1>学习数据概览</h1>
      <p class="subtitle">今天是学习的好日子，继续保持！</p>
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
