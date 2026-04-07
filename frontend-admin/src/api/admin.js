import request from './request'

export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

export function getDashboard() {
  return request({
    url: '/admin/dashboard',
    method: 'get'
  })
}

export function getUsers(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

export function getLevels(params) {
  return request({
    url: '/admin/levels',
    method: 'get',
    params
  })
}

export function addLevel(data) {
  return request({
    url: '/admin/levels',
    method: 'post',
    data
  })
}

export function updateLevel(id, data) {
  return request({
    url: `/admin/levels/${id}`,
    method: 'put',
    data
  })
}

export function deleteLevel(id) {
  return request({
    url: `/admin/levels/${id}`,
    method: 'delete'
  })
}

export function getRecords(params) {
  return request({
    url: '/admin/records',
    method: 'get',
    params
  })
}
