<template>
  <div class="dashboard">
    <div class="welcome-banner">
      <div class="welcome-content">
        <h2>👋 欢迎回来，{{ adminStore.adminInfo?.name || '管理员' }}</h2>
        <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
      </div>
      <div class="welcome-decoration"></div>
    </div>
    
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card" @click="$router.push('/users')">
          <div class="stat-value">
            <CountUp :end-val="stats.totalUsers || 0" :duration="1.5" />
          </div>
          <div class="stat-label">
            <el-icon><User /></el-icon>
            总用户数
          </div>
        </div>
      </el-col>
      
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card secondary">
          <div class="stat-value">
            <CountUp :end-val="stats.todayUsers || 0" :duration="1.5" />
          </div>
          <div class="stat-label">
            <el-icon><UserFilled /></el-icon>
            今日新增
          </div>
        </div>
      </el-col>
      
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card accent" @click="$router.push('/records')">
          <div class="stat-value">
            <CountUp :end-val="stats.totalRecords || 0" :duration="1.5" />
          </div>
          <div class="stat-label">
            <el-icon><Document /></el-icon>
            游戏总场次
          </div>
        </div>
      </el-col>
      
      <el-col :xs="12" :sm="12" :md="6">
        <div class="stat-card warning" @click="$router.push('/levels')">
          <div class="stat-value">
            <CountUp :end-val="stats.levelCount || 0" :duration="1.5" />
          </div>
          <div class="stat-label">
            <el-icon><Grid /></el-icon>
            关卡数量
          </div>
        </div>
      </el-col>
    </el-row>
    
    <div class="page-card">
      <div class="page-header">
        <h3 class="page-title">快捷操作</h3>
      </div>
      
      <el-row :gutter="20">
        <el-col :xs="24" :sm="8">
          <div class="quick-action" @click="$router.push('/users')">
            <div class="action-icon-wrap">
              <el-icon class="action-icon" :size="36"><User /></el-icon>
            </div>
            <div class="action-info">
              <span class="action-title">用户管理</span>
              <span class="action-desc">查看和管理所有用户</span>
            </div>
            <el-icon class="action-arrow"><ArrowRight /></el-icon>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="8">
          <div class="quick-action" @click="$router.push('/levels')">
            <div class="action-icon-wrap secondary">
              <el-icon class="action-icon" :size="36"><Grid /></el-icon>
            </div>
            <div class="action-info">
              <span class="action-title">关卡管理</span>
              <span class="action-desc">配置游戏关卡</span>
            </div>
            <el-icon class="action-arrow"><ArrowRight /></el-icon>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="8">
          <div class="quick-action" @click="$router.push('/records')">
            <div class="action-icon-wrap accent">
              <el-icon class="action-icon" :size="36"><Document /></el-icon>
            </div>
            <div class="action-info">
              <span class="action-title">游戏记录</span>
              <span class="action-desc">查看游戏数据</span>
            </div>
            <el-icon class="action-arrow"><ArrowRight /></el-icon>
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="page-card">
      <div class="page-header">
        <h3 class="page-title">系统信息</h3>
        <el-tag type="success" effect="plain">运行中</el-tag>
      </div>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="系统名称">
          <el-icon style="margin-right: 4px"><Monitor /></el-icon>
          连线消消乐 管理后台
        </el-descriptions-item>
        <el-descriptions-item label="版本">
          <el-tag size="small">v1.0.0</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="后端框架">
          <el-tag type="info" size="small">后端服务 3.2</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="前端框架">
          <el-tag type="info" size="small">前端框架 3</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="数据库">
          <el-tag type="info" size="small">数据库 8.0</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="运行环境">
          <el-tag type="info" size="small">容器化部署</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/store/admin'
import { getDashboard } from '@/api/admin'

const CountUp = {
  props: {
    endVal: { type: Number, default: 0 },
    duration: { type: Number, default: 1.5 }
  },
  setup(props) {
    const displayVal = ref(0)
    
    onMounted(() => {
      const startTime = performance.now()
      const startVal = 0
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / (props.duration * 1000), 1)
        
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
        displayVal.value = Math.floor(startVal + (props.endVal - startVal) * eased)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    })
    
    return () => displayVal.value
  }
}

const adminStore = useAdminStore()

const stats = ref({
  totalUsers: 0,
  todayUsers: 0,
  totalRecords: 0,
  todayRecords: 0,
  levelCount: 0
})

const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
})

const fetchStats = async () => {
  try {
    const data = await getDashboard()
    stats.value = data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style lang="scss" scoped>
.dashboard {
  .welcome-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
    color: #fff;
    
    .welcome-content {
      position: relative;
      z-index: 1;
      
      h2 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      p {
        font-size: 14px;
        opacity: 0.9;
      }
    }
    
    .welcome-decoration {
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
  }
  
  .stat-row {
    margin-bottom: 24px;
    
    .el-col {
      margin-bottom: 16px;
    }
  }
  
  .stat-card {
    cursor: pointer;
  }
  
  .quick-action {
    display: flex;
    align-items: center;
    padding: 20px;
    background: #f9fafb;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 16px;
    
    &:hover {
      background: #fff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
      
      .action-arrow {
        transform: translateX(4px);
        opacity: 1;
      }
    }
    
    .action-icon-wrap {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      
      &.secondary {
        background: linear-gradient(135deg, #4ECDC4 0%, #6ED5CE 100%);
      }
      
      &.accent {
        background: linear-gradient(135deg, #45B7D1 0%, #6BC5D8 100%);
      }
      
      .action-icon {
        color: #fff;
      }
    }
    
    .action-info {
      flex: 1;
      
      .action-title {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }
      
      .action-desc {
        font-size: 13px;
        color: #999;
      }
    }
    
    .action-arrow {
      color: #ccc;
      transition: all 0.3s ease;
      opacity: 0.5;
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    .welcome-banner {
      padding: 24px;
      
      h2 {
        font-size: 20px;
      }
    }
    
    .stat-card {
      .stat-value {
        font-size: 28px;
      }
    }
  }
}
</style>
