// --- utils/index.js ---
// 集中管理所有通用的輔助函數和靜態數據

export function formatDateForInput(dateString) {
  if (!dateString) return '';
  try {
    const dateObj = new Date(dateString.replace(/-/g, '/').split(' ')[0]);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      if (year > 1900 && year < 2100) return `${year}-${month}-${day}`;
    }
  } catch (e) {
    console.error("Error formatting date for input:", dateString, e);
  }
  return '';
}

// --- 靜態選項數據 ---

export const sexOptions = [ { value: "母", label: "母 (Female)" }, { value: "公", label: "公 (Male)" }, { value: "閹", label: "閹 (Wether)" } ];
export const breedCategoryOptions = [ { value: "Dairy", label: "乳用 (Dairy)" }, { value: "Meat", label: "肉用 (Meat)" }, { value: "Fiber", label: "毛用 (Fiber)" }, { value: "DualPurpose", label: "兼用 (DualPurpose)" }, { value: "Miniature", label: "小型/寵物 (Miniature)" }, { value: "Other", label: "其他" } ];
export const statusOptions = [ { value: "maintenance", label: "維持期" }, { value: "growing_young", label: "生長前期" }, { value: "growing_finishing", label: "生長育肥期" }, { value: "gestating_early", label: "懷孕早期" }, { value: "gestating_late", label: "懷孕晚期" }, { value: "lactating_early", label: "泌乳早期" }, { value: "lactating_peak", label: "泌乳高峰期" }, { value: "lactating_mid", label: "泌乳中期" }, { value: "lactating_late", label: "泌乳晚期" }, { value: "dry_period", label: "乾乳期" }, { value: "breeding_male_active", label: "配種期公羊" }, { value: "breeding_male_non_active", label: "非配種期公羊" }, { value: "fiber_producing", label: "產毛期" }, { value: "other_status", label: "其他 (請描述)" } ];
export const activityLevelOptions = [ { value: "confined", label: "舍飼/限制" }, { value: "grazing_flat_pasture", label: "平地放牧" }, { value: "grazing_hilly_pasture", label: "山地放牧" } ];

// --- 數據導入中心的設定選項 ---

export const sheetPurposeOptions = [
    { value: "", text: "請選擇此工作表的用途..." },
    { value: "ignore", text: "忽略此工作表" },
    { value: "basic_info", text: "羊隻基礎資料 (Master Data)" },
    { value: "kidding_record", text: "分娩記錄 (Kidding Record)" },
    { value: "mating_record", text: "配種記錄 (Mating Record)" },
    { value: "yean_record", text: "泌乳/乾乳記錄 (Lactation/Dry-off Record)" },
    { value: "weight_record", text: "體重記錄 (Weight Record)" },
    { value: "milk_yield_record", text: "產乳量記錄 (Milk Yield Record)" },
    { value: "milk_analysis_record", text: "乳成分分析記錄 (Milk Analysis Record)" },
    { value: "breed_mapping", text: "品種代碼對照表 (Breed Mapping)" },
    { value: "sex_mapping", text: "性別代碼對照表 (Sex Mapping)" },
];

export const systemFieldMappings = {
    basic_info: [ { key: "EarNum", label: "耳號", required: true, example: "0009AL088089" }, { key: "Breed", label: "品種 (代碼)", example: "AL 或 11" }, { key: "Sex", label: "性別 (代碼)", example: "1 或 M" }, { key: "BirthDate", label: "出生日期", example: "2008/7/23" }, { key: "Sire", label: "父號", example: "父羊耳號" }, { key: "Dam", label: "母號", example: "母羊耳號" }, { key: "BirWei", label: "出生體重(kg)", example: "3.5" }, { key: "SireBre", label: "父系品種", example: "AL" }, { key: "DamBre", label: "母系品種", example: "SA" }, { key: "MoveCau", label: "異動原因", example: "05" }, { key: "MoveDate", label: "異動日期", example: "2012/1/2" }, { key: "Class", label: "等級", example: "A" }, { key: "LittleSize", label: "產仔數/窩", example: "2" }, { key: "Lactation", label: "泌乳胎次", example: "1" }, { key: "ManaClas", label: "管理分類", example: "Class 1" }, { key: "FarmNum", label: "牧場編號", example: "0009" }, { key: "RUni", label: "唯一記錄編號", example: "5171" } ],
    kidding_record: [ { key: "EarNum", label: "母羊耳號", required: true, example: "0009AL077032" }, { key: "YeanDate", label: "分娩日期", required: true, example: "2009/4/19" }, { key: "KidNum", label: "仔羊耳號", example: "0009AL099027" }, { key: "KidSex", label: "仔羊性別 (代碼)", example: "2 或 F" } ],
    mating_record: [ { key: "EarNum", label: "母羊耳號", required: true, example: "0009FX10K706" }, { key: "Mat_date", label: "配種日期", required: true, example: "2012/1/18" }, { key: "Mat_grouM_Sire", label: "配種公羊耳號", example: "0009AL070351" } ],
    yean_record: [ { key: "EarNum", label: "母羊耳號", required: true, example: "0009FX10K706" }, { key: "YeanDate", label: "泌乳開始日期(分娩)", required: true, example: "2012/6/12" }, { key: "DryOffDate", label: "乾乳日期", example: "1900/1/1" }, { key: "Lactation", label: "泌乳胎次", example: "2" } ],
    weight_record: [ { key: "EarNum", label: "耳號", required: true, example: "0007NU15..." }, { key: "MeaDate", label: "測量日期", required: true, example: "2015/8/11" }, { key: "Weight", label: "體重 (公斤)", required: true, example: "27.2" } ],
    milk_yield_record: [ { key: "EarNum", label: "耳號", required: true, example: "0009AL071268" }, { key: "MeaDate", label: "測量日期", required: true, example: "2010/11/10" }, { key: "Milk", label: "產乳量 (公斤)", required: true, example: "4.1" } ],
    milk_analysis_record: [ { key: "EarNum", label: "耳號", required: true, example: "0009AL077032" }, { key: "MeaDate", label: "測量日期", required: true, example: "2019/1/1" }, { key: "AMFat", label: "乳脂率 (%)", example: "3.29" } ],
    breed_mapping: [ { key: "Code", label: "品種代碼", required: true, example: "AL 或 11" }, { key: "Name", label: "品種全名", required: true, example: "阿爾拜因" } ],
    sex_mapping: [ { key: "Code", label: "性別代碼", required: true, example: "2 或 F" }, { key: "Name", label: "性別全名", required: true, example: "母" } ],
};