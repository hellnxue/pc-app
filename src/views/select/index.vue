<template>
    <multi-select-dropdown
      v-model="selectedValues"
      :options="branchOptions"
      clearable
    />
  </template>
  
  <script>
  import multiSelectDropdown from "./multiSelectDropdown.vue";
  export default {
    components:{
        multiSelectDropdown
    },
    data() {
      return {
        selectedValues: ['beijing'],
        branchOptions: [
          { value: 'guangdong', label: '广东分公司' },
          { value: 'shanghai', label: '上海分公司' },
          { value: 'beijing', label: '北京分公司' },
          { value: 'zhejiang', label: '浙江分公司' },
          { value: 'zhongnan', label: '中南分公司' },
          { value: 'huanan', label: '华南分公司' }
        ]
      }
    }
  }
  </script>