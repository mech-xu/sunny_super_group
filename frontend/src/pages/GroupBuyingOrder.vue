<template>
  <div class="group-buying-order iphone-14-container">
    <!-- iPhone 14 外观框架 -->
    <div class="iphone-frame">
      <div class="notch"></div>
      
      <!-- 页面内容 -->
      <div class="page-content">
        <header class="page-header">
          <h2>团购订单</h2>
        </header>
        
        <!-- 用户身份选择 -->
        <div class="user-role-selection">
          <button 
            @click="setUserRole('systemAdmin')" 
            :class="{ active: currentUserRole === 'systemAdmin' }"
          >
            系统管理员
          </button>
          <button 
            @click="setUserRole('merchantManager')" 
            :class="{ active: currentUserRole === 'merchantManager' }"
          >
            商户订单管理员
          </button>
          <button 
            @click="setUserRole('customer')" 
            :class="{ active: currentUserRole === 'customer' }"
          >
            客户
          </button>
        </div>
        
        <!-- 客户填写表单区域 -->
        <div v-if="currentUserRole === 'customer'" class="customer-form">
          <h3>填写订单信息</h3>
          <form @submit.prevent="submitOrder">
            <div class="form-group">
              <label for="nickname">用户昵称:</label>
              <input 
                type="text" 
                id="nickname" 
                v-model="orderForm.nickname" 
                placeholder="请输入您的昵称"
                required 
              />
            </div>
            
            <div class="form-group">
              <label for="cell">手机号:</label>
              <input 
                type="tel" 
                id="cell" 
                v-model="orderForm.cell" 
                placeholder="请输入您的手机号"
                required 
              />
            </div>
            
            <div class="product-list">
              <h4>选择商品</h4>
              <div 
                v-for="product in groupProducts" 
                :key="product.id" 
                class="product-item"
              >
                <div class="product-info">
                  <h5>{{ product.name }}</h5>
                  <p>¥{{ product.price }}</p>
                  <p>库存: {{ product.stock }}</p>
                </div>
                <div class="quantity-control">
                  <button 
                    @click="decreaseQuantity(product.id)" 
                    :disabled="getQuantity(product.id) <= 0"
                    type="button"
                  >
                    -
                  </button>
                  <span>{{ getQuantity(product.id) }}</span>
                  <button 
                    @click="increaseQuantity(product.id, product.stock)" 
                    :disabled="getQuantity(product.id) >= product.stock"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              :disabled="!hasSelectedProducts || !orderForm.nickname || !orderForm.cell"
              class="submit-btn"
            >
              提交订单
            </button>
          </form>
        </div>
        
        <!-- 管理员视图 - 显示订单列表 -->
        <div v-else class="admin-view">
          <h3>
            {{ currentUserRole === 'systemAdmin' ? '系统管理员视图' : '商户订单管理员视图' }}
          </h3>
          
          <div class="order-list">
            <div v-for="order in orders" :key="order.id" class="order-item">
              <div class="order-header">
                <span>订单号: {{ order.orderNumber }}</span>
                <span>状态: {{ order.status }}</span>
              </div>
              <div class="order-details">
                <p>昵称: {{ order.nickname }}</p>
                <p>手机号: {{ order.cell }}</p>
                <p>商品数量: {{ order.items.length }}</p>
                <p>总金额: ¥{{ calculateTotal(order.items) }}</p>
                
                <div class="order-qrcode">
                  <p>订单二维码:</p>
                  <img 
                    :src="generateQRCode(order.orderNumber)" 
                    :alt="'订单 ' + order.orderNumber + ' 二维码'" 
                  />
                  <button 
                    @click="downloadQRCode(generateQRCode(order.orderNumber), order.orderNumber)"
                    class="qr-download-btn"
                  >
                    保存二维码
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Home Indicator for iPhone -->
      <div class="home-indicator"></div>
    </div>
    
    <!-- 订单提交成功后显示的弹窗 -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal-content">
        <h3>🎉 订单提交成功!</h3>
        <p>订单号: <strong>{{ orderResult.orderNumber }}</strong></p>
        <p>取货码: <strong>{{ orderResult.pickupCode }}</strong></p>
        
        <!-- 显示订单二维码 -->
        <div class="order-qrcode-large">
          <p>请保存下方二维码，取货时出示：</p>
          <canvas id="orderQRCodeCanvas"></canvas>
          <button 
            @click="downloadQRCodeFromCanvas"
            class="qr-download-btn large"
          >
            保存二维码到相册
          </button>
        </div>
        
        <button @click="closeModal" class="confirm-btn">确定</button>
      </div>
    </div>
    
    <!-- 错误提示弹窗 -->
    <div v-if="showErrorModal" class="modal-overlay">
      <div class="modal-content error">
        <h3>⚠️ 提交失败</h3>
        <p>{{ errorMessage }}</p>
        <button @click="closeErrorModal" class="confirm-btn">确定</button>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '../api';
import QRCode from 'qrcode';

export default {
  name: 'GroupBuyingOrder',
  data() {
    return {
      currentUserRole: 'customer', // 默认为顾客角色
      groupProducts: [],
      cart: {},
      orderForm: {
        nickname: '',
        cell: ''
      },
      orders: [],
      showSuccessModal: false,
      showErrorModal: false,
      errorMessage: '',
      orderResult: {}
    };
  },
  computed: {
    hasSelectedProducts() {
      return Object.keys(this.cart).length > 0;
    }
  },
  async mounted() {
    await this.loadProducts();
    await this.loadOrders();
  },
  methods: {
    setUserRole(role) {
      this.currentUserRole = role;
    },
    
    async loadProducts() {
      try {
        const products = await api.getGroupProducts();
        this.groupProducts = products;
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    },
    
    async loadOrders() {
      // 模拟加载订单数据
      this.orders = [
        {
          id: 1,
          orderNumber: 'SN20260418001',
          status: '待取货',
          nickname: '张三',
          cell: '138****8888',
          items: [
            { productId: 1, productName: '商品A', quantity: 2, price: 50 },
            { productId: 2, productName: '商品B', quantity: 1, price: 30 }
          ]
        },
        {
          id: 2,
          orderNumber: 'SN20260418002',
          status: '已取货',
          nickname: '李四',
          cell: '139****9999',
          items: [
            { productId: 3, productName: '商品C', quantity: 3, price: 25 }
          ]
        }
      ];
    },
    
    getQuantity(productId) {
      return this.cart[productId] || 0;
    },
    
    increaseQuantity(productId, maxStock) {
      const currentQty = this.getQuantity(productId);
      if (currentQty < maxStock) {
        this.$set(this.cart, productId, currentQty + 1);
      }
    },
    
    decreaseQuantity(productId) {
      const currentQty = this.getQuantity(productId);
      if (currentQty > 0) {
        if (currentQty === 1) {
          this.$delete(this.cart, productId);
        } else {
          this.$set(this.cart, productId, currentQty - 1);
        }
      }
    },
    
    calculateTotal(items) {
      return items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
    },
    
    async submitOrder() {
      if (!this.validateForm()) {
        return;
      }
      
      try {
        // 准备订单数据
        const orderData = {
          nickname: this.orderForm.nickname,
          cell: this.orderForm.cell,
          items: Object.entries(this.cart).map(([productId, quantity]) => ({
            productId: parseInt(productId),
            quantity
          }))
        };
        
        // 提交订单
        const result = await api.createGroupOrder(orderData);
        
        // 显示成功弹窗
        this.orderResult = result;
        this.showSuccessModal = true;
        
        // 生成订单二维码
        setTimeout(() => {
          this.generateQRCodeForCanvas(result.orderNumber);
        }, 100);
        
        // 清空购物车和表单
        this.cart = {};
        this.orderForm = { nickname: '', cell: '' };
      } catch (error) {
        this.errorMessage = error.message || '提交订单失败';
        this.showErrorModal = true;
      }
    },
    
    validateForm() {
      if (!this.orderForm.nickname) {
        this.errorMessage = '请输入用户昵称';
        this.showErrorModal = true;
        return false;
      }
      
      if (!this.orderForm.cell) {
        this.errorMessage = '请输入手机号';
        this.showErrorModal = true;
        return false;
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.orderForm.cell)) {
        this.errorMessage = '请输入正确的手机号';
        this.showErrorModal = true;
        return false;
      }
      
      if (Object.keys(this.cart).length === 0) {
        this.errorMessage = '请选择至少一件商品';
        this.showErrorModal = true;
        return false;
      }
      
      return true;
    },
    
    closeModal() {
      this.showSuccessModal = false;
    },
    
    closeErrorModal() {
      this.showErrorModal = false;
    },
    
    // 生成订单二维码到canvas
    generateQRCodeForCanvas(text) {
      const canvas = document.getElementById('orderQRCodeCanvas');
      QRCode.toCanvas(canvas, text, (error) => {
        if (error) console.error(error);
        console.log('QR Code generated on canvas');
      });
    },
    
    // 下载二维码
    downloadQRCodeFromCanvas() {
      const canvas = document.getElementById('orderQRCodeCanvas');
      const url = canvas.toDataURL('image/png');
      
      // 尝试保存到相册
      this.saveImageToPhotos(url, `order_${this.orderResult.orderNumber}.png`);
    },
    
    // 生成订单二维码图片链接
    generateQRCode(text) {
      // 使用data URL方式生成二维码
      const canvas = document.createElement('canvas');
      QRCode.toCanvas(canvas, text, (error) => {
        if (error) console.error(error);
      });
      return canvas.toDataURL('image/png');
    },
    
    // 保存图片到相册
    saveImageToPhotos(url, filename) {
      // 创建一个临时的a标签用于下载
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    
    // 下载订单二维码
    downloadQRCode(qrCodeUrl, orderNumber) {
      this.saveImageToPhotos(qrCodeUrl, `order_${orderNumber}_qrcode.png`);
    }
  }
};
</script>

<style scoped>
/* iPhone 14 样式 */
.iphone-14-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-sizing: border-box;
}

.iphone-frame {
  position: relative;
  width: 390px;
  height: 844px;
  background: #ffffff;
  border-radius: 40px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
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
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

.home-indicator {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 134px;
  height: 5px;
  background: #000;
  border-radius: 100px;
}

/* 表单样式 */
.customer-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 16px;
  box-sizing: border-box;
}

.product-list {
  margin: 25px 0;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 10px;
  margin-bottom: 10px;
}

.product-info h5 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
}

.product-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.quantity-control button {
  width: 30px;
  height: 30px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
}

.quantity-control span {
  margin: 0 10px;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 角色选择按钮 */
.user-role-selection {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.user-role-selection button {
  flex: 1;
  padding: 10px;
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.user-role-selection button.active {
  background: #42b983;
  color: white;
}

/* 订单项样式 */
.order-item {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #eee;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.order-header span {
  font-weight: bold;
  color: #333;
}

.order-details p {
  margin: 5px 0;
  color: #666;
}

.order-qrcode img {
  width: 100px;
  height: 100px;
  display: block;
  margin: 10px auto;
}

.qr-download-btn {
  width: 100%;
  padding: 10px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
}

.qr-download-btn.large {
  padding: 12px;
  font-size: 16px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  width: 80%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-content.error {
  border-left: 5px solid #f56c6c;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.confirm-btn {
  width: 100%;
  padding: 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
}

#orderQRCodeCanvas {
  width: 200px;
  height: 200px;
  margin: 15px auto;
  display: block;
}
</style>