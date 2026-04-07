<template>
  <div class="levels-page">
    <div class="page-card">
      <div class="page-header">
        <h3 class="page-title">关卡管理</h3>
        
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加关卡
        </el-button>
      </div>
      
      <el-table
        v-loading="loading"
        :data="levelList"
        stripe
        style="width: 100%"
        empty-text="暂无关卡数据"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        
        <el-table-column prop="name" label="关卡名称" min-width="120">
          <template #default="{ row }">
            <div class="level-name">
              <el-icon class="level-icon"><Grid /></el-icon>
              {{ row.name }}
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="difficulty" label="难度" width="140" align="center">
          <template #default="{ row }">
            <el-rate
              :model-value="row.difficulty"
              disabled
              :max="5"
              :colors="['#FF6B6B', '#FF6B6B', '#FF6B6B']"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="config" label="关卡配置" min-width="280">
          <template #default="{ row }">
            <div class="config-tags">
              <el-tag
                v-for="(value, key) in parseConfig(row.config)"
                :key="key"
                :type="getTagType(key)"
                effect="plain"
                size="small"
              >
                <el-icon v-if="key === 'gridSize'"><Grid /></el-icon>
                <el-icon v-else-if="key === 'pairs'"><Connection /></el-icon>
                <el-icon v-else-if="key === 'timeLimit'"><Timer /></el-icon>
                {{ configLabel[key] || key }}: {{ value }}{{ key === 'timeLimit' ? '秒' : '' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="time-text">{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button type="primary" size="small" plain @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" size="small" plain @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
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
          @size-change="fetchLevels"
          @current-change="fetchLevels"
        />
      </div>
    </div>
    
    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑关卡' : '添加关卡'"
      width="520px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="关卡名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入关卡名称，如：第一关"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="难度等级" prop="difficulty">
          <div class="difficulty-selector">
            <el-rate 
              v-model="form.difficulty" 
              :max="5"
              :colors="['#FF6B6B', '#FF6B6B', '#FF6B6B']"
              show-text
              :texts="['简单', '较简单', '中等', '较难', '困难']"
            />
          </div>
        </el-form-item>
        
        <el-divider content-position="left">游戏配置</el-divider>
        
        <el-form-item label="网格大小" prop="gridSize">
          <div class="slider-wrap">
            <el-slider 
              v-model="form.gridSize" 
              :min="3" 
              :max="8"
              :marks="{ 3: '3×3', 4: '4×4', 5: '5×5', 6: '6×6', 7: '7×7', 8: '8×8' }"
            />
            <span class="slider-value">{{ form.gridSize }}×{{ form.gridSize }}</span>
          </div>
        </el-form-item>
        
        <el-form-item label="配对数量" prop="pairs">
          <el-input-number 
            v-model="form.pairs" 
            :min="2" 
            :max="32"
            controls-position="right"
          />
          <span class="form-tip">建议不超过网格总数的一半</span>
        </el-form-item>
        
        <el-form-item label="时间限制" prop="timeLimit">
          <el-input-number 
            v-model="form.timeLimit" 
            :min="30" 
            :max="300" 
            :step="30"
            controls-position="right"
          />
          <span class="form-tip">单位：秒</span>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '确认添加' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getLevels, addLevel, updateLevel, deleteLevel } from '@/api/admin'

const loading = ref(false)
const submitLoading = ref(false)
const levelList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const configLabel = {
  gridSize: '网格',
  pairs: '配对',
  timeLimit: '时限'
}

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  difficulty: 1,
  gridSize: 4,
  pairs: 8,
  timeLimit: 120
})

const rules = {
  name: [{ required: true, message: '请输入关卡名称', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度等级', trigger: 'change' }]
}

const getTagType = (key) => {
  const types = { gridSize: '', pairs: 'success', timeLimit: 'warning' }
  return types[key] || ''
}

const fetchLevels = async () => {
  loading.value = true
  try {
    const data = await getLevels({
      page: pagination.page,
      size: pagination.size
    })
    levelList.value = data.records || []
    pagination.total = data.total || 0
  } catch (error) {
    console.error('获取关卡列表失败:', error)
  } finally {
    loading.value = false
  }
}

const parseConfig = (configStr) => {
  try {
    return JSON.parse(configStr)
  } catch {
    return {}
  }
}

const resetForm = () => {
  form.id = null
  form.name = ''
  form.difficulty = 1
  form.gridSize = 4
  form.pairs = 8
  form.timeLimit = 120
}

const handleAdd = () => {
  resetForm()
  isEdit.value = false
  dialogVisible.value = true
}

const handleEdit = (row) => {
  const config = parseConfig(row.config)
  form.id = row.id
  form.name = row.name
  form.difficulty = row.difficulty
  form.gridSize = config.gridSize || 4
  form.pairs = config.pairs || 8
  form.timeLimit = config.timeLimit || 120
  isEdit.value = true
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除关卡"${row.name}"吗？删除后无法恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      await deleteLevel(row.id)
      ElMessage.success('删除成功')
      fetchLevels()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const data = {
        name: form.name,
        difficulty: form.difficulty,
        config: JSON.stringify({
          gridSize: form.gridSize,
          pairs: form.pairs,
          timeLimit: form.timeLimit
        })
      }
      
      if (isEdit.value) {
        await updateLevel(form.id, data)
        ElMessage.success('更新成功')
      } else {
        await addLevel(data)
        ElMessage.success('添加成功')
      }
      
      dialogVisible.value = false
      fetchLevels()
    } catch (error) {
      console.error('提交失败:', error)
    } finally {
      submitLoading.value = false
    }
  })
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
  fetchLevels()
})
</script>

<style lang="scss" scoped>
.levels-page {
  .level-name {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .level-icon {
      color: #FF6B6B;
    }
  }
  
  .config-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    
    .el-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      font-size: 14px;
      height: 32px;
      border-radius: 6px;
      
      .el-icon {
        font-size: 16px;
      }
    }
  }
  
  .time-text {
    color: #999;
    font-size: 13px;
  }
  
  .difficulty-selector {
    padding: 8px 0;
  }
  
  .slider-wrap {
    display: flex;
    align-items: center;
    width: 100%;
    
    .el-slider {
      flex: 1;
      margin-right: 16px;
    }
    
    .slider-value {
      min-width: 50px;
      text-align: center;
      font-weight: 600;
      color: #FF6B6B;
    }
  }
  
  .form-tip {
    margin-left: 12px;
    font-size: 12px;
    color: #999;
  }
}
</style>
