<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="sidebar">
        <div class="sidebar-logo" @click="$router.push('/dashboard')">
          <span class="logo-icon">🎮</span>
          <transition name="fade">
            <span v-if="!isCollapse" class="logo-text">连线消消乐</span>
          </transition>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          router
          class="sidebar-menu"
          background-color="transparent"
          text-color="#B8C0D0"
          active-text-color="#FFFFFF"
        >
          <el-menu-item index="/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>
          
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          
          <el-menu-item index="/levels">
            <el-icon><Grid /></el-icon>
            <template #title>关卡管理</template>
          </el-menu-item>
          
          <el-menu-item index="/records">
            <el-icon><Document /></el-icon>
            <template #title>游戏记录</template>
          </el-menu-item>
        </el-menu>
        
        <div class="sidebar-collapse" @click="isCollapse = !isCollapse">
          <el-icon :size="18">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>
      </div>
    </el-aside>
    
    <el-container class="main-container">
      <el-header class="layout-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRouteName">
              {{ currentRouteName }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <div class="header-action" @click="toggleFullscreen" title="全屏">
            <el-icon><FullScreen /></el-icon>
          </div>
          
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="36" class="user-avatar">
                {{ adminStore.adminInfo?.name?.charAt(0) || 'A' }}
              </el-avatar>
              <span class="user-name">{{ adminStore.adminInfo?.name || '管理员' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile')">
                  <el-icon><User /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAdminStore } from '@/store/admin'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const routeNameMap = {
  '/dashboard': '首页',
  '/users': '用户管理',
  '/levels': '关卡管理',
  '/records': '游戏记录',
  '/profile': '个人信息'
}

const currentRouteName = computed(() => routeNameMap[route.path])

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '退出确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    adminStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  })
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  
  .layout-aside {
    transition: width 0.3s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, #1E2238 0%, #252A40 100%);
    
    .sidebar-logo {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      
      .logo-icon {
        font-size: 28px;
      }
      
      .logo-text {
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        margin-left: 12px;
        white-space: nowrap;
      }
    }
    
    .sidebar-menu {
      flex: 1;
      border-right: none;
      padding: 8px;
      
      .el-menu-item {
        border-radius: 8px;
        margin-bottom: 4px;
        height: 48px;
        transition: all 0.2s;
        
        &:hover {
          background: rgba(255, 255, 255, 0.08) !important;
        }
        
        &.is-active {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%) !important;
          font-weight: 600;
        }
        
        .el-icon {
          font-size: 18px;
        }
      }
    }
    
    .sidebar-collapse {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #B8C0D0;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.08);
      }
    }
  }
  
  .main-container {
    background: #F5F7FA;
    
    .layout-header {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
      
      .header-left {
        display: flex;
        align-items: center;
      }
      
      .header-right {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .header-action {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          cursor: pointer;
          color: #666;
          transition: all 0.2s;
          
          &:hover {
            background: #f5f7fa;
            color: #FF6B6B;
          }
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 12px 4px 4px;
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.2s;
          
          &:hover {
            background: #f5f7fa;
          }
          
          .user-avatar {
            background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
            color: #fff;
            font-weight: 600;
          }
          
          .user-name {
            font-weight: 500;
            color: #333;
          }
        }
      }
    }
    
    .layout-main {
      padding: 24px;
      overflow-y: auto;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
