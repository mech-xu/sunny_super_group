<template>
  <footer class="simple-footer">
    <div class="tab-bar">
      <div 
        v-for="tab in tabs" 
        :key="tab.name"
        :class="['tab-item', { active: activeTab === tab.name }]"
        @click="switchTab(tab)"
      >
        <div class="tab-icon">{{ tab.icon }}</div>
        <div class="tab-text">{{ tab.text }}</div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  activeTab: {
    type: String,
    default: 'home'
  }
});

const emit = defineEmits(['tabChange']);

const tabs = [
  { name: 'home', text: '首页', icon: '🏠', path: '/' },
  { name: 'goods', text: '商品', icon: '📦', path: '/goods' },
  { name: 'cart', text: '购物车', icon: '🛒', path: '/cart' },
  { name: 'user', text: '我的', icon: '👤', path: '/user' }
];

const switchTab = (tab) => {
  // 只传递字符串类型的 tab name
  emit('tabChange', tab.name);
};
</script>

<style scoped>
.simple-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  z-index: 100;
  border-top: 1px solid #f0f0f0;
  box-sizing: border-box;
}

.tab-bar {
  display: flex;
  height: 100%;
  width: 100%;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #07c160;
}

.tab-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.tab-text {
  font-size: 10px;
}
</style>