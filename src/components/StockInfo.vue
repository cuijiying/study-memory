<template>
  <div class="stock-info">
    <el-card class="stock-card">
      <template #header>
        <div class="card-header">
          <h3>股票信息</h3>
          <div class="search-area">
            <el-input
              v-model="searchQuery"
              placeholder="搜索股票代码/名称/拼音"
              clearable
              @input="handleSearch"
              style="width: 250px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table
        :data="paginatedStocks"
        style="width: 100%"
        height="500"
        v-loading="loading"
        border
      >
        <el-table-column prop="ts_code" label="股票代码" width="100" fixed />
        <el-table-column prop="name" label="股票名称" width="100" fixed />
        <el-table-column prop="fullname" label="股票全称"  />
        <el-table-column prop="cnspell" label="拼音简称"  />
        <el-table-column prop="area" label="地区"  />
        <el-table-column prop="industry" label="行业"  />
        <el-table-column prop="market" label="市场类型" />
        <el-table-column prop="exchange" label="交易所"  />
        <el-table-column prop="curr_type" label="交易货币"  />
        <el-table-column prop="list_date" label="上市日期"  />
        <el-table-column prop="is_hs" label="是否沪深港通" >
          <template #default="{ row }">
            {{ formatHsStatus(row.is_hs) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="showDailyData(row.ts_code)"
            >
              行情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredStocks.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 日线数据弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        title="股票日线数据"
        width="80%"
        destroy-on-close
      >
        <div ref="chartContainer" style="height: 500px"></div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { tushareApi } from '@/services/tushare';
import type { StockBasicInfo } from '@/services/tushare';
import * as echarts from 'echarts';

const stocks = ref<StockBasicInfo[]>([]);
const filteredStocks = ref<StockBasicInfo[]>([]);
const searchQuery = ref('');
const loading = ref(false);
const dialogVisible = ref(false);
const chartContainer = ref<HTMLElement | null>(null);
let chart: echarts.ECharts | null = null;

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);

const paginatedStocks = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredStocks.value.slice(startIndex, endIndex);
});

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const handleSearch = () => {
  if (!searchQuery.value) {
    filteredStocks.value = stocks.value;
    return;
  }

  const query = searchQuery.value.toLowerCase();
  filteredStocks.value = stocks.value.filter((stock) => 
    stock.ts_code.toLowerCase().includes(query) ||
    stock.name.toLowerCase().includes(query) ||
    stock.cnspell.toLowerCase().includes(query)
  );
  currentPage.value = 1;
};

const formatHsStatus = (status: string) => {
  switch (status) {
    case 'N': return '否';
    case 'H': return '沪股通';
    case 'S': return '深股通';
    default: return '未知';
  }
};

const showDailyData = async (tsCode: string) => {
  dialogVisible.value = true;
  loading.value = true;
  
  try {
    const dailyData = await tushareApi.getDailyData(tsCode);
    
    await nextTick();
    
    if (chartContainer.value) {
      if (!chart) {
        chart = echarts.init(chartContainer.value);
      }

      const dates = dailyData.map((item: any) => item.trade_date);
      const prices = dailyData.map((item: any) => [item.open, item.close, item.low, item.high]);

      const option = {
        title: {
          text: `${tsCode} K线图`,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        xAxis: {
          type: 'category',
          data: dates,
          scale: true
        },
        yAxis: {
          type: 'value',
          scale: true
        },
        dataZoom: [
          {
            type: 'inside',
            start: 50,
            end: 100
          },
          {
            show: true,
            type: 'slider',
            top: '90%'
          }
        ],
        series: [
          {
            name: '日K',
            type: 'candlestick',
            data: prices,
            itemStyle: {
              color: '#ef232a',
              color0: '#14b143',
              borderColor: '#ef232a',
              borderColor0: '#14b143'
            }
          }
        ]
      };

      chart.setOption(option);
    }
  } catch (error) {
    console.error('Failed to load daily data:', error);
    ElMessage.error('获取日线数据失败');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    stocks.value = await tushareApi.getStockBasicInfo();
    filteredStocks.value = stocks.value;
  } catch (error) {
    console.error('Failed to load stocks:', error);
    ElMessage.error('获取股票列表失败');
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
});
</script>

<style scoped>
.stock-info {
  padding: 20px;
}

.stock-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.search-area {
  display: flex;
  gap: 16px;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 