<template>
  <div class="admin-login-container">
    <div class="iphone-frame">
      <div class="notch"></div>
      <div class="page-content">
        <header class="page-header">
          <h1>管理后台登录</h1>
          <p>请输入管理员凭据</p>
        </header>
        
        <div class="login-form">
          <form @submit.prevent="handleLogin" class="form-container">
            <div class="form-group">
              <label for="username">用户名</label>
              <input 
                id="username" 
                type="text" 
                v-model="username" 
                placeholder="请输入用户名"
                required 
              />
            </div>
            
            <div class="form-group">
              <label for="password">密码</label>
              <input 
                id="password" 
                type="password" 
                v-model="password" 
                placeholder="请输入密码"
                required 
              />
            </div>
            
            <button 
              type="submit" 
              class="submit-btn" 
              :disabled="!canSubmit"
            >
              登录
            </button>
            
            <div class="error-message" v-if="errorMessage">
              {{ errorMessage }}
            </div>
          </form>
          
          <div class="debug-info">
            <h3>调试凭据说明</h3>
            <ul>
              <li><strong>商家管理员</strong>: 用户名: <code>merchant_admin</code>, 密码: <code>merchant2026</code></li>
              <li><strong>系统管理员</strong>: 用户名: <code>system_admin</code>, 密码: <code>system2026</code></li>
            </ul>
            <p style="margin-top: 10px; font-size: 12px; color: #666;">
              ⚠️ 注意：此登录接口仅用于开发调试，生产环境请使用正式认证流程。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref('');
const password = ref('');
const errorMessage = ref('');

// 验证凭据是否有效
const canSubmit = computed(() => {
  return username.value.trim() !== '' && password.value.trim() !== '';
});

// 管理员凭据配置（临时调试用）
const adminCredentials = {
  merchant_admin: {
    password: 'merchant2026',
    role: 'merchant',
    nickname: '阳光后台',
    phone: '+14161234567'
  },
  system_admin: {
    password: 'system2026',
    role: 'super_admin',
    nickname: '系统管理员',
    phone: '+14169999999'
  }
};

const handleLogin = () => {
  console.log('管理员登录开始 - 用户名:', username.value, '密码:', password.value);
  
  const userCredentials = adminCredentials[username.value];
  
  if (!userCredentials) {
    errorMessage.value = '用户名不存在';
    console.log('登录失败 - 用户名不存在');
    return;
  }
  
  if (userCredentials.password !== password.value) {
    errorMessage.value = '密码错误';
    console.log('登录失败 - 密码错误');
    return;
  }
  
  // 创建管理员用户对象
  const adminUser = {
    id: 'admin_' + Date.now(),
    username: username.value,
    nickname: userCredentials.nickname,
    phone: userCredentials.phone,
    role: userCredentials.role,
    role_new: userCredentials.role,
    created_at: new Date().toISOString()
  };
  
  console.log('创建管理员用户:', adminUser);
  
  // 保存到localStorage
  localStorage.setItem('currentUser', JSON.stringify(adminUser));
  
  console.log('用户数据已保存到localStorage');
  
  // 根据角色跳转到相应页面
  if (userCredentials.role === 'merchant') {
    console.log('跳转到商户管理页面');
    router.push('/merchant-dashboard');
  } else if (userCredentials.role === 'super_admin') {
    console.log('跳转到商户管理页面 (系统管理员)');
    router.push('/merchant-dashboard'); // 系统管理员也使用商户管理页面
  }
  
  errorMessage.value = '';
  console.log('登录流程完成');
};
</script>

<style scoped>
.admin-login-container {
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
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0 0 8px 0;
}

.page-header p {
  color: #666;
  margin: 0;
}

.login-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  color: #333;
  font-weight: 500;
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #07c160;
}

.submit-btn {
  padding: 14px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background: #06a852;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
}

.debug-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
}

.debug-info h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
}

.debug-info ul {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #666;
}

.debug-info code {
  background: #e9ecef;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}
</style>