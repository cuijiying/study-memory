<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getWeatherForecast, type WeatherData } from '@/services/weatherService'

const weatherData = ref<WeatherData[]>([])
const loading = ref(true)
let eventHandler: NodeJS.Timeout;

const fetchWeather = async () => {
  try {
    loading.value = true
    weatherData.value = await getWeatherForecast()
  } catch (error) {
    console.error('Failed to fetch weather:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchWeather()
  // 每30分钟更新一次天气
  eventHandler = setInterval(fetchWeather, 30 * 60 * 1000)
})

onBeforeUnmount(() => {
  clearInterval(eventHandler)
})


</script>

<template>
  <div class="weather-widget">
    <el-space v-if="!loading" alignment="center" :size="20">
      <div v-for="weather in weatherData" :key="weather.date" class="weather-item">
        <el-tooltip
          :content="`${weather.description}${weather.humidity ? `
湿度: ${weather.humidity}%` : ''}${weather.windSpeed ? `
风速: ${weather.windSpeed}m/s` : ''}`"
          placement="bottom"
        >
          <div class="weather-content">
            <img :src="weather.icon" :alt="weather.description" class="weather-icon">
            <div class="weather-info">
              <span class="date">{{ weather.date }}</span>
              <span class="temp">{{ weather.temp }}°C</span>
            </div>
          </div>
        </el-tooltip>
      </div>
    </el-space>
    <el-skeleton v-else :rows="1" animated />
  </div>
</template>

<style scoped>
.weather-widget {
  min-width: 300px;
}

.weather-item {
  text-align: center;
}

.weather-content {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.weather-icon {
  width: 40px;
  height: 40px;
}

.weather-info {
  display: flex;
  flex-direction: column;
  margin-left: 4px;
  text-align: left;
}

.date {
  font-size: 12px;
  color: #909399;
}

.temp {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}
</style>