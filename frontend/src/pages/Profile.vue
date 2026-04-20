<template>
  <div class="profile-container">
    <div class="iphone-frame">
      <div class="notch"></div>
      
      <div class="page-content">
        <header class="page-header">
          <button @click="goBack" class="back-btn">←</button>
          <h1>我的</h1>
        </header>
        
        <div class="user-info-section">
          <div class="user-avatar">
            <div class="avatar-placeholder">👤</div>
          </div>
          <div class="user-details">
            <div class="user-field">
              <span class="label">昵称</span>
              <span class="value">{{ currentUser?.nickname || '未设置' }}</span>
            </div>
            <div class="user-field">
              <span class="label">手机号</span>
              <span class="value">{{ formatPhone(currentUser?.phone) || '未设置' }}</span>
            </div>
            <div class="user-field">
              <span class="label">账户状态</span>
              <span class="value">{{ currentUser?.role_new || '普通用户' }}</span>
            </div>
          </div>
        </div>
        
        <div class="menu-section">
          <div class="menu-item" @click="viewMyOrders">
            <span>我的订单</span>
            <span>→</span>
          </div>
          <div class="menu-item" @click="logout">
            <span>退出登录</span>
            <span>→</span>
          </div>
        </div>
      </div>
      
      <div class="home-indicator"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfilePage',
  data() {
    return {
      currentUser: null
    }
  },
  created() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    } else {
      this.$router.push('/');
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    formatPhone(phone) {
      if (!phone) return '';
      // 提取手机号部分（去掉+1前缀）
      const digits = phone.replace(/\D/g, '');
      if (digits.length >= 10) {
        const last10 = digits.slice(-10);
        return `+1 (${last10.slice(0, 3)}) ${last10.slice(3, 6)}-${last10.slice(6)}`;
      }
      return phone;
    },
    viewMyOrders() {
      this.$router.push('/my-orders');
    },
    logout() {
      localStorage.removeItem('currentUser');
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.iphone-frame {
  width: 100%;
  max-width: 480px;
  height: 100vh;
  background: white;
  border-radius: 40px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.notch {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 20px;
  background: black;
  border-radius: 0 0 20px 20px;
  z-index: 10;
}

.page-content {
  padding-top: 40px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
  background: white;
  position: sticky;
  top: 0;
  z-index: 5;
}

.page-header h1 {
  flex: 1;
  text-align: center;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.back-btn {
  background: none;
  border: none;
  font-size: 18px;
  padding: 5px 10px;
  cursor: pointer;
}

.user-info-section {
  padding: 20px;
  text-align: center;
}

.user-avatar {
  margin-bottom: 20px;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.user-details {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 30px;
}

.user-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.user-field:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #333;
}

.value {
  color: #666;
}

.menu-section {
  background: white;
  border-radius: 10px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.home-indicator {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 130px;
  height: 5px;
  background: black;
  border-radius: 5px;
}
</style>