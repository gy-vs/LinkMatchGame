import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAdminStore } from '@/store/admin'
import router from '@/router'

const service = axios.create({
  baseURL: '/api',
  timeout: 10000
})

service.interceptors.request.use(
  config => {
    const adminStore = useAdminStore()
    if (adminStore.token) {
      config.headers['Authorization'] = `Bearer ${adminStore.token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    const res = response.data
    
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      
      if (res.code === 401 || res.code === 1004 || res.code === 1005) {
        const adminStore = useAdminStore()
        adminStore.logout()
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res.data
  },
  error => {
    console.error('响应错误:', error)
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default service
