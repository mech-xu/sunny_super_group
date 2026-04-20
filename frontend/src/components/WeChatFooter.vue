<template>
  <footer class="wechat-footer">
    <div class="tab-bar">
      <div 
        v-for="tab in tabs" 
        :key="tab.name"
        :class="['tab-item', { active: activeTab === tab.name }]"
        @click="switchTab(tab)"
      >
        <div class="tab-icon">
          {{ tab.icon }}
          <!-- 购物车角标 -->
          <span 
            v-if="tab.name === 'cart' && cartItemCount > 0" 
            class="cart-badge"
          >
            {{ cartItemCount }}
          </span>
        </div>
        <div class="tab-text">{{ tab.text }}</div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'WeChatFooter',
  props: {
    activeTab: {
      type: String,
      default: 'home'
    },
    cartItemCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['tab-change'],
  data() {
    return {
      tabs: [
        { name: 'home', text: '首页', icon: '🏠', path: '/' },
        { name: 'category', text: '分类', icon: '🏷️', path: '/category' },
        { name: 'cart', text: '我的订单', icon: '🛒', path: '/my-orders' },
        { name: 'profile', text: '我的', icon: '👤', path: '/profile' }
      ]
    }
  },
  methods: {
    switchTab(tab) {
      this.$emit('tab-change', tab);
    }
  }
}
</script>

<style scoped>
.wechat-footer {
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
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  box-sizing: border-box;
  padding: 0 2px;
  z-index: 101;
}

.tab-text {
  font-size: 10px;
}
</style>