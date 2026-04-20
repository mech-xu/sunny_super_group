<template>
  <header class="wechat-header">
    <div class="header-content">
      <div class="left-section">
        <slot name="left"></slot>
      </div>
      <div class="center-section">
        <slot name="center">{{ title }}</slot>
      </div>
      <div class="right-section">
        <slot name="right"></slot>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'WeChatHeader',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.wechat-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 46px;
  background: #fff;
  z-index: 100;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.left-section, .right-section {
  width: 60px;
  display: flex;
  align-items: center;
}

.center-section {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  color: #000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.left-section button,
.right-section button {
  background: none;
  border: none;
  font-size: 16px;
  color: #07c160;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.left-section button:hover,
.right-section button:hover {
  background: #f5f5f5;
}
</style>