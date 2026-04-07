<template>
  <div class="users-page">
    <div class="page-card">
      <div class="page-header">
        <h3 class="page-title">用户管理</h3>
        
        <div class="header-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户昵称/OpenID"
            style="width: 280px"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
          
          <el-button @click="handleRefresh" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
      
      <el-table
        v-loading="loading"
        :data="userList"
        stripe
        style="width: 100%"
        empty-text="暂无用户数据"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        
        <el-table-column prop="nickname" label="用户信息" min-width="180">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="40" class="user-avatar">
                {{ row.nickname?.charAt(0) || '?' }}
              </el-avatar>
              <div class="user-info">
                <span class="user-name">{{ row.nickname }}</span>
                <span class="user-openid">{{ maskOpenId(row.openId) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="score" label="总分数" width="120" align="center">
          <template #default="{ row }">
            <div class="score-cell">
              <el-icon class="score-icon"><Trophy /></el-icon>
              <span class="score-value">{{ row.score || 0 }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="level" label="等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="getLevelTagType(row.level)"
              effect="plain"
              class="level-tag"
            >
              {{ row.level || 1 }}级
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon><Calendar /></el-icon>
              <span>{{ formatDate(row.createdAt) }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="updatedAt" label="最后活跃" width="180">
          <template #default="{ row }">
            <div class="time-cell">
              <el-icon><Clock /></el-icon>
              <span>{{ formatDate(row.updatedAt) }}</span>
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
          @size-change="fetchUsers"
          @current-change="fetchUsers"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUsers } from '@/api/admin'

const loading = ref(false)
const userList = ref([])
const searchKeyword = ref('')

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const data = await getUsers({
      page: pagination.page,
      size: pagination.size,
      keyword: searchKeyword.value
    })
    userList.value = data.records || []
    pagination.total = data.total || 0
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchUsers()
}

const handleRefresh = () => {
  fetchUsers()
}

const maskOpenId = (openId) => {
  if (!openId) return '-'
  if (openId.length <= 8) return openId
  return openId.substring(0, 4) + '****' + openId.substring(openId.length - 4)
}

const getLevelTagType = (level) => {
  if (level >= 10) return 'danger'
  if (level >= 5) return 'warning'
  if (level >= 3) return 'success'
  return ''
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

const formatDate = (dateVal) => {
  const date = parseDate(dateVal)
  if (!date) return '-'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

onMounted(() => {
  fetchUsers()
})
</script>

<style lang="scss" scoped>
.users-page {
  .header-actions {
    display: flex;
    gap: 12px;
  }
  
  .user-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .user-avatar {
      background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    .user-info {
      display: flex;
      flex-direction: column;
      
      .user-name {
        font-weight: 600;
        color: #333;
        margin-bottom: 2px;
      }
      
      .user-openid {
        font-size: 12px;
        color: #999;
      }
    }
  }
  
  .score-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    
    .score-icon {
      color: #FFD700;
    }
    
    .score-value {
      font-weight: 600;
      color: #FF6B6B;
    }
  }
  
  .level-tag {
    font-weight: 600;
    min-width: 60px;
  }
  
  .time-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #999;
    font-size: 13px;
    
    .el-icon {
      color: #ccc;
    }
  }
}
</style>
