<template>
  <div class="auth-container">
    <div class="iphone-frame">
      <div class="notch"></div>
      <div class="page-content">
        <header class="page-header">
          <h1>验证身份</h1>
          <p>请输入您的团购群微信昵称</p>
        </header>
        <div class="auth-form">
          <form @submit.prevent="handleSubmit" class="form-container">
            <div class="form-group">
              <label>手机号</label>
              <div class="phone-display">+1 {{ phone }}</div>
            </div>
            <div class="form-group">
              <label for="name">团购群微信昵称</label>
              <input id="name" type="text" v-model="name" placeholder="请输入团购群微信昵称" required />
            </div>
            <button type="submit" class="submit-btn" :disabled="!canSubmit">提交</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api, apiClient } from '../api.js'

export default {
  name: 'RegisterPage',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const phone = ref(route.query.phone || '')
    const name = ref('')

    const canSubmit = computed(() => {
      return phone.value.trim().length === 10 && name.value.trim()
    })

    const handleSubmit = async () => {
      const phoneNumber = phone.value.trim()
      const userName = name.value.trim()

      if (phoneNumber.length !== 10 || !userName) return

      try {
        // 创建新用户并保存到数据库
        const newUser = {
          phone: '+1' + phoneNumber,
          nickname: userName,
          role: 'customer',
          role_new: 'customer',
          username: `user_${phoneNumber}`
        }

        // 首先尝试调用后端API
        const response = await apiClient.post('/users', newUser, {
          headers: {
            'Prefer': 'return=representation'
          }
        });

        if (response.status === 201) {
          const userData = response.data;
          // 将用户信息保存到localStorage作为当前用户
          localStorage.setItem('currentUser', JSON.stringify(Array.isArray(userData) ? userData[0] : userData))
          
          // 注册成功后跳转到首页
          router.push('/index')
        } else {
          console.error('注册失败:', response.status)
          alert('注册失败，请重试')
        }
      } catch (error) {
        console.error('注册过程中出现错误:', error);
        // API调用失败时，降级到使用localStorage
        handleRegistrationWithLocalStorage(phoneNumber, userName, router);
      }
    }
    
    // 降级处理：使用localStorage存储用户数据
    const handleRegistrationWithLocalStorage = (phoneNumber, userName, router) => {
      // 检查是否为特殊商家管理员用户
      const isMerchantAdmin = phoneNumber === '4161234567' && userName === '阳光后台';
      
      console.log('注册检查 - 手机号:', phoneNumber);
      console.log('注册检查 - 昵称:', userName);
      console.log('注册检查 - 是否为商家管理员:', isMerchantAdmin);
      
      const newUser = {
        id: 'user_' + Date.now(),
        phone: '+1' + phoneNumber,
        nickname: userName,
        role: isMerchantAdmin ? 'merchant' : 'customer',
        role_new: isMerchantAdmin ? 'merchant' : 'customer',
        username: `user_${phoneNumber}`
      };
      
      console.log('创建新用户:', newUser);
      
      // 保存当前用户
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      // 根据用户角色跳转到不同页面
      if (isMerchantAdmin) {
        console.log('跳转到商户管理页面');
        router.push('/merchant-dashboard');
      } else {
        console.log('跳转到首页');
        router.push('/index');
      }
    }

    return { phone, name, handleSubmit, canSubmit }
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

.phone-display {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: #f8f9fa;
  font-size: 16px;
  color: #333;
}

input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  outline: none;
  font-size: 16px;
  color: #333;
  background: #fff;
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
</style>