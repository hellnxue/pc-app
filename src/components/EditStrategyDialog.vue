<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="formData" :rules="formRules" ref="strategyForm" label-width="100px">
      <el-form-item label="任务名称" prop="name">
        <el-select v-model="formData.name" placeholder="任务名称" disabled style="width: 100%;">
          <el-option :label="formData.name" :value="formData.name" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="间隔" prop="interval">
        <el-input v-model="formData.interval" placeholder="请输入间隔">
          <template slot="append">分钟</template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%;">
          <el-option label="执行中" value="running" />
          <el-option label="执行中断" value="interrupted" />
          <el-option label="已执行" value="completed" />
        </el-select>
      </el-form-item>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'EditStrategyDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    strategyData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      formData: {
        name: '',
        interval: '',
        status: ''
      },
      formRules: {
        interval: [
          { required: true, message: '请输入间隔时间', trigger: 'blur' },
          { pattern: /^\d+$/, message: '间隔时间必须为数字', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              const num = parseInt(value, 10)
              if (num < 0 || num > 24) {
                callback(new Error('间隔时间需在0-24之间'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    dialogTitle: () => '配置'
  },
  watch: {
    strategyData: {
      handler(newVal) {
        if (newVal) {
          this.formData = {
            name: newVal.name || '',
            interval: newVal.interval || '',
            status: newVal.status || ''
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    handleCancel() {
      this.handleClose()
    },
    handleClose() {
      this.$refs.strategyForm.clearValidate()
      this.$emit('update:visible', false)
    },
    handleSave() {
      this.$refs.strategyForm.validate((valid) => {
        if (valid) {
          this.$emit('save', { ...this.formData })
          this.handleClose()
        } else {
          console.log('表单验证失败!')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>