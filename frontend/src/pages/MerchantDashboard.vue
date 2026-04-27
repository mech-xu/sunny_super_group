<template>
  <div class="merchant-dashboard">
    <iPhoneFrame>
      <SimpleHeader :title="pageTitle">
        <template #left>
          <button @click="goBack" class="back-btn">←</button>
        </template>
        <template #right>
          <button @click="goHome" class="home-btn">🏠</button>
        </template>
      </SimpleHeader>

      <main class="main-content">
        <div class="dashboard-title">
          <h2>{{ pageTitle }}中心</h2>
          <p v-if="welcomeMessage">{{ welcomeMessage }}</p>
        </div>

        <!-- 快捷操作 -->
        <div class="quick-actions">
          <div class="action-card" @click="goToProductManagement">
            <div class="action-icon">📦</div>
            <div class="action-text">商品管理</div>
          </div>
          <div class="action-card" @click="viewPendingOrders">
            <div class="action-icon">📋</div>
            <div class="action-text">订单管理</div>
          </div>
          <div class="action-card" @click="goToVerification">
            <div class="action-icon">🔍</div>
            <div class="action-text">订单核销</div>
          </div>
          <div class="action-card" @click="viewStatistics">
            <div class="action-icon">📊</div>
            <div class="action-text">数据统计</div>
          </div>
        </div>

        <!-- 商品管理区域 -->
        <div v-if="showProductManagement" class="product-management-section">
          <div class="section-header">
            <h3>已上架商品</h3>
            <button @click="addNewProduct" class="add-product-btn">+ 新增商品</button>
          </div>
          
          <div v-if="merchantProducts.length === 0" class="no-products">
            暂无商品，点击"+ 新增商品"开始上架商品
          </div>
          
          <div v-else class="products-list">
            <div 
              v-for="product in merchantProducts" 
              :key="product.id"
              class="product-card"
              @click="editProduct(product)"
            >
              <div class="product-image">
                <img :src="product.image || 'https://placehold.co/100x100?text=No+Image'" alt="商品图片" />
              </div>
              <div class="product-info">
                <h4>{{ product.name }}</h4>
                <p class="product-price">CAD ${{ parseFloat(product.price).toFixed(2) }}</p>
                <span 
                  class="product-status" 
                  :class="{ active: product.status, inactive: !product.status }"
                >
                  {{ product.status ? '在售' : '已下架' }}
                </span>
              </div>
              <div class="product-actions">
                <button @click.stop="toggleProductStatus(product)" class="status-btn">
                  {{ product.status ? '下架' : '上架' }}
                </button>
                <button @click.stop="deleteProduct(product)" class="delete-btn">删除</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 订单管理区域 -->
        <div v-else-if="showOrderManagement" class="order-management-section">
          <div class="section-header">
            <h3>订单管理</h3>
            <select v-model="selectedOrderFilter" class="filter-select">
              <option v-for="filter in orderFilters" :key="filter.value" :value="filter.value">
                {{ filter.label }}
              </option>
            </select>
          </div>
          
          <div v-if="filteredOrders.length === 0" class="no-orders">
            暂无{{ selectedOrderFilterLabel }}订单
          </div>
          
          <div v-else class="orders-list">
            <div 
              v-for="order in filteredOrders" 
              :key="order.id"
              class="order-card"
              @click="viewOrderDetails(order)"
            >
              <div class="order-header">
                <span class="order-no">订单: {{ order.order_no }}</span>
                <span class="pickup-code">取货码: {{ order.pickup_code }}</span>
                <span class="order-status" :class="order.status.toLowerCase()">{{ getOrderStatusText(order.status) }}</span>
              </div>
              <div class="order-customer">
                <span>{{ order.customer_nickname }}</span>
                <span>{{ formatPhone(order.phone) }}</span>
              </div>
              <div class="order-amount">
                CAD ${{ order.total_price }}
              </div>
              <div class="order-time">
                {{ formatDate(order.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 默认统计视图 -->
        <div v-else>
          <!-- 订单统计 -->
          <div v-if="orderStats" class="stats-section">
            <h3>今日订单统计</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ orderStats.total_orders }}</div>
                <div class="stat-label">总订单</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ orderStats.pending_orders }}</div>
                <div class="stat-label">待取货</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ orderStats.verified_orders }}</div>
                <div class="stat-label">已取货</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">CAD ${{ orderStats.total_revenue.toFixed(2) }}</div>
                <div class="stat-label">总收入</div>
              </div>
            </div>
          </div>

          <!-- 待处理订单列表 -->
          <div v-if="pendingOrders.length > 0" class="orders-section">
            <h3>待取货订单</h3>
            <div class="orders-list">
              <div 
                v-for="order in pendingOrders" 
                :key="order.id"
                class="order-card"
                @click="viewOrderDetails(order)"
              >
                <div class="order-header">
                  <span class="order-no">订单: {{ order.order_no }}</span>
                  <span class="pickup-code">取货码: {{ order.pickup_code }}</span>
                </div>
                <div class="order-customer">
                  <span>{{ order.customer_nickname }}</span>
                  <span>{{ formatPhone(order.phone) }}</span>
                </div>
                <div class="order-amount">
                  CAD ${{ order.total_price }}
                </div>
                <div class="order-time">
                  {{ formatDate(order.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 商品上架模态框 -->
        <div v-if="showAddProductModal || showEditProductModal" class="modal-overlay" @click="closeModals">
          <div class="product-modal" @click.stop>
            <div class="modal-header">
              <h3>{{ showEditProductModal ? '编辑商品' : '新增商品' }}</h3>
              <button @click="closeModals" class="close-btn">×</button>
            </div>
            
            <div class="modal-body">
              <form @submit.prevent="saveProduct" class="product-form">
                <!-- 商品名称 -->
                <div class="form-group">
                  <label>商品名称 *</label>
                  <input 
                    type="text" 
                    v-model="productForm.name"
                    placeholder="请输入商品名称"
                    maxlength="100"
                  />
                  <div v-if="formErrors.name" class="error-message">{{ formErrors.name }}</div>
                </div>
                
                <!-- 商品价格 -->
                <div class="form-group">
                  <label>价格 (CAD $) *</label>
                  <input 
                    type="number" 
                    v-model="productForm.price"
                    placeholder="请输入价格"
                    min="0.01"
                    step="0.01"
                  />
                  <div v-if="formErrors.price" class="error-message">{{ formErrors.price }}</div>
                </div>
                
                <!-- 商品状态 -->
                <div class="form-group">
                  <label>商品状态</label>
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      v-model="productForm.status"
                      true-value="true"
                      false-value="false"
                    />
                    <span class="slider"></span>
                  </label>
                  <span class="status-text">{{ productForm.status ? '在售' : '已下架' }}</span>
                </div>
                
                <!-- 排序权重 -->
                <div class="form-group">
                  <label>排序权重 (数字越小越靠前)</label>
                  <input 
                    type="number" 
                    v-model="productForm.sort"
                    placeholder="请输入排序数字"
                    min="0"
                  />
                </div>
                
                <!-- 提交按钮 -->
                <button type="submit" class="submit-btn">
                  {{ showEditProductModal ? '更新商品' : '保存商品' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <SimpleFooter :activeTab="currentActiveTab" @tab-change="handleTabChange" />
    </iPhoneFrame>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import iPhoneFrame from '../components/iPhoneFrame.vue';
import SimpleHeader from '../components/SimpleHeader.vue';
import SimpleFooter from '../components/SimpleFooter.vue';
import { api } from '../api.js';

const router = useRouter();
const currentUser = ref(null); // 添加当前用户信息
const currentMerchant = ref(null);
const orderStats = ref(null);
const pendingOrders = ref([]);
const currentActiveTab = ref('home');

// 商品管理相关
const showProductManagement = ref(false);
const showOrderManagement = ref(false);
const merchantProducts = ref([]);
const localProducts = ref([]); // 替换 localStorage 存储为响应式引用

// 商品表单状态管理
const showAddProductModal = ref(false); // 显示添加商品模态框
const showEditProductModal = ref(false); // 显示编辑商品模态框

// 商品表单数据
const productForm = ref({
  id: null,
  name: '',
  price: '',
  status: true,
  sort: 0
});

// 表单验证错误
const formErrors = ref({});

// 订单管理相关
const allOrders = ref([]);
const selectedOrderFilter = ref('all');
const orderFilters = ref([
  { value: 'all', label: '全部订单' },
  { value: 'PENDING', label: '待取货' },
  { value: 'VERIFIED', label: '已取货' },
  { value: 'CANCELLED', label: '已取消' }
]);

// 计算属性：判断是否为超级管理员
const isSuperAdmin = computed(() => {
  return currentUser.value && currentUser.value.role === 'super_admin';
});

// 计算属性：判断是否为商家管理员
const isMerchantAdmin = computed(() => {
  return currentUser.value && currentUser.value.role === 'merchant';
});

// 计算属性：获取页面标题
const pageTitle = computed(() => {
  return isSuperAdmin.value ? '系统管理' : '商家管理';
});

// 计算属性：获取欢迎信息
const welcomeMessage = computed(() => {
  if (isSuperAdmin.value) {
    return `系统管理员 ${currentUser.value.nickname}`;
  } else if (isMerchantAdmin.value && currentMerchant.value) {
    return `${currentMerchant.value.shop_name} - 商家管理`;
  }
  return '';
});

// 计算属性：获取选中的订单过滤器标签
const selectedOrderFilterLabel = computed(() => {
  const filter = orderFilters.value.find(f => f.value === selectedOrderFilter.value);
  return filter ? filter.label.replace('订单', '') : '全部';
});

// 计算属性：过滤后的订单
const filteredOrders = computed(() => {
  if (selectedOrderFilter.value === 'all') {
    return allOrders.value;
  }
  return allOrders.value.filter(order => order.status === selectedOrderFilter.value);
});

// 初始化页面
onMounted(async () => {
  try {
    // 获取当前用户
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      currentUser.value = JSON.parse(storedUser);
    }
    
    if (!currentUser.value) {
      router.push('/auth');
      return;
    }
    
    // 加载商家信息（如果是商家管理员）
    if (isMerchantAdmin.value) {
      await loadCurrentMerchant();
    }
    
    // 加载统计数据
    await loadOrderStats();
    
    // 加载待处理订单
    await loadPendingOrders();
    
  } catch (error) {
    console.error('初始化商家管理页面失败:', error);
    alert('加载失败，请重试');
  }
});

// 加载当前商家信息
const loadCurrentMerchant = async () => {
  try {
    const merchants = await api.getMerchants();
    if (merchants && merchants.length > 0) {
      // 找到与当前用户关联的商家
      const userMerchant = merchants.find(m => m.user_id === currentUser.value.id);
      if (userMerchant) {
        currentMerchant.value = userMerchant;
      } else if (merchants.length > 0) {
        // 如果没有找到关联商家，使用第一个商家作为默认
        currentMerchant.value = merchants[0];
      }
    }
  } catch (error) {
    console.error('加载商家信息失败:', error);
  }
};

// 加载订单统计数据
const loadOrderStats = async () => {
  try {
    const stats = await api.getOrderStats();
    orderStats.value = stats;
  } catch (error) {
    console.error('加载订单统计失败:', error);
    orderStats.value = null;
  }
};

// 加载待处理订单
const loadPendingOrders = async () => {
  try {
    const orders = await api.getOrders();
    // 过滤待取货订单并添加客户信息
    pendingOrders.value = orders.filter(order => order.status === 'PENDING')
      .map(order => ({
        ...order,
        customer_nickname: order.customer_nickname || '未知用户',
        phone: order.phone || '未知号码'
      }));
  } catch (error) {
    console.error('加载待处理订单失败:', error);
    pendingOrders.value = [];
  }
};

// 加载所有订单
const loadAllOrders = async (merchantId) => {
  try {
    const orders = await api.getOrders();
    // 过滤当前商家的订单并添加客户信息
    allOrders.value = orders.filter(order => order.merchant_id === merchantId)
      .map(order => ({
        ...order,
        customer_nickname: order.customer_nickname || '未知用户',
        phone: order.phone || '未知号码'
      }));
  } catch (error) {
    console.error('加载所有订单失败:', error);
    allOrders.value = [];
  }
};

// 格式化手机号（复用现有的formatPhone函数逻辑）
const formatPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    const areaCode = last10.slice(0, 3);
    return `(${areaCode}) ${last10.slice(3, 6)}-${last10.slice(6)}`;
  }
  return phone;
};

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    'PENDING': '待取货',
    'VERIFIED': '已取货',
    'CANCELLED': '已取消'
  };
  return statusMap[status] || status;
};

// 导航方法
const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/products');
};

const handleTabChange = (tabName) => {
  currentActiveTab.value = tabName;
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

// 商品管理导航
const goToProductManagement = async () => {
  showProductManagement.value = true;
  showOrderManagement.value = false;
  
  try {
    await loadMerchantProducts();
  } catch (error) {
    console.error('加载商品列表失败:', error);
    alert('加载商品失败，请重试');
  }
};

// 订单管理导航
const viewPendingOrders = async () => {
  showProductManagement.value = false;
  showOrderManagement.value = true;
  
  try {
    if (currentMerchant.value) {
      await loadAllOrders(currentMerchant.value.id);
    } else {
      // 如果没有当前商家，加载所有订单（超级管理员）
      const orders = await api.getOrders();
      allOrders.value = orders.map(order => ({
        ...order,
        customer_nickname: order.customer_nickname || '未知用户',
        phone: order.phone || '未知号码'
      }));
    }
  } catch (error) {
    console.error('加载订单列表失败:', error);
    alert('加载订单失败，请重试');
  }
};

// 统计视图导航
const viewStatistics = () => {
  showProductManagement.value = false;
  showOrderManagement.value = false;
};

// 订单核销导航
const goToVerification = () => {
  router.push('/order-verification');
};

// 加载商家商品
const loadMerchantProducts = async () => {
  try {
    let serverProducts = [];
    let localProductsList = [];
    
    // 获取服务器商品
    if (currentMerchant.value) {
      const products = await api.getProductsByMerchant(currentMerchant.value.id);
      serverProducts = products || [];
    }
    
    // 合并本地和服务器商品
    merchantProducts.value = [
      ...localProducts.value.map(p => ({ ...p, is_local: true })),
      ...serverProducts.map(p => ({ ...p, is_local: false }))
    ].sort((a, b) => (a.sort || 0) - (b.sort || 0));
    
  } catch (error) {
    console.error('加载商品失败:', error);
    merchantProducts.value = [];
  }
};

// 添加新商品
const addNewProduct = () => {
  resetProductForm();
  showAddProductModal.value = true;
};

// 编辑商品
const editProduct = (product) => {
  productForm.value = {
    id: product.id,
    name: product.name,
    price: product.price,
    status: product.status !== false,
    sort: product.sort || 0
  };
  showEditProductModal.value = true;
};

// 保存商品
const saveProduct = async () => {
  // 验证表单
  const errors = {};
  if (!productForm.value.name?.trim()) {
    errors.name = '商品名称不能为空';
  }
  if (!productForm.value.price || isNaN(parseFloat(productForm.value.price)) || parseFloat(productForm.value.price) <= 0) {
    errors.price = '请输入有效的价格';
  }
  
  if (Object.keys(errors).length > 0) {
    formErrors.value = errors;
    return;
  }
  
  try {
    const productData = {
      id: productForm.value.id,
      name: productForm.value.name.trim(),
      price: parseFloat(productForm.value.price),
      status: productForm.value.status,
      sort: parseInt(productForm.value.sort) || 0,
      merchant_id: currentMerchant.value?.id
    };
    
    if (productForm.value.id && !productForm.value.is_local) {
      // 更新服务器商品
      await api.updateProduct(productForm.value.id, productData);
      
      // 更新显示列表
      const displayIndex = merchantProducts.value.findIndex(p => p.id === productForm.value.id);
      if (displayIndex !== -1) {
        merchantProducts.value[displayIndex] = productData;
      } else {
         merchantProducts.value.push(productData);
      }
    } else {
      // 创建本地商品
      localProducts.value.push(productData);
      
      // 添加到显示列表
      merchantProducts.value.push(productData);
    }
    
    showAddProductModal.value = false;
    showEditProductModal.value = false;
    resetProductForm();
    
    alert('商品已保存到本地内存（刷新页面将丢失）');
  } catch (error) {
    console.error('保存商品失败:', error);
    alert('保存商品失败，请重试');
  }
};

// 删除商品
const deleteProduct = async (product) => {
  if (!confirm('确定要删除这个商品吗？')) {
    return;
  }
  
  try {
    if (product.is_local) {
      // 删除本地商品 - 从响应式引用中移除
      localProducts.value = localProducts.value.filter(p => p.id !== product.id);
      
      // 从显示列表移除
      merchantProducts.value = merchantProducts.value.filter(p => p.id !== product.id);
    } else {
      // 删除服务器商品
      await api.deleteProduct(product.id);
      
      // 从显示列表移除
      merchantProducts.value = merchantProducts.value.filter(p => p.id !== product.id);
    }
    
    alert('商品删除成功');
  } catch (error) {
    console.error('删除商品失败:', error);
    alert('删除商品失败，请稍后重试');
  }
};

// 切换商品状态
const toggleProductStatus = async (product) => {
  try {
    if (product.is_local) {
      // 切换本地商品状态
      const localProduct = localProducts.value.find(p => p.id === product.id);
      if (localProduct) {
        localProduct.status = !localProduct.status;
        
        // 更新显示列表
        const displayProduct = merchantProducts.value.find(p => p.id === product.id);
        if (displayProduct) {
          displayProduct.status = localProduct.status;
        }
      }
    } else {
      // 切换服务器商品状态
      const newStatus = !product.status;
      await api.updateProduct(product.id, { ...product, status: newStatus });
      
      // 更新显示列表
      const displayProduct = merchantProducts.value.find(p => p.id === product.id);
      if (displayProduct) {
        displayProduct.status = newStatus;
      }
    }
    
    alert(`商品已${product.status ? '下架' : '上架'}`);
  } catch (error) {
    console.error('切换商品状态失败:', error);
    alert('操作失败，请重试');
  }
};

// 查看订单详情
const viewOrderDetails = (order) => {
  // 跳转到订单详情页面
  router.push(`/order-detail/${order.id}`);
};

// 重置商品表单
const resetProductForm = () => {
  productForm.value = {
    id: null,
    name: '',
    price: '',
    status: true,
    sort: 0
  };
  formErrors.value = {};
};

// 关闭模态框
const closeModals = () => {
  showAddProductModal.value = false;
  showEditProductModal.value = false;
  resetProductForm();
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.dashboard-title {
  text-align: center;
  margin-bottom: 20px;
  padding: 0 16px;
}

.dashboard-title h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.dashboard-title p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 0 16px 20px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
}

.action-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.action-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 商品管理样式 */
.product-management-section {
  background: white;
  margin: 0 16px 20px;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.add-product-btn {
  background: #07c160;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
}

.add-product-btn:hover {
  background: #06a852;
}

.no-products {
  text-align: center;
  color: #999;
  padding: 20px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.product-price {
  font-size: 14px;
  color: #e74c3c;
  margin-bottom: 4px;
}

.product-status {
  font-size: 12px;
  color: #999;
}

.product-status.active {
  color: #07c160;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .status-btn {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  cursor: pointer;
}

.edit-btn:hover {
  background: #f5f5f5;
}

.status-btn:hover {
  background: #f5f5f5;
}

/* 订单管理样式 */
.order-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  font-size: 12px;
  cursor: pointer;
}

.filter-btn.active {
  background: #07c160;
  color: white;
  border-color: #07c160;
}

.no-orders {
  text-align: center;
  color: #999;
  padding: 20px;
}

/* 原有样式保持不变 */
.stats-section {
  background: white;
  margin: 0 16px 20px;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stats-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.orders-section {
  background: white;
  margin: 0 16px 20px;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.orders-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.order-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.order-no, .pickup-code {
  font-weight: 500;
}

.order-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
}

.order-status.pending {
  background: #fff3cd;
  color: #856404;
}

.order-status.verified {
  background: #d4edda;
  color: #155724;
}

.order-status.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.order-customer {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.order-amount {
  font-size: 16px;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 8px;
}

.order-time {
  font-size: 12px;
  color: #999;
}

.back-btn, .home-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #07c160;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.back-btn:hover, .home-btn:hover {
  background: #f5f5f5;
}

/* 商品模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.product-modal {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  border-color: #07c160;
  box-shadow: 0 0 0 2px rgba(7, 193, 96, 0.2);
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.image-preview-container {
  position: relative;
  display: inline-block;
}

.image-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.image-placeholder {
  width: 120px;
  height: 120px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24px;
}

.image-upload-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 120px;
  height: 120px;
  opacity: 0;
  cursor: pointer;
}

.clear-image-btn {
  margin-top: 8px;
  padding: 4px 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.char-count {
  font-size: 12px;
  color: #666;
  text-align: right;
  margin-top: 4px;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #07c160;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.status-label {
  margin-left: 12px;
  font-size: 14px;
  color: #666;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.cancel-btn, .save-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn {
  background: #f8f9fa;
  color: #666;
}

.cancel-btn:hover {
  background: #e9ecef;
}

.save-btn {
  background: #07c160;
  color: white;
}

.save-btn:hover {
  background: #06a852;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>