import axios from 'axios';

const API_KEY = '73d77beb1852ea0ed38707c2cab3175d';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

export interface WeatherData {
  date: string;
  temp: number;
  description: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

export const getWeatherForecast = async (city: string = 'Hefei'): Promise<WeatherData[]> => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric', // 直接使用摄氏度
        lang: 'zh_cn',
        cnt: 24 // 获取24个时间点的数据，确保覆盖3天
      }
    });

    const weatherData: WeatherData[] = [];
    const processedDates = new Set(); // 用于跟踪已处理的日期

    // 处理返回的数据
    response.data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      // 如果这个日期还没处理过，添加到结果中
      if (!processedDates.has(date) && weatherData.length < 3) {
        processedDates.add(date);
        weatherData.push({
          date,
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed
        });
      }
    });

    return weatherData;
  } catch (error) {
    console.error('获取天气数据失败:', error);
    return [];
  }
};