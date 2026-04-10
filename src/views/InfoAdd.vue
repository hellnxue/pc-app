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
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="小卖部部代码" prop="departmentCode">
            <el-input 
              v-model="formData.departmentCode" 
              placeholder="小卖部柜台代码，允许为空"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="小卖部组织编码" prop="orgCode">
            <el-input 
              v-model="formData.orgCode" 
              placeholder="请输入小卖部组织编码"
              @blur="checkDuplicateOrgCode"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="小卖部简称" prop="shortName">
            <el-input 
              v-model="formData.shortName" 
              placeholder="请输入小卖部简称"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="小卖部全称" prop="fullName">
            <el-input 
              v-model="formData.fullName" 
              placeholder="请输入小卖部全称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="统一社会信用代码" prop="creditCode">
            <el-input 
              v-model="formData.creditCode" 
              placeholder="请输入统一社会信用代码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="小卖部监管局" prop="supervisionDepartment">
            <el-select 
              v-model="formData.supervisionDepartment" 
              placeholder="请选择小卖部监管局"
              style="width: 100%"
            >
              <el-option label="监管局A" value="监管局A"></el-option>
              <el-option label="监管局B" value="监管局B"></el-option>
              <el-option label="监管局C" value="监管局C"></el-option>
              <el-option label="监管局D" value="监管局D"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="省份" prop="province">
            <el-select 
              v-model="formData.province" 
              placeholder="请选择省份"
              style="width: 100%"
              @change="onProvinceChange"
            >
              <el-option 
                v-for="prov in provinceCityList" 
                :key="prov.label" 
                :label="prov.label" 
                :value="prov.label" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="城市" prop="city">
            <el-select 
              v-model="formData.city" 
              placeholder="请选择城市"
              style="width: 100%"
              :disabled="!formData.province"
              @change="onCityChange"
            >
              <el-option 
                v-for="city in cityOptions" 
                :key="city.value" 
                :label="city.label" 
                :value="city.value" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="区县" prop="district">
            <el-select 
              v-model="formData.district" 
              placeholder="请选择区县"
              style="width: 100%"
              :disabled="!formData.city"
            >
              <el-option 
                v-for="area in areaOptions" 
                :key="area.value" 
                :label="area.label" 
                :value="area.value" 
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
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
  methods: {
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
      
      if (this.formData.province) {
        // 查找选中省份的数据
        const selectedProvince = this.provinceCityList.find(p => p.label === this.formData.province);
        if (selectedProvince) {
          this.cityOptions = selectedProvince.cityList;
        }
      }
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
            this.areaOptions = selectedCity.areaList;
          }
        }
      }
    }
  }
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