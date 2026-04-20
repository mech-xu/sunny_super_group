<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="iconfont icon-back"></text>
      </view>
      <view class="nav-title">确认订单</view>
      <view class="nav-more">
        <text class="iconfont icon-home" @tap="goHome"></text>
      </view>
    </view>

    <!-- 收货地址 -->
    <view class="address-section card" @tap="selectAddress">
      <view class="address-info" v-if="selectedAddress">
        <view class="address-header">
          <text class="name">{{ selectedAddress.name }}</text>
          <text class="phone">{{ selectedAddress.phone }}</text>
        </view>
        <view class="address-detail">
          {{ selectedAddress.detail }}
        </view>
        <view class="address-edit">
          <text class="iconfont icon-edit"></text>
        </view>
      </view>
      <view class="address-empty" v-else>
        <text>请选择收货地址</text>
        <text class="iconfont icon-right"></text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-list-section card">
      <view class="section-title">商品清单</view>
      <view class="goods-item" v-for="(item, index) in orderItems" :key="index">
        <image :src="item.image" class="goods-image"></image>
        <view class="goods-info">
          <view class="goods-name">{{ item.name }}</view>
          <view class="goods-meta">
            <text class="goods-price">CAD ${{ item.price }}</text>
            <text class="goods-count">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="remark-section card">
      <view class="section-title">订单备注</view>
      <input 
        class="remark-input" 
        type="text" 
        placeholder="请输入订单备注（可选）" 
        v-model="orderRemark"
      />
    </view>

    <!-- 订单费用明细 -->
    <view class="fee-section card">
      <view class="fee-item">
        <text>商品总价</text>
        <text class="fee-price">CAD ${{ totalPrice }}</text>
      </view>
      <view class="fee-item">
        <text>配送费</text>
        <text class="fee-price">CAD ${{ deliveryFee }}</text>
      </view>
      <view class="fee-item total">
        <text>合计</text>
        <text class="fee-price total-price">CAD ${{ totalAmount }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="total-amount">
        <text>合计: </text>
        <text class="total-price">CAD ${{ totalAmount }}</text>
      </view>
      <view class="submit-btn" @tap="submitOrder">提交订单</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '@/utils/request';

// 订单商品
const orderItems = ref([]);
// 选中的地址
const selectedAddress = ref(null);
// 订单备注
const orderRemark = ref('');
// 配送费
const deliveryFee = ref(0);

// 计算总价
const totalPrice = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * item.quantity);
  }, 0).toFixed(2);
});

// 计算总金额
const totalAmount = computed(() => {
  return (parseFloat(totalPrice.value) + deliveryFee.value).toFixed(2);
});

// 页面加载时初始化
onMounted(() => {
  // 从本地存储或上个页面传递的数据中获取订单商品
  const goodsData = getCurrentInstance().ctx.$scope.options.goods;
  if (goodsData) {
    const goods = JSON.parse(decodeURIComponent(goodsData));
    orderItems.value = Array.isArray(goods) ? goods : [goods];
  } else {
    // 如果没有传递商品数据，则从购物车获取
    const cartData = uni.getStorageSync('cart') || [];
    orderItems.value = cartData;
  }
  
  // 获取默认地址
  getDefaultAddress();
});

// 获取默认地址
const getDefaultAddress = () => {
  // 从本地存储获取默认地址
  const address = uni.getStorageSync('defaultAddress');
  if (address) {
    selectedAddress.value = address;
  } else {
    // 如果没有默认地址，跳转到地址管理页面
    uni.showModal({
      title: '提示',
      content: '请先设置收货地址',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/user/address'
          });
        }
      }
    });
  }
};

// 选择地址
const selectAddress = () => {
  uni.navigateTo({
    url: '/pages/user/address'
  });
};

// 提交订单
const submitOrder = async () => {
  if (!selectedAddress.value) {
    uni.showToast({
      title: '请选择收货地址',
      icon: 'none'
    });
    return;
  }

  if (orderItems.value.length === 0) {
    uni.showToast({
      title: '订单商品不能为空',
      icon: 'none'
    });
    return;
  }

  try {
    // 构建订单数据
    const orderData = {
      userId: uni.getStorageSync('userId'), // 从本地存储获取用户ID
      items: orderItems.value,
      address: selectedAddress.value,
      remark: orderRemark.value,
      totalAmount: parseFloat(totalAmount.value),
      deliveryFee: deliveryFee.value,
      paymentMethod: 'balance' // 默认使用余额支付
    };

    // 调用API创建订单
    const res = await api.order.create(orderData);
    
    if (res && res.code === 0) {
      // 创建订单成功
      uni.showToast({
        title: '订单创建成功',
        icon: 'success'
      });
      
      // 清空购物车
      uni.removeStorageSync('cart');
      
      // 跳转到订单详情页
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/order/detail?id=${res.data.id}`
        });
      }, 1500);
    } else {
      uni.showToast({
        title: res.message || '订单创建失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('提交订单失败:', error);
    uni.showToast({
      title: '提交订单失败',
      icon: 'none'
    });
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 返回首页
const goHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  });
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.address-section {
  margin: $spacing-md;
  padding: $spacing-md;
  background-color: #fff;
  border-radius: $radius-lg;

  .address-info {
    display: flex;
    align-items: center;

    .address-header {
      flex: 1;

      .name {
        font-size: $font-size-lg;
        font-weight: bold;
        color: $text-color;
        margin-right: $spacing-sm;
      }

      .phone {
        font-size: $font-size-md;
        color: $text-color-secondary;
      }
    }

    .address-detail {
      flex: 1;
      font-size: $font-size-sm;
      color: $text-color-secondary;
      margin: $spacing-sm 0;
    }

    .address-edit {
      color: $text-color-placeholder;
    }
  }

  .address-empty {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: $text-color-placeholder;
  }
}

.goods-list-section {
  margin: $spacing-md;
  padding: $spacing-md;
  background-color: #fff;
  border-radius: $radius-lg;

  .section-title {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-color;
    margin-bottom: $spacing-md;
  }

  .goods-item {
    display: flex;
    padding: $spacing-md 0;
    border-bottom: $border;

    &:last-child {
      border-bottom: none;
    }

    .goods-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: $radius-md;
      margin-right: $spacing-md;
    }

    .goods-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .goods-name {
        font-size: $font-size-md;
        color: $text-color;
        margin-bottom: $spacing-sm;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .goods-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .goods-price {
          font-size: $font-size-lg;
          font-weight: bold;
          color: $danger-color;
        }

        .goods-count {
          font-size: $font-size-md;
          color: $text-color-secondary;
        }
      }
    }
  }
}

.remark-section {
  margin: $spacing-md;
  padding: $spacing-md;
  background-color: #fff;
  border-radius: $radius-lg;

  .section-title {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-color;
    margin-bottom: $spacing-md;
  }

  .remark-input {
    width: 100%;
    padding: $spacing-sm;
    border: $border;
    border-radius: $radius-md;
    font-size: $font-size-md;
  }
}

.fee-section {
  margin: $spacing-md;
  padding: $spacing-md;
  background-color: #fff;
  border-radius: $radius-lg;

  .fee-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-sm 0;

    &:not(:last-child) {
      border-bottom: $border;
    }

    &.total {
      font-weight: bold;
      color: $text-color;
      font-size: $font-size-lg;
      padding-top: $spacing-md;
    }

    .fee-price {
      color: $danger-color;
      font-weight: bold;

      &.total-price {
        font-size: $font-size-xl;
      }
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 100rpx;
  background: #fff;
  border-top: $border;
  align-items: center;
  padding: 0 $spacing-md;
  padding-bottom: env(safe-area-inset-bottom);

  .total-amount {
    flex: 1;
    font-size: $font-size-lg;

    .total-price {
      color: $danger-color;
      font-weight: bold;
      font-size: $font-size-xl;
    }
  }

  .submit-btn {
    padding: $spacing-sm $spacing-lg;
    background: $primary-color;
    color: #fff;
    border-radius: $radius-round;
    font-size: $font-size-md;
  }
}
</style>