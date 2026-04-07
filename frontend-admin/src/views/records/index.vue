<template>
  <div class="records-page">
    <div class="page-card">
      <div class="page-header">
        <h3 class="page-title">游戏记录</h3>
        
        <el-button @click="handleRefresh" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      
      <!-- 统计卡片 -->
      <el-row :gutter="16" class="stats-row">
        <el-col :span="8">
          <div class="mini-stat">
            <div class="mini-stat-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="mini-stat-info">
              <span class="mini-stat-value">{{ pagination.total }}</span>
              <span class="mini-stat-label">总记录数</span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="mini-stat success">
            <div class="mini-stat-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="mini-stat-info">
              <span class="mini-stat-value">{{ avgScore }}</span>
              <span class="mini-stat-label">平均得分</span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="mini-stat warning">
            <div class="mini-stat-icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="mini-stat-info">
              <span class="mini-stat-value">{{ avgTime }}s</span>
              <span class="mini-stat-label">平均用时</span>
            </div>
          </div>
        </el-col>
      </el-row>
      
      <el-table
        v-loading="loading"
        :data="recordList"
        stripe
        style="width: 100%"
        empty-text="暂无游戏记录"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        
        <el-table-column prop="userId" label="用户ID" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.userId }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="levelId" label="关卡" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ getLevelName(row.levelId) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="score" label="得分" width="140" align="center">
          <template #default="{ row }">
            <div class="score-display">
              <span class="score-number" :class="getScoreClass(row.score)">
                {{ row.score }}
              </span>
              <el-icon v-if="row.score >= 500" class="score-badge"><Star /></el-icon>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="timeUsed" label="用时" width="140" align="center">
          <template #default="{ row }">
            <div class="time-display">
              <el-icon><Timer /></el-icon>
              <span>{{ formatTime(row.timeUsed) }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="游戏时间" min-width="180">
          <template #default="{ row }">
            <div class="datetime-cell">
              <span class="date">{{ formatDateOnly(row.createdAt) }}</span>
              <span class="time">{{ formatTimeOnly(row.createdAt) }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchRecords"
          @current-change="fetchRecords"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getRecords, getLevels } from '@/api/admin'

const loading = ref(false)
const recordList = ref([])
const levelMap = ref({})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const avgScore = computed(() => {
  if (recordList.value.length === 0) return 0
  const sum = recordList.value.reduce((acc, r) => acc + (r.score || 0), 0)
  return Math.round(sum / recordList.value.length)
})

const avgTime = computed(() => {
  if (recordList.value.length === 0) return 0
  const sum = recordList.value.reduce((acc, r) => acc + (r.timeUsed || 0), 0)
  return Math.round(sum / recordList.value.length)
})

const fetchLevels = async () => {
  try {
    const data = await getLevels({ page: 1, size: 100 })
    const levels = data.records || []
    levelMap.value = {}
    levels.forEach(lv => {
      levelMap.value[lv.id] = lv.name
    })
  } catch (error) {
    console.error('获取关卡列表失败:', error)
  }
}

const getLevelName = (levelId) => {
  return levelMap.value[levelId] || `关卡 ${levelId}`
}

const fetchRecords = async () => {
  loading.value = true
  try {
    const data = await getRecords({
      page: pagination.page,
      size: pagination.size
    })
    recordList.value = data.records || []
    pagination.total = data.total || 0
  } catch (error) {
    console.error('获取游戏记录失败:', error)
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  fetchRecords()
}

const getScoreClass = (score) => {
  if (score >= 800) return 'score-excellent'
  if (score >= 500) return 'score-good'
  if (score >= 300) return 'score-normal'
  return 'score-low'
}

const formatTime = (seconds) => {
  if (!seconds) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`
}

const parseDate = (dateVal) => {
  if (!dateVal) return null
  if (Array.isArray(dateVal)) {
    const [y, m, d, h = 0, min = 0, s = 0] = dateVal
    return new Date(y, m - 1, d, h, min, s)
  }
  if (typeof dateVal === 'string') {
    return new Date(dateVal.replace(' ', 'T'))
  }
  const date = new Date(dateVal)
  return isNaN(date.getTime()) ? null : date
}

const formatDateOnly = (dateVal) => {
  const date = parseDate(dateVal)
  if (!date) return '-'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatTimeOnly = (dateVal) => {
  const date = parseDate(dateVal)
  if (!date) return ''
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  await fetchLevels()
  fetchRecords()
})
</script>

<style lang="scss" scoped>
.records-page {
  .stats-row {
    margin-bottom: 24px;
  }
  
  .mini-stat {
    display: flex;
    align-items: center;
    background: #f9fafb;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.3s ease;
    
    &:hover {
      background: #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .mini-stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      
      .el-icon {
        font-size: 24px;
        color: #fff;
      }
    }
    
    &.success .mini-stat-icon {
      background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
    }
    
    &.warning .mini-stat-icon {
      background: linear-gradient(135deg, #E6A23C 0%, #F0C060 100%);
    }
    
    .mini-stat-info {
      display: flex;
      flex-direction: column;
      
      .mini-stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #333;
        line-height: 1.2;
      }
      
      .mini-stat-label {
        font-size: 13px;
        color: #999;
      }
    }
  }
  
  .score-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    
    .score-number {
      font-size: 18px;
      font-weight: 700;
      
      &.score-excellent { color: #FF6B6B; }
      &.score-good { color: #E6A23C; }
      &.score-normal { color: #67C23A; }
      &.score-low { color: #909399; }
    }
    
    .score-badge {
      color: #FFD700;
      font-size: 16px;
    }
  }
  
  .time-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #666;
    
    .el-icon {
      color: #999;
    }
  }
  
  .datetime-cell {
    display: flex;
    flex-direction: column;
    
    .date {
      font-weight: 500;
      color: #333;
    }
    
    .time {
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
