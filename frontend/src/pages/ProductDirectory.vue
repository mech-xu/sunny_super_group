<template>
  <div class="product-directory">
    <iPhoneFrame>
      <SimpleHeader title="商品目录">
        <template #right>
          <button @click="goToCart" class="cart-btn">🛒</button>
        </template>
      </SimpleHeader>

      <main class="main-content">
        <!-- 搜索和筛选 -->
        <div class="search-section">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索商品..." 
            class="search-input"
          />
        </div>

        <!-- 商品分类 -->
        <div class="categories-section">
          <h3>商品分类</h3>
          <div class="categories-grid">
            <div 
              v-for="category in categories" 
              :key="category.id"
              class="category-card"
              @click="filterByCategory(category.id)"
            >
              <div class="category-icon">{{ category.icon }}</div>
              <div class="category-name">{{ category.name }}</div>
            </div>
          </div>
        </div>

        <!-- 商品列表 -->
        <div class="products-section">
          <h3>所有商品</h3>
          <div v-if="filteredProducts.length === 0" class="no-products">
            暂无商品
          </div>
          <div v-else class="products-grid">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id"
              class="product-card"
              @click="viewProductDetail(product)"
            >
              <img :src="product.image || 'https://placehold.co/200x200?text=No+Image'" alt="商品图片" class="product-image" />
              <div class="product-info">
                <h4>{{ product.name }}</h4>
                <p class="product-price">CAD${{ product.price.toFixed(2) }}</p>
                <button @click.stop="addToCart(product)" class="add-to-cart-btn">加入购物车</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SimpleFooter :activeTab="currentActiveTab" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import SimpleHeader from '../components/SimpleHeader.vue';
import SimpleFooter from '../components/SimpleFooter.vue';
import { api } from '../api.js';

const router = useRouter();
const products = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const selectedCategory = ref(null);
const currentActiveTab = ref('goods');

// 加载商品和分类数据
onMounted(async () => {
  try {
    // 获取商品数据
    const productData = await api.getProducts();
    products.value = (productData || []).map(p => ({
      ...p,
      price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
      image: p.image || 'https://placehold.co/200x200?text=No+Image'
    }));
    
    // 获取分类数据（从商品中提取唯一分类）
    const uniqueCategories = [...new Set(products.value.map(p => p.category).filter(Boolean))];
    categories.value = uniqueCategories.map((cat, index) => ({
      id: index + 1,
      name: cat,
      icon: getIconForCategory(cat)
    }));
    
  } catch (error) {
    console.error('加载商品数据失败:', error);
    products.value = [];
    categories.value = [];
  }
});

// 根据分类获取图标
const getIconForCategory = (category) => {
  const iconMap = {
    '水果': '🍎',
    '蔬菜': '🥦',
    '肉类': '🥩',
    '海鲜': '🐟',
    '乳制品': '🥛',
    '烘焙': '🍞',
    '饮料': '🥤',
    '零食': '🍿'
  };
  return iconMap[category] || '📦';
};

// 过滤商品
const filteredProducts = computed(() => {
  let filtered = products.value;
  
  // 按搜索关键词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(query) ||
      (product.category && product.category.toLowerCase().includes(query))
    );
  }
  
  // 按分类过滤
  if (selectedCategory.value) {
    filtered = filtered.filter(product => product.category === selectedCategory.value);
  }
  
  return filtered;
});

// 按分类筛选
const filterByCategory = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId);
  if (category) {
    selectedCategory.value = category.name;
  } else {
    selectedCategory.value = null;
  }
};

// 添加到购物车
const addToCart = (product) => {
  try {
    // 从localStorage获取现有购物车
    const storedCart = localStorage.getItem('cart');
    const cart = storedCart ? JSON.parse(storedCart) : {};
    
    // 更新商品数量
    if (cart[product.id]) {
      cart[product.id] += 1;
    } else {
      cart[product.id] = 1;
    }
    
    // 保存回localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    alert(`${product.name} 已添加到购物车`);
  } catch (error) {
    console.error('添加到购物车失败:', error);
    alert('添加失败，请重试');
  }
};

// 查看商品详情
const viewProductDetail = (product) => {
  router.push(`/goods/${product.id}`);
};

// 跳转到购物车
const goToCart = () => {
  router.push('/cart');
};

// 底部标签切换
const handleTabChange = (tabName) => {
  currentActiveTab.value = tabName;
  if (tabName === 'home') {
    router.push('/');
  } else if (tabName === 'goods') {
    router.push('/products'); // Assuming /products is the route for this page
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
  flex: 1;
  overflow-y: auto;
}

/* 搜索区域 */
.search-section {
  padding: 0 16px 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
}

/* 分类区域 */
.categories-section {
  padding: 0 16px 16px;
}

.categories-section h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 12px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-card:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.category-icon {
  font-size: 24px;
  margin-bottom: 6px;
}

.category-name {
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* 商品区域 */
.products-section {
  padding: 0 16px;
}

.products-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.no-products {
  text-align: center;
  padding: 32px 0;
  color: #999;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.product-info {
  padding: 12px;
}

.product-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  color: #e74c3c;
  font-weight: bold;
  margin-bottom: 8px;
}

.add-to-cart-btn {
  width: 100%;
  padding: 8px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.add-to-cart-btn:hover {
  background: #06a852;
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