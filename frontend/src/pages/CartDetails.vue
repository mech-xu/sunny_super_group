<template>
  <div class="cart-container">
    <div class="iphone-frame">
      <div class="notch"></div>
      
      <div class="page-content">
        <header class="page-header">
          <button @click="goBack" class="back-btn">←</button>
          <h1>购物车</h1>
          <div class="empty-cart" v-if="cartItems.length === 0">
            <p>购物车为空</p>
          </div>
        </header>

        <div class="cart-items" v-if="cartItems.length > 0">
          <div 
            class="cart-item" 
            v-for="(item, index) in cartItems" 
            :key="index"
          >
            <div class="item-image">
              <img :src="item.product.image || 'https://placehold.co/100x100?text=No+Image'" :alt="item.product.name" />
            </div>
            <div class="item-details">
              <h3>{{ item.product.name }}</h3>
              <p class="price">CAD ${{ item.product.price }}</p>
              
              <div class="quantity-controls">
                <button @click="decreaseQuantity(item)" class="quantity-btn">-</button>
                <span class="quantity-value">{{ item.quantity }}</span>
                <button @click="increaseQuantity(item)" class="quantity-btn">+</button>
              </div>
              
              <div class="item-total">
                小计: CAD ${{ (item.product.price * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <div class="cart-summary" v-if="cartItems.length > 0">
          <div class="summary-row">
            <span>商品总数:</span>
            <span>{{ totalItems }} 件</span>
          </div>
          <div class="summary-row">
            <span>总计:</span>
            <span>CAD ${{ totalPrice.toFixed(2) }}</span>
          </div>
        </div>

        <div class="cart-actions" v-if="cartItems.length > 0">
          <button @click="clearCart" class="clear-btn">清空购物车</button>
          <button @click="proceedToCheckout" class="checkout-btn">去结算</button>
        </div>
      </div>
      
      <div class="home-indicator"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CartDetails',
  data() {
    return {
      cartItems: []
    }
  },
  computed: {
    totalItems() {
      // 计算购物车总数量
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    },
    totalPrice() {
      // 计算购物车总价
      return this.cartItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);
    }
  },
  created() {
    this.loadCart();
  },
  methods: {
    loadCart() {
      // 从localStorage加载购物车数据
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        this.cartItems = JSON.parse(cartData);
      }
    },
    increaseQuantity(item) {
      // 增加商品数量
      item.quantity++;
      this.saveCart();
    },
    decreaseQuantity(item) {
      // 减少商品数量，最少为1
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        // 如果数量已经是1，则询问用户是否要删除商品
        if (confirm('确定要从购物车中移除该商品吗？')) {
          this.removeItem(item);
        }
        return;
      }
      this.saveCart();
    },
    removeItem(item) {
      // 从购物车中移除商品
      const index = this.cartItems.indexOf(item);
      if (index !== -1) {
        this.cartItems.splice(index, 1);
        this.saveCart();
      }
    },
    clearCart() {
      // 清空购物车
      if (confirm('确定要清空整个购物车吗？')) {
        this.cartItems = [];
        this.saveCart();
      }
    },
    saveCart() {
      // 保存购物车数据到localStorage
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
    },
    goBack() {
      this.$router.go(-1);
    },
    proceedToCheckout() {
      // 跳转到订单预览页面
      this.$router.push('/order-preview');
    }
  }
}
</script>

<style scoped>
.cart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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

.empty-cart {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #888;
}

.cart-items {
  padding: 15px;
  flex: 1;
}

.cart-item {
  display: flex;
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 15px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.price {
  margin: 0 0 10px 0;
  color: #e74c3c;
  font-weight: bold;
}

.quantity-controls {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.quantity-value {
  margin: 0 15px;
  min-width: 20px;
  text-align: center;
}

.item-total {
  font-weight: bold;
  color: #2c3e50;
  font-size: 14px;
}

.cart-summary {
  background: white;
  padding: 15px 20px;
  margin: 0 15px 15px 15px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.summary-row:last-child {
  border-bottom: none;
  font-weight: bold;
  color: #e74c3c;
  font-size: 18px;
}

.cart-actions {
  display: flex;
  gap: 10px;
  padding: 0 15px 20px 15px;
}

.clear-btn, .checkout-btn {
  flex: 1;
  padding: 15px;
  border-radius: 10px;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.clear-btn {
  background: #ecf0f1;
  color: #e74c3c;
}

.checkout-btn {
  background: #07c160;
  color: white;
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