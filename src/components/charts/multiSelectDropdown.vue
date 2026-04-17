<template>
    <div class="custom-multi-select">
      <el-popover
        placement="bottom-start"
        width="160"
        trigger="click"
        v-model="popoverVisible"
      >
        <!-- 下拉内容：复选框列表 -->
        <div class="checkbox-list">
          <el-checkbox-group v-model="selectedValues" @change="handleChange">
            <div v-for="item in options" :key="item.value" class="checkbox-item">
              <el-checkbox :label="item.value" :disabled="item.disabled">
                {{ item.label }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
  
        <!-- 触发区域：带折叠标签效果的显示框 -->
        <div slot="reference" class="select-trigger" :class="{ 'is-focus': popoverVisible }">
          <div class="selected-tags" ref="tagsContainer">
            <template v-if="selectedLabels.length === 0">
              <span class="placeholder">{{ placeholder }}</span>
            </template>
            <template v-else>
              <!-- 显示的标签 -->
              <el-tag
                v-for="(label, index) in displayedTags"
                :key="index"
                closable
                @close="removeTag(label)"
                size="small"
                type="info"
              >
                {{ label }}
              </el-tag>
              <!-- 折叠的标签数量提示  @click.stop="toggleCollapse" -->
              <el-tag
                v-if="collapsedCount > 0"
                size="small"
                type="info"
                class="collapsed-tag"
               
              >
                +{{ collapsedCount }}
              </el-tag>
            </template>
          </div>
          <i class="el-icon-arrow-down arrow-icon" :class="{ 'is-reverse': popoverVisible }"></i>
        </div>
      </el-popover>
  
      <!-- 折叠标签展开的弹出层（可选） -->
      <el-popover
        v-if="showCollapsedPopover"
        placement="bottom-start"
        width="200"
        trigger="manual"
        v-model="showCollapsedPopover"
        @show="handleCollapsedPopoverShow"
      >
        <div class="collapsed-tags-list">
          <el-tag
            v-for="label in collapsedLabels"
            :key="label"
            closable
            @close="removeTag(label)"
            size="small"
            type="info"
          >
            {{ label }}
          </el-tag>
        </div>
      </el-popover>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CustomMultiSelect',
    props: {
      options: {
        type: Array,
        default: () => []
      },
      value: {
        type: Array,
        default: () => []
      },
      placeholder: {
        type: String,
        default: '请选择'
      },
      // 折叠标签的最大显示数量
      collapseTagsLimit: {
        type: Number,
        default: 1
      }
    },
    data() {
      return {
        popoverVisible: false,
        selectedValues: [...this.value],
        showCollapsedPopover: false,
        collapsedPopoverVisible: false
      }
    },
    computed: {
      selectedLabels() {
        // 根据选中的value获取对应的label
        return this.selectedValues.map(val => {
          const item = this.options.find(opt => opt.value === val)
          return item ? item.label : val
        })
      },
      // 显示的标签（前 collapseTagsLimit 个）
      displayedTags() {
        return this.selectedLabels.slice(0, this.collapseTagsLimit)
      },
      // 折叠的标签（超出部分）
      collapsedLabels() {
        return this.selectedLabels.slice(this.collapseTagsLimit)
      },
      // 折叠的标签数量
      collapsedCount() {
        return this.collapsedLabels.length
      }
    },
    watch: {
      value: {
        immediate: true,
        handler(newVal) {
          this.selectedValues = [...newVal]
        }
      },
      // 监听选中值变化，重新计算标签显示
      selectedLabels: {
        handler() {
          this.$nextTick(() => {
            this.adjustTagsDisplay()
          })
        },
        deep: true
      }
    },
    mounted() {
      this.adjustTagsDisplay()
      // 监听窗口大小变化，重新调整标签显示
      window.addEventListener('resize', this.adjustTagsDisplay)
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.adjustTagsDisplay)
    },
    methods: {
      handleChange(val) {
        this.$emit('input', val)
        this.$emit('change', val)
        // 选中值变化后重新调整标签显示
        this.$nextTick(() => {
          this.adjustTagsDisplay()
        })
      },
      removeTag(label) {
        const item = this.options.find(opt => opt.label === label)
        if (item) {
          const newVal = this.selectedValues.filter(v => v !== item.value)
          this.selectedValues = newVal
          this.handleChange(newVal)
        }
        // 如果折叠弹窗打开着，关闭它
        this.showCollapsedPopover = false
      },
      // 调整标签显示（根据容器宽度动态折叠）
      adjustTagsDisplay() {
        // 如果需要更智能的基于宽度的折叠，可以在这里实现
        // 当前使用基于数量的折叠方式（collapseTagsLimit）
        // 如需基于宽度的折叠，取消下面的注释
        /*
        const container = this.$refs.tagsContainer
        if (!container) return
        
        const tags = container.querySelectorAll('.el-tag')
        let totalWidth = 0
        const containerWidth = container.clientWidth - 20 // 减去箭头占位
        
        for (let i = 0; i < tags.length; i++) {
          totalWidth += tags[i].offsetWidth + 4 // 加上间距
          if (totalWidth > containerWidth && i < tags.length - 1) {
            // 超出宽度，需要折叠
            this.collapsedCount = tags.length - i
            break
          }
        }
        */
      },
      // 切换折叠标签的显示（点击 +N 时）
      toggleCollapse(event) {
        event.stopPropagation()
        // 方式1：使用 tooltip 显示
        this.$message({
          message: this.collapsedLabels.join('、'),
          type: 'info',
          duration: 2000
        })
        
        // 方式2：使用弹窗显示（需要配合 el-popover）
        // this.showCollapsedPopover = !this.showCollapsedPopover
      },
      handleCollapsedPopoverShow() {
        // 弹窗显示时的逻辑
      }
    }
  }
  </script>
  
  <style scoped>
  .custom-multi-select {
    width: 160px;
  }
  
  .select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 32px;
    padding: 4px 8px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fff;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  
  .select-trigger:hover {
    border-color: #c0c4cc;
  }
  
  .select-trigger.is-focus {
    border-color: #409eff;
  }
  
  .selected-tags {
    display: flex;
    flex-wrap: nowrap;
    gap: 4px;
    flex: 1;
    align-items: center;
    overflow: hidden;
  }
  
  .placeholder {
    color: #c0c4cc;
    font-size: 14px;
  }
  
  .arrow-icon {
    color: #c0c4cc;
    transition: transform 0.2s;
    margin-left: 8px;
    flex-shrink: 0;
  }
  
  .arrow-icon.is-reverse {
    transform: rotate(180deg);
  }
  
  .checkbox-list {
    max-height: 200px;
    overflow-y: auto;
  }
  
  .checkbox-item {
    padding: 2px 0px;
  }
  
  .checkbox-item:hover {
    background-color: #f5f7fa;
  }
  
  .collapsed-tag {
    cursor: pointer;
    background-color: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
  }
  
  .collapsed-tag:hover {
    background-color: #e9e9eb;
  }
  
  .collapsed-tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-width: 180px;
  }
  
  ::v-deep .el-checkbox {
    width: 100%;
    margin-right: 0;
  }
  
  ::v-deep .el-checkbox__label {
    font-weight: normal;
  }
  
  /* 标签样式优化 */
  ::v-deep .el-tag {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  </style>