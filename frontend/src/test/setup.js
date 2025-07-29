/**
 * 測試環境設置檔案
 * 提供所有測試共用的設定和模擬
 */

import { config } from '@vue/test-utils'

// 全域註冊 Element Plus 模擬組件
config.global.stubs = {
  'el-card': {
    name: 'ElCard',
    template: '<div class="el-card"><slot /></div>',
    props: ['shadow']
  },
  'el-form': {
    name: 'ElForm',
    template: '<form class="el-form"><slot /></form>',
    props: ['model', 'labelPosition']
  },
  'el-form-item': {
    name: 'ElFormItem',
    template: '<div class="el-form-item"><label>{{ label }}</label><slot /></div>',
    props: ['label']
  },
  'el-row': {
    name: 'ElRow',
    template: '<div class="el-row"><slot /></div>',
    props: ['gutter']
  },
  'el-col': {
    name: 'ElCol',  
    template: '<div class="el-col"><slot /></div>',
    props: ['xs', 'sm', 'md']
  },
  'el-input': {
    name: 'ElInput',
    template: `
      <input 
        class="el-input" 
        :value="modelValue" 
        @input="$emit('update:modelValue', $event.target.value)" 
        @keyup.enter="$emit('keyup', $event)" 
        :placeholder="placeholder" 
      />
    `,
    props: ['modelValue', 'placeholder', 'clearable'],
    emits: ['update:modelValue', 'keyup'],
  },
  'el-select': {
    name: 'ElSelect',
    template: `
      <select 
        class="el-select" 
        :value="modelValue" 
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <slot />
      </select>
    `,
    props: ['modelValue', 'placeholder', 'clearable'],
    emits: ['update:modelValue'],
  },
  'el-select-v2': {
    name: 'ElSelectV2',
    template: `
      <select 
        class="el-select-v2" 
        :value="modelValue" 
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    `,
    props: ['modelValue', 'options', 'placeholder', 'clearable', 'filterable'],
    emits: ['update:modelValue'],
  },
  'el-option': {
    name: 'ElOption',
    template: '<option class="el-option" :value="value">{{ label }}</option>',
    props: ['value', 'label'],
  },
  'el-date-picker': {
    name: 'ElDatePicker',
    template: `
      <input 
        class="el-date-picker" 
        :value="modelValue" 
        @input="$emit('update:modelValue', $event.target.value)" 
      />
    `,
    props: ['modelValue', 'type', 'rangeSeparator', 'startPlaceholder', 'endPlaceholder', 'valueFormat'],
    emits: ['update:modelValue'],
  },
  'el-button': {
    name: 'ElButton',
    template: '<button class="el-button" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ['type', 'icon'],
    emits: ['click'],
  },
}

// 全域註冊模擬圖標
config.global.mocks = {
  Search: 'search-icon'
}
