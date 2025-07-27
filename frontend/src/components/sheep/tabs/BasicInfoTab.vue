<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
    <el-alert title="更新提示" type="info" show-icon :closable="false" style="margin-bottom: 20px;">
      更新體重、產奶量等數據時，將以此日期存入歷史記錄。
      <el-date-picker v-model="form.record_date" type="date" placeholder="選擇記錄日期" size="small" style="margin-left: 10px;" />
    </el-alert>
    
    <h4>核心識別資料</h4>
    <el-row :gutter="20">
      <el-col :span="8"><el-form-item label="耳號 (EarNum)" prop="EarNum"><el-input v-model="form.EarNum" :disabled="!isNew" /></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="牧場編號 (FarmNum)"><el-input v-model="form.FarmNum" /></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="唯一記錄編號 (RUni)"><el-input v-model="form.RUni" /></el-form-item></el-col>
    </el-row>

    <h4>基礎生理資料</h4>
    <el-row :gutter="20">
      <el-col :span="8"><el-form-item label="性別 (Sex)"><el-select v-model="form.Sex" placeholder="選擇性別" style="width:100%"><el-option v-for="opt in sexOptions" :key="opt.value" :label="opt.label" :value="opt.value"/></el-select></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="出生日期 (BirthDate)"><el-date-picker v-model="form.BirthDate" type="date" placeholder="選擇日期" style="width:100%"/></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="出生體重 (kg)"><el-input-number v-model="form.BirWei" :precision="1" :step="0.1" style="width:100%"/></el-form-item></el-col>
    </el-row>

    <h4>血統資料</h4>
    <el-row :gutter="20">
      <el-col :span="6"><el-form-item label="品種 (Breed)"><el-input v-model="form.Breed" /></el-form-item></el-col>
      <el-col :span="6"><el-form-item label="父號 (Sire)"><el-input v-model="form.Sire" /></el-form-item></el-col>
      <el-col :span="6"><el-form-item label="父系品種 (SireBre)"><el-input v-model="form.SireBre" /></el-form-item></el-col>
      <el-col :span="6"><el-form-item label="母號 (Dam)"><el-input v-model="form.Dam" /></el-form-item></el-col>
      <el-col :span="6"><el-form-item label="母系品種 (DamBre)"><el-input v-model="form.DamBre" /></el-form-item></el-col>
    </el-row>
    <el-divider />

    <h4>飼養管理資料</h4>
    <el-row :gutter="20">
      <el-col :span="8"><el-form-item label="品種類別"><el-select v-model="form.breed_category" placeholder="選擇品種類別" style="width:100%"><el-option v-for="opt in breedCategoryOptions" :key="opt.value" :label="opt.label" :value="opt.value"/></el-select></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="體重 (公斤)"><el-input-number v-model="form.Body_Weight_kg" :precision="1" style="width:100%"/></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="月齡 (自動計算)"><el-input v-model="ageDisplay" disabled /></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="生理狀態"><el-select v-model="form.status" placeholder="選擇生理狀態" style="width:100%"><el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value"/></el-select></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="目標日增重 (克/天)"><el-input-number v-model="form.target_average_daily_gain_g" style="width:100%"/></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="活動量"><el-select v-model="form.activity_level" placeholder="選擇活動量" style="width:100%"><el-option v-for="opt in activityLevelOptions" :key="opt.value" :label="opt.label" :value="opt.value"/></el-select></el-form-item></el-col>
    </el-row>
    
    <h4>生產與繁殖資料</h4>
    <el-row :gutter="20">
      <el-col :span="8" v-if="isFemale"><el-form-item label="日產奶量 (公斤/天)"><el-input-number v-model="form.milk_yield_kg_day" :precision="1" style="width:100%"/></el-form-item></el-col>
      <el-col :span="8" v-if="isFemale"><el-form-item label="乳脂率 (%)"><el-input-number v-model="form.milk_fat_percentage" :precision="1" style="width:100%"/></el-form-item></el-col>
      <el-col :span="8" v-if="isFemale"><el-form-item label="懷胎數"><el-input-number v-model="form.number_of_fetuses" style="width:100%"/></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="泌乳胎次 (Lactation)"><el-input-number v-model="form.Lactation" style="width:100%"/></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="產仔數/窩 (LittleSize)"><el-input-number v-model="form.LittleSize" style="width:100%"/></el-form-item></el-col>
    </el-row>

    <h4>代理人備註與提醒日期</h4>
     <el-row :gutter="20">
        <el-col :span="24"><el-form-item label="代理人備註 (內部觀察)"><el-input v-model="form.agent_notes" type="textarea" :rows="2"/></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="下次疫苗日期"><el-date-picker v-model="form.next_vaccination_due_date" type="date" style="width:100%"/></el-form-item></el-col>
        <el-col :span="8"><el-form-item label="下次驅蟲日期"><el-date-picker v-model="form.next_deworming_due_date" type="date" style="width:100%"/></el-form-item></el-col>
        <el-col :span="8" v-if="isFemale"><el-form-item label="預計產仔日期"><el-date-picker v-model="form.expected_lambing_date" type="date" style="width:100%"/></el-form-item></el-col>
    </el-row>
    <el-divider />

    <h4>ESG 永續性資料 (選填)</h4>
    <el-row :gutter="20">
      <el-col :span="8"><el-form-item label="主要草料類型"><el-input v-model="form.primary_forage_type" placeholder="在地狼尾草、進口苜蓿草"/></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="糞肥管理方式"><el-input v-model="form.manure_management" placeholder="堆肥、厭氧發酵"/></el-form-item></el-col>
      <el-col :span="8"><el-form-item label="動物福利評分 (1-5)"><el-input-number v-model="form.welfare_score" :min="1" :max="5" style="width:100%"/></el-form-item></el-col>
    </el-row>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="saving">儲存羊隻資料</el-button>
      <el-button @click="emit('close')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useSheepStore } from '../../../stores/sheep';
import api from '../../../api';
import { formatDateForInput, sexOptions, breedCategoryOptions, statusOptions, activityLevelOptions } from '../../../utils';

const props = defineProps({
  sheepData: Object,
});
const emit = defineEmits(['close', 'data-updated']);
const sheepStore = useSheepStore();

const formRef = ref(null);
const saving = ref(false);

const isNew = computed(() => !props.sheepData);

const createInitialForm = () => ({
  record_date: new Date(),
  EarNum: '', FarmNum: '', RUni: '', Sex: '', BirthDate: null, BirWei: null,
  Breed: '', Sire: '', SireBre: '', Dam: '', DamBre: '',
  breed_category: '', Body_Weight_kg: null, status: '',
  target_average_daily_gain_g: null, activity_level: '', milk_yield_kg_day: null,
  milk_fat_percentage: null, number_of_fetuses: null, Lactation: null, LittleSize: null,
  agent_notes: '', next_vaccination_due_date: null, next_deworming_due_date: null, expected_lambing_date: null,
  primary_forage_type: '', manure_management: '', welfare_score: null
});

const form = reactive(createInitialForm());

const rules = {
  EarNum: [{ required: true, message: '耳號為必填項', trigger: 'blur' }],
};

const ageDisplay = computed(() => {
  if (form.BirthDate) {
    const birthDate = new Date(form.BirthDate);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months = (months + 12) % 12;
    }
    const totalMonths = years * 12 + months;
    form.Age_Months = totalMonths;
    return `${totalMonths} 個月 (約 ${years} 歲 ${months} 個月)`;
  }
  form.Age_Months = null;
  return '-';
});

const isFemale = computed(() => form.Sex === '母');

const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true;
      try {
        const dataToSubmit = { ...form };
        // 日期需要格式化為 YYYY-MM-DD 字串
        Object.keys(dataToSubmit).forEach(key => {
          if (dataToSubmit[key] instanceof Date) {
            dataToSubmit[key] = dataToSubmit[key].toISOString().split('T')[0];
          }
        });

        if (isNew.value) {
          const res = await api.addSheep(dataToSubmit);
          sheepStore.addSheep(res.sheep);
          ElMessage.success('新增成功');
        } else {
          const res = await api.updateSheep(props.sheepData.EarNum, dataToSubmit);
          sheepStore.updateSheep(res.sheep);
          ElMessage.success('更新成功');
        }
        emit('data-updated');
      } catch (error) {
        ElMessage.error(`操作失敗: ${error.error || error.message}`);
      } finally {
        saving.value = false;
      }
    }
  });
};

watch(() => props.sheepData, (newData) => {
  if (newData) {
    Object.assign(form, newData);
    // 將日期字串轉為 Date 物件以供 el-date-picker 使用
    ['BirthDate', 'next_vaccination_due_date', 'next_deworming_due_date', 'expected_lambing_date'].forEach(key => {
      if (form[key]) form[key] = new Date(form[key]);
    });
  } else {
    Object.assign(form, createInitialForm());
  }
}, { immediate: true });
</script>