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
        <el-row v-for="(row, rowIndex) in formRows" :key="rowIndex" :gutter="20">
          <el-col :span="8" v-for="(item, index) in row" :key="index">
            <!-- 条件显示字段 -->
            <el-form-item 
              v-if="!item.conditionalDisplay || formData[item.conditionalDisplay] === item.conditionValue"
              :label="item.label" 
              :prop="item.prop"
            >
              <!-- 输入框 -->
              <el-input 
                v-if="item.type === 'input'"
                v-model="formData[item.prop]" 
                :placeholder="item.placeholder || `请输入${item.label}`"
                @blur="item.prop === 'orgCode' ? checkDuplicateOrgCode : null"
              />
              
              <!-- 数字输入框 -->
              <el-input 
                v-else-if="item.type === 'number'"
                v-model.number="formData[item.prop]" 
                type="number"
                :placeholder="item.placeholder || `请输入${item.label}`"
              />
              
              <!-- 日期选择器 -->
              <el-date-picker
                v-else-if="item.type === 'date'"
                v-model="formData[item.prop]"
                type="date"
                :placeholder="item.placeholder || `请选择${item.label}`"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
              
              <!-- 选择框 -->
              <el-select 
                v-else-if="item.type === 'select'"
                v-model="formData[item.prop]" 
                :placeholder="item.placeholder || `请选择${item.label}`"
                style="width: 100%"
                @change="item.onChange ? handleChange(item.onChange) : null"
                :disabled="item.disabledCondition ? !formData[item.disabledCondition] : false"
              >
                <!-- 静态选项 -->
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
    
    // 验证固定电话格式
    const validatePhone = (rule, value, callback) => {
      const phoneRegex = /^(\d{3,4}-?)?\d{7,8}$/;
      if (value && !phoneRegex.test(value)) {
        callback(new Error('请输入正确的固定电话格式，如：010-12345678'));
      } else {
        callback();
      }
    };
    
    // 验证手机号格式
    const validateMobile = (rule, value, callback) => {
      const mobileRegex = /^1[3-9]\d{9}$/;
      if (value && !mobileRegex.test(value)) {
        callback(new Error('请输入正确的手机号格式'));
      } else {
        callback();
      }
    };
    
    // 验证邮箱格式
    const validateEmail = (rule, value, callback) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (value && !emailRegex.test(value)) {
        callback(new Error('请输入正确的邮箱格式'));
      } else {
        callback();
      }
    };
    
    // 验证人数为数字或空值
    const validateNumber = (rule, value, callback) => {
      if (value && isNaN(Number(value))) {
        callback(new Error('请输入有效的数字'));
      } else {
        callback();
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
        postalCode: '',
        staffCount: '',           // 人员数量
        manager: '',             // 小卖部部负责人
        managerPhone: '',        // 小卖部负责人固定电话
        managerMobile: '',       // 小卖部负责人手机
        managerEmail: '',        // 小卖部负责人邮箱
        businessManager: '',     // 小卖部业务负责人
        businessManagerPhone: '', // 小卖部业务负责人电话
        khPosition: '',         // 岗位（kh）
        fixedPhone1: '',        // 固定电话1
        mobilePhone1: '',       // 手机号码1
        email1: '',             // 邮箱1
        operatorNumber: '',     // 操作员号
        fkPosition: '',         // 岗位（fk）
        fixedPhone2: '',        // 固定电话2
        mobilePhone2: '',       // 手机号码2
        email2: '',              // 邮箱2
        operatorId: '',         // caozuoyuan号
        zqCompany: '',          // 所属zq公司
        regulatoryArea: '',     // zq公司所属监管辖区
        applicationDate: '',    // 申请资格时间
        changeTime: '',         // 变更时间
        changeInfo: '',         // 变更信息
        changeDate: '',         // 变更日期
        khPositionCount: '',    // 小卖部kh岗人数
        fkPositionCount: '',    // 小卖部fk岗人数
        wkQualification: '',    // wk资格
        hasZxQualification: '', // 是否zx资格
        zxQualificationTime: '' // zx资格时间
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
        ],
        zqCompany: [
          { required: true, message: '请输入所属zq公司', trigger: 'blur' }
        ],
        regulatoryArea: [
          { required: true, message: '请输入zq公司所属监管辖区', trigger: 'blur' }
        ],
        wkQualification: [
          { required: true, message: '请选择wk资格', trigger: 'change' }
        ],
        hasZxQualification: [
          { required: true, message: '请选择是否zx资格', trigger: 'change' }
        ],
        zxQualificationTime: [
          { 
            validator: (rule, value, callback) => {
              // 如果选择了"是"，则必须填写日期
              if (this.formData.hasZxQualification === '是' && !value) {
                callback(new Error('当选择"是"时，此字段为必填项'));
              } else if (this.formData.hasZxQualification === '是' && value) {
                // 如果选择了"是"并且提供了值，则验证日期格式
                callback();
              } else {
                // 如果选择了"否"，则不需要验证
                callback();
              }
            },
            trigger: 'change'
          }
        ],
        // 新增字段的校验规则
        managerPhone: [
          { validator: validatePhone, trigger: 'blur' }
        ],
        managerMobile: [
          { validator: validateMobile, trigger: 'blur' }
        ],
        managerEmail: [
          { validator: validateEmail, trigger: 'blur' }
        ],
        businessManagerPhone: [
          { validator: validateMobile, trigger: 'blur' }
        ],
        staffCount: [
          { validator: validateNumber, trigger: 'blur' }
        ],
        fixedPhone1: [
          { validator: validatePhone, trigger: 'blur' }
        ],
        mobilePhone1: [
          { validator: validateMobile, trigger: 'blur' }
        ],
        email1: [
          { validator: validateEmail, trigger: 'blur' }
        ],
        fixedPhone2: [
          { validator: validatePhone, trigger: 'blur' }
        ],
        mobilePhone2: [
          { validator: validateMobile, trigger: 'blur' }
        ],
        email2: [
          { validator: validateEmail, trigger: 'blur' }
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
          onChange: 'onProvinceChange'
        },
        {
          label: '城市',
          prop: 'city',
          type: 'select',
          placeholder: '请选择城市',
          disabledCondition: 'province',
          options: this.cityOptions,
          onChange: 'onCityChange'
        },
        {
          label: '区县',
          prop: 'district',
          type: 'select',
          placeholder: '请选择区县',
          disabledCondition: 'city',
          options: this.areaOptions
        },
        {
          label: '具体地址',
          prop: 'address',
          type: 'input',
          placeholder: '请输入具体地址'
        },
        {
          label: '邮编',
          prop: 'postalCode',
          type: 'input',
          placeholder: '请输入邮编'
        },
        // 新增字段
        {
          label: '人员数量',
          prop: 'staffCount',
          type: 'input',
          placeholder: '请输入人员数量'
        },
        {
          label: '小卖部部负责人',
          prop: 'manager',
          type: 'input',
          placeholder: '请输入小卖部部负责人'
        },
        {
          label: '小卖部负责人固定电话',
          prop: 'managerPhone',
          type: 'input',
          placeholder: '请输入小卖部负责人固定电话'
        },
        {
          label: '小卖部负责人手机',
          prop: 'managerMobile',
          type: 'input',
          placeholder: '请输入小卖部负责人手机'
        },
        {
          label: '小卖部负责人邮箱',
          prop: 'managerEmail',
          type: 'input',
          placeholder: '请输入小卖部负责人邮箱'
        },
        {
          label: '小卖部业务负责人',
          prop: 'businessManager',
          type: 'input',
          placeholder: '请输入小卖部业务负责人'
        },
        {
          label: '小卖部业务负责人电话',
          prop: 'businessManagerPhone',
          type: 'input',
          placeholder: '请输入小卖部业务负责人电话'
        },
        {
          label: '岗位（kh）',
          prop: 'khPosition',
          type: 'input',
          placeholder: '请输入岗位（kh）'
        },
        {
          label: '固定电话',
          prop: 'fixedPhone1',
          type: 'input',
          placeholder: '请输入固定电话'
        },
        {
          label: '手机号码',
          prop: 'mobilePhone1',
          type: 'input',
          placeholder: '请输入手机号码'
        },
        {
          label: '邮箱1',
          prop: 'email1',
          type: 'input',
          placeholder: '请输入邮箱1'
        },
        {
          label: '操作员号',
          prop: 'operatorNumber',
          type: 'input',
          placeholder: '请输入操作员号'
        },
        {
          label: '岗位（fk）',
          prop: 'fkPosition',
          type: 'input',
          placeholder: '请输入岗位（fk）'
        },
        {
          label: '固定电话',
          prop: 'fixedPhone2',
          type: 'input',
          placeholder: '请输入固定电话'
        },
        {
          label: '手机号码',
          prop: 'mobilePhone2',
          type: 'input',
          placeholder: '请输入手机号码'
        },
        {
          label: '邮箱2',
          prop: 'email2',
          type: 'input',
          placeholder: '请输入邮箱2'
        },
        {
          label: 'caozuoyuan号',
          prop: 'operatorId',
          type: 'input',
          placeholder: '请输入caozuoyuan号'
        },
        {
          label: '所属zq公司',
          prop: 'zqCompany',
          type: 'input',
          placeholder: '请输入所属zq公司',
          required: true
        },
        {
          label: 'zq公司所属监管辖区',
          prop: 'regulatoryArea',
          type: 'input',
          placeholder: '请输入zq公司所属监管辖区',
          required: true
        },
        {
          label: '申请资格时间',
          prop: 'applicationDate',
          type: 'date',
          placeholder: '请选择申请资格时间'
        },
        {
          label: '变更时间',
          prop: 'changeTime',
          type: 'date',
          placeholder: '请选择变更时间'
        },
        {
          label: '变更信息',
          prop: 'changeInfo',
          type: 'input',
          placeholder: '请输入变更信息'
        },
        
        {
          label: '小卖部kh岗人数',
          prop: 'khPositionCount',
          type: 'number',
          placeholder: '请输入小卖部kh岗人数'
        },
        {
          label: '小卖部fk岗人数',
          prop: 'fkPositionCount',
          type: 'number',
          placeholder: '请输入小卖部fk岗人数'
        },
        {
          label: 'wk资格',
          prop: 'wkQualification',
          type: 'select',
          placeholder: '请选择wk资格',
          required: true,
          staticOptions: true,
          options: [
            { label: '开启', value: '开启' },
            { label: '关闭', value: '关闭' }
          ]
        },
        {
          label: '是否zx资格',
          prop: 'hasZxQualification',
          type: 'select',
          placeholder: '请选择是否zx资格',
          required: true,
          staticOptions: true,
          options: [
            { label: '是', value: '是' },
            { label: '否', value: '否' }
          ]
        },
        {
          label: 'zx资格时间',
          prop: 'zxQualificationTime',
          type: 'date',
          placeholder: '请选择zx资格时间',
          conditionalDisplay: 'hasZxQualification', // 当hasZxQualification为'是'时显示
          conditionValue: '是'
        },
        {
          label: '变更日期',
          prop: 'changeDate',
          type: 'date',
          placeholder: '请选择变更日期'
        },
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