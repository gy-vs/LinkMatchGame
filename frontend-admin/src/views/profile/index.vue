<template>
  <div class="profile-page">
    <div class="page-card profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <el-avatar :size="100" class="profile-avatar">
            {{ adminStore.adminInfo?.name?.charAt(0) || 'A' }}
          </el-avatar>
          <div class="profile-info">
            <h2 class="profile-name">{{ adminStore.adminInfo?.name || '管理员' }}</h2>
            <p class="profile-username">账号：{{ adminStore.adminInfo?.username || 'admin' }}</p>
            <el-tag type="success" effect="plain">
              <el-icon><Check /></el-icon>
              已认证管理员
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="page-card">
      <div class="page-header">
        <h3 class="page-title">账号信息</h3>
      </div>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">
          <el-icon style="margin-right: 4px;"><User /></el-icon>
          {{ adminStore.adminInfo?.username || 'admin' }}
        </el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag size="small" type="primary">超级管理员</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ adminStore.adminInfo?.name || '管理员' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag size="small" type="success">正常</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="登录时间">
          {{ loginTime }}
        </el-descriptions-item>
        <el-descriptions-item label="有效期">
          24 小时
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="page-card">
      <div class="page-header">
        <h3 class="page-title">安全设置</h3>
      </div>
      
      <div class="security-list">
        <div class="security-item">
          <div class="security-info">
            <el-icon class="security-icon"><Lock /></el-icon>
            <div class="security-text">
              <span class="security-title">登录密码</span>
              <span class="security-desc">当前密码强度：强</span>
            </div>
          </div>
          <el-button type="primary" plain size="small" @click="showPasswordDialog = true">
            修改密码
          </el-button>
        </div>
        
        <div class="security-item">
          <div class="security-info">
            <el-icon class="security-icon"><Monitor /></el-icon>
            <div class="security-text">
              <span class="security-title">登录设备</span>
              <span class="security-desc">当前设备：{{ deviceInfo }}</span>
            </div>
          </div>
          <el-tag type="success" size="small">当前设备</el-tag>
        </div>
      </div>
    </div>

    <div class="page-card">
      <div class="page-header">
        <h3 class="page-title">最近操作</h3>
      </div>
      
      <el-timeline>
        <el-timeline-item
          v-for="(log, index) in operationLogs"
          :key="index"
          :timestamp="log.time"
          placement="top"
          :type="log.type"
        >
          <div class="log-content">
            <span class="log-action">{{ log.action }}</span>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>

    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="420px"
      destroy-on-close
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAdminStore } from '@/store/admin'

const adminStore = useAdminStore()

const showPasswordDialog = ref(false)
const passwordFormRef = ref(null)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const formatDateTime = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

const loginTime = computed(() => {
  return formatDateTime(new Date())
})

const deviceInfo = computed(() => {
  const ua = navigator.userAgent
  if (ua.includes('Mac')) return '苹果电脑'
  if (ua.includes('Windows')) return '视窗系统'
  if (ua.includes('Linux')) return '服务器系统'
  return '未知设备'
})

const operationLogs = ref([
  { action: '登录系统', time: formatDateTime(new Date()), type: 'primary' },
  { action: '查看用户列表', time: formatDateTime(new Date(Date.now() - 300000)), type: '' },
  { action: '编辑关卡配置', time: formatDateTime(new Date(Date.now() - 600000)), type: 'success' },
  { action: '查看游戏记录', time: formatDateTime(new Date(Date.now() - 900000)), type: '' }
])

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('密码修改成功，请重新登录')
      showPasswordDialog.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.profile-page {
  .profile-card {
    .profile-header {
      .avatar-section {
        display: flex;
        align-items: center;
        gap: 24px;
        
        .profile-avatar {
          background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
          color: #fff;
          font-size: 36px;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
        }
        
        .profile-info {
          .profile-name {
            font-size: 24px;
            font-weight: 700;
            color: #333;
            margin: 0 0 4px 0;
          }
          
          .profile-username {
            font-size: 14px;
            color: #999;
            margin: 0 0 12px 0;
          }
          
          .el-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }
  
  .security-list {
    .security-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .security-info {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .security-icon {
          font-size: 24px;
          color: #666;
        }
        
        .security-text {
          display: flex;
          flex-direction: column;
          
          .security-title {
            font-size: 15px;
            font-weight: 500;
            color: #333;
          }
          
          .security-desc {
            font-size: 13px;
            color: #999;
            margin-top: 4px;
          }
        }
      }
    }
  }
  
  .log-content {
    .log-action {
      font-size: 14px;
      color: #333;
    }
  }
}
</style>
