<template>
  <div class="login-page">
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-wrap">
            <span class="logo-icon">🎮</span>
          </div>
          <h1 class="login-title">连线消消乐</h1>
          <p class="login-subtitle">管理后台</p>
        </div>
        
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              <template v-if="!loading">
                <el-icon><Right /></el-icon>
                登录系统
              </template>
              <template v-else>
                登录中...
              </template>
            </el-button>
          </el-form-item>
        </el-form>
        
      </div>
      
      <div class="login-footer">
        <p>© 2024 连线消消乐 · 管理后台</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Right } from '@element-plus/icons-vue'
import { useAdminStore } from '@/store/admin'

const router = useRouter()
const adminStore = useAdminStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      await adminStore.login(form)
      ElMessage.success({
        message: '登录成功，欢迎回来！',
        duration: 2000,
        showClose: true
      })
      router.push('/dashboard')
    } catch (error) {
      ElMessage.error(error.message || '登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  
  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    animation: float 6s ease-in-out infinite;
  }
  
  .circle-1 {
    width: 400px;
    height: 400px;
    top: -100px;
    right: -100px;
    animation-delay: 0s;
  }
  
  .circle-2 {
    width: 300px;
    height: 300px;
    bottom: -50px;
    left: -50px;
    animation-delay: 2s;
  }
  
  .circle-3 {
    width: 200px;
    height: 200px;
    top: 50%;
    left: 10%;
    animation-delay: 4s;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.login-wrapper {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-card {
  width: 400px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  
  .login-header {
    text-align: center;
    margin-bottom: 40px;
    
    .logo-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 20px;
      background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
      margin-bottom: 20px;
      box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
      
      .logo-icon {
        font-size: 40px;
      }
    }
    
    .login-title {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin: 0 0 8px 0;
    }
    
    .login-subtitle {
      font-size: 14px;
      color: #999;
      margin: 0;
    }
  }
  
  .login-form {
    .el-form-item {
      margin-bottom: 24px;
    }
    
    :deep(.el-input__wrapper) {
      border-radius: 12px;
      padding: 4px 16px;
      box-shadow: 0 0 0 1px #e4e7ed inset;
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 0 0 1px #c0c4cc inset;
      }
      
      &.is-focus {
        box-shadow: 0 0 0 2px #FF6B6B inset;
      }
    }
    
    .login-btn {
      width: 100%;
      height: 48px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
      border: none;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4);
      }
      
      &:active {
        transform: translateY(0);
      }
      
      .el-icon {
        margin-right: 8px;
      }
    }
  }
  
}

.login-footer {
  margin-top: 24px;
  
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .login-card {
    width: calc(100vw - 48px);
    padding: 32px 24px;
    border-radius: 16px;
    
    .login-header {
      margin-bottom: 32px;
      
      .logo-wrap {
        width: 64px;
        height: 64px;
        
        .logo-icon {
          font-size: 32px;
        }
      }
      
      .login-title {
        font-size: 24px;
      }
    }
  }
}
</style>
