<template>
  <div class="user-profile">
    <iPhoneFrame>
      <SimpleHeader title="我的" :showBack="false">
        <template #right>
          <button @click="goToCart" class="cart-btn">🛒</button>
        </template>
      </SimpleHeader>

      <main class="main-content">
        <!-- 用户信息卡片 -->
        <div class="user-card" v-if="currentUser">
          <div class="user-avatar">
            <img :src="currentUser.avatar || 'https://placehold.co/80x80?text=👤'" alt="头像" />
          </div>
          <div class="user-info">
            <h2>{{ currentUser.nickname || '用户' }}</h2>
            <p>{{ currentUser.phone || '未设置手机号' }}</p>
            <p v-if="currentUser.role">角色: {{ getRoleText(currentUser.role) }}</p>
          </div>
        </div>

        <!-- 功能菜单 -->
        <div class="menu-section">
          <div class="menu-item" @click="goToMyOrders">
            <div class="menu-icon">📋</div>
            <div class="menu-text">我的订单</div>
            <div class="menu-arrow">→</div>
          </div>
          
          <div class="menu-item" @click="goToProfile">
            <div class="menu-icon">👤</div>
            <div class="menu-text">个人资料</div>
            <div class="menu-arrow">→</div>
          </div>
          
          <div class="menu-item" @click="goToSettings">
            <div class="menu-icon">⚙️</div>
            <div class="menu-text">设置</div>
            <div class="menu-arrow">→</div>
          </div>
          
          <div class="menu-item" @click="logout">
            <div class="menu-icon">🚪</div>
            <div class="menu-text">退出登录</div>
            <div class="menu-arrow">→</div>
          </div>
        </div>
      </main>

      <SimpleFooter :activeTab="'user'" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import iPhoneFrame from '../../components/iPhoneFrame.vue';
import SimpleHeader from '../../components/SimpleHeader.vue';
import SimpleFooter from '../../components/SimpleFooter.vue';

const router = useRouter();
const currentUser = ref(null);
const currentActiveTab = ref('user');

onMounted(() => {
  // 获取当前用户信息
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

// 获取角色文本
const getRoleText = (role) => {
  const roleMap = {
    'customer': '普通用户',
    'merchant': '商家管理员',
    'super_admin': '系统管理员'
  };
  return roleMap[role] || role;
};

// 导航方法
const goToMyOrders = () => {
  router.push('/my-orders');
};

const goToProfile = () => {
  router.push('/profile');
};

const goToSettings = () => {
  alert('设置页面暂未开放');
};

const goToCart = () => {
  router.push('/cart');
};

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    // 清空所有本地存储
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    
    // 跳转到登录页面
    router.push('/auth');
  }
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

/* 用户卡片 */
.user-card {
  display: flex;
  align-items: center;
  padding: 24px 16px;
  background: white;
  margin: 0 16px 16px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.user-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 16px;
}

.user-info h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.user-info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

/* 菜单区域 */
.menu-section {
  background: white;
  margin: 0 16px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-icon {
  font-size: 20px;
  margin-right: 16px;
  width: 24px;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.menu-arrow {
  color: #999;
  font-size: 18px;
}

.cart-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  position: relative;
  padding: 8px;
}
</style>