<template>
  <div class="home-page">
    <iPhoneFrame>
      <!-- 顶部导航栏 -->
      <SimpleHeader title="SunnyOrder" :showBack="false">
        <template #right>
          <button @click="goToCart" class="cart-btn">🛒</button>
        </template>
      </SimpleHeader>

      <main class="main-content">
        <!-- 商家入口 -->
        <div class="merchants-section">
          <h2>合作商家</h2>
          <div class="merchants-grid">
            <template v-if="merchants && merchants.length > 0">
              <div 
                v-for="merchant in merchants" 
                :key="merchant.id"
                class="merchant-card"
                @click="goToMerchantProducts(merchant.id)"
              >
                <div class="merchant-icon">🏪</div>
                <div class="merchant-info">
                  <h3>{{ merchant.shop_name }}</h3>
                  <p class="merchant-category">{{ merchant.category }}</p>
                  <p class="merchant-address">{{ merchant.address }}</p>
                </div>
              </div>
            </template>
            <div v-else class="empty-state">
              <p>暂无合作商家</p>
            </div>
          </div>
        </div>
      </main>

      <SimpleFooter :activeTab="currentActiveTab" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import SimpleHeader from '../components/SimpleHeader.vue';
import SimpleFooter from '../components/SimpleFooter.vue';
import { api } from '../api.js';
import { getStorageKey, getRoutePath } from '../config/constants.js';

const router = useRouter();
const merchants = ref([]);
const currentUser = ref(null);
const currentActiveTab = ref('home');

onMounted(async () => {
  try {
    // 获取当前用户
    const storedUser = localStorage.getItem(getStorageKey('CURRENT_USER'));
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try {
        currentUser.value = JSON.parse(storedUser);
      } catch (parseError) {
        console.error('解析用户数据失败:', parseError);
        currentUser.value = null;
        localStorage.removeItem(getStorageKey('CURRENT_USER'));
      }
    } else {
      currentUser.value = null;
    }
    
    if (!currentUser.value) {
      router.push(getRoutePath('AUTH'));
      return;
    }
    
    // 获取商家列表
    const merchantData = await api.getMerchants();
    merchants.value = merchantData || [];
    
  } catch (error) {
    console.error('Error initializing home page:', error);
    router.push(getRoutePath('AUTH'));
  }
});

// 导航到购物车
const goToCart = () => {
  router.push(getRoutePath('CART'));
};

// 导航到商家商品页面
const goToMerchantProducts = (merchantId) => {
  router.push(`${getRoutePath('GOODS')}?merchantId=${merchantId}`);
};

// 底部标签切换
const handleTabChange = (tabName) => {
  currentActiveTab.value = tabName;
  if (tabName === 'home') {
    // 已在首页
  } else if (tabName === 'goods') {
    router.push(getRoutePath('GOODS'));
  } else if (tabName === 'cart') {
    router.push(getRoutePath('CART'));
  } else if (tabName === 'user') {
    router.push(getRoutePath('USER'));
  }
};
</script>

<style scoped>
.home-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #333;
  cursor: pointer;
  padding: 4px;
}

.cart-icon {
  position: relative;
  font-size: 18px;
  cursor: pointer;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e74c3c;
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.merchants-section h2 {
  margin: 0 0 16px 16px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.merchants-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.merchant-card {
  background: white;
  margin: 0 16px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.merchant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.merchant-icon {
  font-size: 24px;
  margin-right: 12px;
  width: 32px;
  text-align: center;
}

.merchant-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.merchant-category {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #666;
}

.merchant-address {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: #666;
}

/* 购物车按钮 */
.cart-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  position: relative;
  padding: 8px;
}

/* 底部导航已由SimpleFooter组件处理 */

/* iPhone安全区域适配 */
@media (max-width: 375px) {
  .main-content {
    padding: 16px 0;
  }
  
  .merchant-card {
    margin: 0 12px;
    padding: 14px;
  }
}
</style>