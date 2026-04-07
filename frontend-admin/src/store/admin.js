import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi } from '@/api/admin'

export const useAdminStore = defineStore('admin', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const adminInfo = ref(JSON.parse(localStorage.getItem('admin_info') || 'null'))

  const isLoggedIn = () => !!token.value

  async function login(loginData) {
    const data = await loginApi(loginData)
    setLoginInfo(data)
    return data
  }

  function setLoginInfo(data) {
    token.value = data.token
    adminInfo.value = {
      id: data.adminId,
      username: data.username,
      name: data.name
    }
    
    localStorage.setItem('admin_token', data.token)
    localStorage.setItem('admin_info', JSON.stringify(adminInfo.value))
  }

  function logout() {
    token.value = ''
    adminInfo.value = null
    
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
  }

  return {
    token,
    adminInfo,
    isLoggedIn,
    login,
    setLoginInfo,
    logout
  }
})
