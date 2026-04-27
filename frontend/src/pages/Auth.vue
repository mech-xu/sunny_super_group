<template>
  <div class="auth-container">
    <div class="iphone-frame">
      <!-- Home Indicator -->
      <div class="notch"></div>
      
      <div class="page-content">
        <div class="auth-form">
          <form @submit.prevent="handlePhoneSubmit" class="form-container">
            <div class="form-group">
              <label for="phone">手机号</label>
              <div class="phone-input">
                <span class="country-code">+1</span>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="phone" 
                  placeholder="请输入加拿大或美国手机号"
                  required
                  maxlength="10"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              class="submit-btn"
              :disabled="phone.length !== 10"
            >
              下一步
            </button>
          </form>
        </div>
      </div>
      
      <!-- Home Indicator -->
      <div class="home-indicator"></div>
    </div>
  </div>
</template>

<script>
import { api, apiClient } from '../api.js';

export default {
  name: 'AuthPage',
  data() {
    return {
      phone: ''
    }
  },
  methods: {
    async handlePhoneSubmit() {
      if (this.phone.length !== 10) return;

      try {
        // 首先尝试调用后端API检查用户是否存在
        const userExists = await api.checkUserExists('+1' + this.phone);
        
        if (userExists) {
          // 如果用户已存在，直接登录并跳转到首页
          const encodedPhone = encodeURIComponent('+1' + this.phone);
          const userData = (await apiClient.get(`/users?phone=eq.${encodedPhone}`)).data[0];
          localStorage.setItem('currentUser', JSON.stringify(userData));
          this.$router.push("/index");
        } else {
          // 如果用户不存在，跳转到注册页面
          this.$router.push({
            path: "/register",
            query: { phone: this.phone }
          });
        }
      } catch (error) {
        console.error('检查用户时发生错误:', error);
        // API调用失败时，降级到使用localStorage
        this.handlePhoneSubmitWithLocalStorage();
      }
    },
    
    // 降级处理：使用localStorage管理用户数据
    handlePhoneSubmitWithLocalStorage() {
      const phoneWithCountryCode = '+1' + this.phone;
      
      console.log('登录检查 - 输入手机号:', this.phone);
      console.log('登录检查 - 完整手机号:', phoneWithCountryCode);
      
      // 由于没有后端API，我们只能模拟用户存在性检查
      // 在实际项目中，这应该由后端API处理
      
      // 跳转到注册页面
      this.$router.push({
        path: "/register",
        query: { phone: this.phone }
      });
    },
  },
  mounted() {
    // 移除自动跳转逻辑，让用户始终能看到登录页面
    // 即使有currentUser，也允许用户重新登录或切换账号
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.iphone-frame {
  position: relative;
  width: 390px;
  height: 844px;
  background: #fff;
  border-radius: 40px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  overflow: hidden;
  padding: 40px 20px 80px;
  box-sizing: border-box;
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
  display: flex;
  flex-direction: column;
  padding-top: 40px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  color: #333;
  margin: 0 0 10px;
}

.page-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.auth-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.phone-input {
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
}

.country-code {
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  margin-right: 8px;
  padding-right: 8px;
  border-right: 2px solid #e0e0e0;
}

.phone-input input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  color: #333;
  background: transparent;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.home-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 134px;
  height: 5px;
  background: #000;
  border-radius: 100px;
  z-index: 10;
}
</style>