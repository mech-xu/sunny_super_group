<template>
  <div class="profile-container">
    <iPhoneFrame>
      <SimpleHeader title="个人资料" :showBack="true" @back="goBack" />
      
      <main class="main-content">
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
        
        <div class="action-buttons">
          <button @click="editProfile" class="edit-btn">编辑资料</button>
          <button @click="changePassword" class="password-btn">修改密码</button>
          <button @click="logout" class="logout-btn">退出登录</button>
        </div>
      </main>

      <SimpleFooter :activeTab="'user'" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import SimpleHeader from '../components/SimpleHeader.vue';
import SimpleFooter from '../components/SimpleFooter.vue';

const router = useRouter();
const currentUser = ref(null);

onMounted(() => {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
    try {
      currentUser.value = JSON.parse(storedUser);
    } catch (error) {
      console.error('解析用户数据失败:', error);
      currentUser.value = null;
    }
  }
  
  if (!currentUser.value) {
    router.push('/auth');
  }
});

const formatPhone = (phone) => {
  if (!phone) return '';
  // 格式化手机号，例如: 138****1234
  if (phone.length >= 7) {
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
  }
  return phone;
};

const editProfile = () => {
  alert('编辑资料功能暂未开放');
};

const changePassword = () => {
  alert('修改密码功能暂未开放');
};

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    router.push('/auth');
  }
};

const goBack = () => {
  router.back();
};

// 底部标签切换
const handleTabChange = (tabName) => {
  if (tabName === 'home') {
    router.push('/');
  } else if (tabName === 'goods') {
    router.push('/goods');
  } else if (tabName === 'cart') {
    router.push('/cart');
  } else if (tabName === 'user') {
    router.push('/user');
  }
};
</script>

<style scoped>
.main-content {
  padding: 16px 0;
}

.user-info-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: white;
  margin: 0 16px 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.user-avatar {
  margin-bottom: 16px;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #999;
}

.user-details {
  width: 100%;
}

.user-field {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.user-field:last-child {
  border-bottom: none;
}

.label {
  font-weight: bold;
  color: #333;
}

.value {
  color: #666;
}

.action-buttons {
  padding: 0 16px;
}

.edit-btn,
.password-btn,
.logout-btn {
  width: 100%;
  padding: 16px;
  margin-bottom: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.edit-btn {
  background: #07c160;
  color: white;
}

.edit-btn:hover {
  background: #06a852;
}

.password-btn {
  background: #17a2b8;
  color: white;
}

.password-btn:hover {
  background: #138496;
}

.logout-btn {
  background: #dc3545;
  color: white;
}

.logout-btn:hover {
  background: #c82333;
}
</style>