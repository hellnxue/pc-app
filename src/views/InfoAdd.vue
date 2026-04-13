<template>
  <div class="info-add-container">
    <h2 class="form-title">新增小卖部信息</h2>
    <el-form 
      :model="formData" 
      :rules="rules" 
      ref="infoAddForm" 
      label-position="left"
      class="info-add-form"
    >
      <!-- 动态生成前两行表单项 -->
    
        <el-row  v-for="(row, rowIndex) in formRows" :gutter="20" :key="rowIndex">
          <el-col :span="8" v-for="(item, index) in row" :key="index">
            <el-form-item :label="item.label" :prop="item.prop">
              <!-- 输入框 -->
              <el-input 
                v-if="item.type === 'input'"
                v-model="formData[item.prop]" 
                :placeholder="item.placeholder || `请输入${item.label}`"
                @blur="item.prop === 'orgCode' ? checkDuplicateOrgCode : null"
              />
              
                
              <!-- 选择框  -->
              <el-select 
                v-else-if="item.type === 'select'"
                v-model="formData[item.prop]" 
                :placeholder="item.placeholder || `请选择${item.label}`"
                style="width: 100%"
                @change="item.onChange ?handleChange(item.onChange) : null"
                :disabled="item.disabledCondition ? !formData[item.disabledCondition] : false"
              >
                <el-option 
                  v-for="option in item.options" 
                  :key="option.value" 
                  :label="option.label" 
                  :value="option.value" 
                />
                
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      
      
      <!-- 地址和邮编单独处理，因为它们跨两列 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="具体地址" prop="address">
            <el-input 
              v-model="formData.address" 
              placeholder="请输入具体地址"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮编" prop="postalCode">
            <el-input 
              v-model="formData.postalCode" 
              placeholder="请输入邮编"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <div class="form-buttons">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="cancelForm">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'InfoAdd',
  data() {
    // 自定义验证组织编码是否重复的规则
    const validateOrgCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入小卖部组织编码'));
      } else {
        // 这里可以调用接口检查组织编码是否重复
        // 模拟检查结果
        if (value === 'TEST001') {
          callback(new Error('该组织编码已存在，请更换组织编码'));
        } else {
          callback(); // 验证通过
        }
      }
    };
    
    return {
      formData: {
        departmentCode: '',
        orgCode: '',
        shortName: '',
        fullName: '',
        creditCode: '',
        supervisionDepartment: '',
        province: '',
        city: '',
        district: '',
        address: '',
        postalCode: ''
      },
      provinceCityList: [
        {
          label: '北京',
          cityList: [
            { 
              label: '北京市', 
              value: '北京市',
              areaList: [
                { label: '东城区', value: '东城区' },
                { label: '西城区', value: '西城区' },
                { label: '朝阳区', value: '朝阳区' },
                { label: '丰台区', value: '丰台区' }
              ]
            }
          ]
        },
        {
          label: '上海',
          cityList: [
            { 
              label: '上海市', 
              value: '上海市',
              areaList: [
                { label: '黄浦区', value: '黄浦区' },
                { label: '徐汇区', value: '徐汇区' },
                { label: '长宁区', value: '长宁区' },
                { label: '静安区', value: '静安区' }
              ]
            }
          ]
        },
        {
          label: '广东',
          cityList: [
            { 
              label: '广州市', 
              value: '广州市',
              areaList: [
                { label: '越秀区', value: '越秀区' },
                { label: '荔湾区', value: '荔湾区' },
                { label: '海珠区', value: '海珠区' },
                { label: '天河区', value: '天河区' }
              ]
            },
            { 
              label: '深圳市', 
              value: '深圳市',
              areaList: [
                { label: '罗湖区', value: '罗湖区' },
                { label: '福田区', value: '福田区' },
                { label: '南山区', value: '南山区' },
                { label: '宝安区', value: '宝安区' }
              ]
            }
          ]
        },
        {
          label: '江苏',
          cityList: [
            { 
              label: '南京市', 
              value: '南京市',
              areaList: [
                { label: '玄武区', value: '玄武区' },
                { label: '秦淮区', value: '秦淮区' },
                { label: '建邺区', value: '建邺区' },
                { label: '鼓楼区', value: '鼓楼区' }
              ]
            },
            { 
              label: '苏州市', 
              value: '苏州市',
              areaList: [
                { label: '姑苏区', value: '姑苏区' },
                { label: '虎丘区', value: '虎丘区' },
                { label: '吴中区', value: '吴中区' },
                { label: '相城区', value: '相城区' }
              ]
            }
          ]
        }
      ],
      cityOptions: [], // 城市选项
      areaOptions: [], // 区县选项
      rules: {
        orgCode: [
          { validator: validateOrgCode, trigger: 'blur' }
        ],
        shortName: [
          { required: true, message: '请输入小卖部简称', trigger: 'blur' }
        ],
        fullName: [
          { required: true, message: '请输入小卖部全称', trigger: 'blur' }
        ],
        creditCode: [
          { required: true, message: '请输入统一社会信用代码', trigger: 'blur' }
        ],
        supervisionDepartment: [
          { required: true, message: '请选择小卖部监管局', trigger: 'change' }
        ],
        province: [
          { required: true, message: '请选择省份', trigger: 'change' }
        ],
        city: [
          { required: true, message: '请选择城市', trigger: 'change' }
        ],
        district: [
          { required: true, message: '请选择区县', trigger: 'change' }
        ],
        address: [
          { required: true, message: '请输入具体地址', trigger: 'blur' }
        ],
        postalCode: [
          { required: true, message: '请输入邮编', trigger: 'blur' },
          { pattern: /^\d{6}$/, message: '邮编格式不正确，应为6位数字', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 动态生成表单配置项
    formItemList() {
      return [
        {
          label: '小卖部部代码',
          prop: 'departmentCode',
          type: 'input',
          placeholder: '小卖部柜台代码，允许为空'
        },
        {
          label: '小卖部组织编码',
          prop: 'orgCode',
          type: 'input',
          placeholder: '请输入小卖部组织编码',
          onBlur: true
        },
        {
          label: '小卖部简称',
          prop: 'shortName',
          type: 'input',
          placeholder: '请输入小卖部简称'
        },
        {
          label: '小卖部全称',
          prop: 'fullName',
          type: 'input',
          placeholder: '请输入小卖部全称'
        },
        {
          label: '统一社会信用代码',
          prop: 'creditCode',
          type: 'input',
          placeholder: '请输入统一社会信用代码'
        },
        {
          label: '小卖部监管局',
          prop: 'supervisionDepartment',
          type: 'select',
          placeholder: '请选择小卖部监管局',
          staticOptions: true,
          options: [
            { label: '监管局A', value: '监管局A' },
            { label: '监管局B', value: '监管局B' },
            { label: '监管局C', value: '监管局C' },
            { label: '监管局D', value: '监管局D' }
          ]
        },
        {
          label: '省份',
          prop: 'province',
          type: 'select',
          placeholder: '请选择省份',
          options: this.provinceCityList.map(province => ({
            label: province.label,
            value: province.label
          })),
          onChange:'onProvinceChange'
        },
        {
          label: '城市',
          prop: 'city',
          type: 'select',
          placeholder: '请选择城市',
          disabledCondition: 'province',
          options: this.cityOptions,
          onChange:'onCityChange'
        },
        {
          label: '区县',
          prop: 'district',
          type: 'select',
          placeholder: '请选择区县',
          disabledCondition: 'city',
          options: this.areaOptions
        }
      ];
    },
    // 生成行结构，每行最多3个项目
    formRows() {
      const rows = [];
      const items = this.formItemList;
      for (let i = 0; i < items.length; i += 3) {
        rows.push(items.slice(i, i + 3));
      }
      return rows;
    }
  },
  methods: {
    handleChange(onChange) {
       
      if (typeof onChange === 'string' && this[onChange]) {
        this[onChange]();
      }
    },
    submitForm() {
      this.$refs.infoAddForm.validate((valid) => {
        if (valid) {
          console.log('提交表单:', this.formData);
          this.$message.success('小卖部信息添加成功');
          this.resetForm();
        } else {
          console.log('表单验证失败');
          return false;
        }
      });
    },
    cancelForm() {
      this.$confirm('确认取消并返回吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.go(-1); // 返回上一页
      }).catch(() => {
        // 取消操作
      });
    },
    resetForm() {
      this.$refs.infoAddForm.resetFields();
    },
    checkDuplicateOrgCode() {
      // 触发验证
      this.$refs.infoAddForm.validateField('orgCode');
    },
    onProvinceChange() {
        
      // 当省份改变时，清空城市和区县选项
      this.formData.city = '';
      this.formData.district = '';
      this.cityOptions = [];
      this.areaOptions = [];
     
        // 查找选中省份的数据
        const selectedProvince = this.provinceCityList.find(p => p.label === this.formData.province);
        if (selectedProvince) {
          this.cityOptions = selectedProvince.cityList.map(city => ({
            label: city.label,
            value: city.value
          }));
        }

       console.log('cityOptions===================',this.cityOptions);

      },
      onCityChange() {

      // 当城市改变时，清空区县选项
      this.formData.district = '';
      this.areaOptions = [];
       
      
      if (this.formData.city) {

        // 查找选中省份的数据
        const selectedProvince = this.provinceCityList.find(p => p.label === this.formData.province);
        if (selectedProvince) {
          // 查找选中城市的区县数据
          const selectedCity = selectedProvince.cityList.find(c => c.value === this.formData.city);
          if (selectedCity && selectedCity.areaList) {


            this.areaOptions = selectedCity.areaList.map(area => ({
              label: area.label,
              value: area.value
            }));
          }
        }
      }
    }

    },

     
   
  }
 
</script>

<style scoped>
.info-add-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin: 20px;
}

.form-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.info-add-form {
  max-width: 1000px;
  margin: 0 auto;
}

.form-buttons {
  text-align: center;
  margin-top: 30px;
}

.form-buttons .el-button {
  margin-right: 20px;
}
</style>