<template>
  <div class="debug-page">
    <div class="debug-container">
      <h1>SunnyNow 团购自提系统 - 调试面板</h1>
      
      <div class="debug-section">
        <h2>页面导航</h2>
        <div class="nav-buttons">
          <a href="/" class="nav-btn">首页</a>
          <a href="/products" class="nav-btn">商品列表</a>
          <a href="/cart" class="nav-btn">购物车</a>
          <a href="/my-orders" class="nav-btn">我的订单</a>
          <a href="/profile" class="nav-btn">个人中心</a>
        </div>
      </div>

      <div class="debug-section">
        <h2>订单流程测试</h2>
        <div class="flow-buttons">
          <button @click="testFlow('login')" class="flow-btn">登录流程</button>
          <button @click="testFlow('add-to-cart')" class="flow-btn">添加商品到购物车</button>
          <button @click="testFlow('checkout')" class="flow-btn">结账流程</button>
          <button @click="testFlow('order-status')" class="flow-btn">订单状态变更</button>
        </div>
      </div>

      <div class="debug-section">
        <h2>设备信息</h2>
        <div class="device-info">
          <p>屏幕宽度: {{ screenWidth }}px</p>
          <p>屏幕高度: {{ screenHeight }}px</p>
          <p>用户代理: {{ userAgent }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleDebugPage',
  data() {
    return {
      screenWidth: 0,
      screenHeight: 0,
      userAgent: ''
    }
  },
  mounted() {
    this.screenWidth = window.screen.width;
    this.screenHeight = window.screen.height;
    this.userAgent = navigator.userAgent;
  },
  methods: {
    testFlow(flowType) {
      console.log(`Testing flow: ${flowType}`);
      switch(flowType) {
        case 'login':
          window.location.href = '/';
          break;
        case 'add-to-cart':
          alert('添加商品到购物车测试');
          break;
        case 'checkout':
          window.location.href = '/order-preview';
          break;
        case 'order-status':
          window.location.href = '/my-orders';
          break;
      }
    }
  }
}
</script>

<style scoped>
.debug-page {
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.debug-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.debug-section {
  margin: 30px 0;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.debug-section h2 {
  color: #333;
  margin-bottom: 15px;
}

.nav-buttons, .flow-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.nav-btn, .flow-btn {
  padding: 10px 15px;
  border: 1px solid #07c160;
  background: white;
  color: #07c160;
  border-radius: 5px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-btn:hover, .flow-btn:hover {
  background: #07c160;
  color: white;
}

.device-info p {
  margin: 8px 0;
  font-size: 0.9em;
  color: #555;
}
</style>