<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { tushareApi } from '@/services/tushare';
import * as echarts from 'echarts';

interface StockBasicInfo {
  ts_code: string;
  name: string;
  fullname: string;
  cnspell: string;
  area: string;
  industry: string;
  market: string;
  exchange: string;
  curr_type: string;
  list_date: string;
  is_hs: string;
}

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
const total = ref(0);

let tableHeight = ref('600px');

const paginatedStocks = computed(() => filteredStocks.value);

const handleSizeChange = async (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  await fetchStocks();
};

const handleCurrentChange = async (val: number) => {
  currentPage.value = val;
  await fetchStocks();
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

const fetchStocks = async () => {
  loading.value = true;
  try {
    const { data, total: totalCount } = await tushareApi.getStockBasicInfo(currentPage.value, pageSize.value);
    stocks.value = data;
    filteredStocks.value = data;
    total.value = totalCount;
  } catch (error) {
    console.error('Failed to fetch stocks:', error);
    ElMessage.error('获取股票列表失败');
  } finally {
    loading.value = false;
  }
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
  await fetchStocks();
  calcTableHeight();
});

// 计算表格高度
const calcTableHeight = () => {
  // 获取视窗高度
  const windowHeight = window.innerHeight
  // 减去其他元素的高度(header + pagination + padding等)
  tableHeight.value = `${windowHeight - 280}px`
}

// 监听窗口大小变化
window.addEventListener('resize', calcTableHeight)

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose();
    chart = null;
  }
  window.removeEventListener('resize', calcTableHeight)
});
</script>

<template>
  <div class="stock-info">
    <el-card class="stock-card">
      <template #header>
        <div class="card-header">
          <h3>market</h3>
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
        :height="tableHeight"
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
          :total="total"
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


<style lang="scss" scoped>
.stock-info {
  /* padding: 20px; */
}

.stock-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // background-color: $danger-color;
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