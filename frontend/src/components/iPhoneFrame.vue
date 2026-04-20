<template>
  <div class="iphone-14-container">
    <div class="iphone-frame">
      <div class="notch"></div>
      
      <div class="page-content">
        <!-- 插槽用于放置页面内容 -->
        <slot></slot>
      </div>
      
      <div class="home-indicator"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'iPhoneFrame'
}
</script>

<style scoped>
.iphone-14-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-sizing: border-box;
}

.iphone-frame {
  position: relative;
  width: 390px;
  height: 844px;
  background: #ffffff;
  border-radius: 40px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  padding: 40px 20px 80px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 30px;
  background: #000;
  border-radius: 0 0 20px 20px;
  z-index: 10;
}

.page-content {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.home-indicator {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 134px;
  height: 5px;
  background: #000;
  border-radius: 100px;
}
</style>