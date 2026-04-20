<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="iconfont icon-back"></text>
      </view>
      <view class="nav-title">{{ goodsInfo.name }}</view>
      <view class="nav-more">
        <text class="iconfont icon-share" @tap="showShare"></text>
      </view>
    </view>

    <!-- 商品轮播图 -->
    <view class="goods-banner">
      <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500" circular>
        <swiper-item v-for="(image, index) in goodsInfo.images" :key="index">
          <image :src="image" class="banner-image" mode="aspectFit"></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 商品信息 -->
    <view class="goods-info-section card">
      <view class="goods-title">{{ goodsInfo.name }}</view>
      <view class="goods-subtitle">{{ goodsInfo.description }}</view>
      <view class="goods-price-section">
        <text class="current-price">CAD ${{ goodsInfo.price }}</text>
        <text class="original-price" v-if="goodsInfo.original_price">CAD ${{ goodsInfo.original_price }}</text>
      </view>
      <view class="goods-meta">
        <view class="meta-item">
          <text class="meta-label">库存</text>
          <text class="meta-value">{{ goodsInfo.stock }} 件</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">销量</text>
          <text class="meta-value">{{ goodsInfo.sales_count || 0 }} 件</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">配送</text>
          <text class="meta-value">仅限自提</text>
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="goods-detail-section card">
      <view class="section-title">商品详情</view>
      <view class="detail-content">
        <rich-text :nodes="goodsInfo.detail || '暂无商品详情'"></rich-text>
      </view>
    </view>

    <!-- 规格选择 -->
    <view class="goods-specs-section card">
      <view class="section-title">规格选择</view>
      <view class="specs-options">
        <view 
          v-for="(spec, index) in goodsSpecs" 
          :key="index"
          :class="['spec-option', { active: selectedSpec === spec.name }]"
          @tap="selectSpec(spec.name)"
        >
          {{ spec.name }}
        </view>
      </view>
    </view>

    <!-- 数量选择 -->
    <view class="quantity-section card">
      <view class="section-title">购买数量</view>
      <view class="quantity-controls">
        <button @tap="decreaseQuantity" class="quantity-btn" :disabled="quantity <= 1">-</button>
        <input type="number" class="quantity-input" :value="quantity" @input="onQuantityInput" />
        <button @tap="increaseQuantity" class="quantity-btn" :disabled="quantity >= goodsInfo.stock">+</button>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-left">
        <button class="action-btn" @tap="goToCart">
          <text class="iconfont icon-cart"></text>
          <text>购物车</text>
        </button>
        <button class="action-btn" @tap="goToCustomerService">
          <text class="iconfont icon-service"></text>
          <text>客服</text>
        </button>
      </view>
      <view class="action-right">
        <button class="add-cart-btn" @tap="addToCart">加入购物车</button>
        <button class="buy-now-btn" @tap="buyNow">立即购买</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad } from 'vue';
import { api } from '@/utils/request';

// 商品信息
const goodsInfo = ref({
  id: '',
  name: '商品名称',
  description: '商品描述信息',
  price: 0,
  original_price: 0,
  stock: 0,
  images: [],
  detail: '',
  sales_count: 0
});

// 规格选项
const goodsSpecs = ref([
  { name: 'S' },
  { name: 'M' },
  { name: 'L' },
  { name: 'XL' }
]);

// 选中的规格
const selectedSpec = ref('');
// 购买数量
const quantity = ref(1);

// 页面加载
onLoad((options) => {
  const goodsId = options.id;
  if (goodsId) {
    loadGoodsDetail(goodsId);
  }
});

// 加载商品详情
const loadGoodsDetail = async (id) => {
  try {
    // 模拟API调用
    setTimeout(() => {
      goodsInfo.value = {
        id: id,
        name: '加拿大枫糖浆',
        description: '纯正加拿大枫糖浆，有机认证',
        price: 19.99,
        original_price: 24.99,
        stock: 50,
        images: [
          'https://via.placeholder.com/750x750.png?text=Maple+Syrup+1',
          'https://via.placeholder.com/750x750.png?text=Maple+Syrup+2',
          'https://via.placeholder.com/750x750.png?text=Maple+Syrup+3'
        ],
        detail: '<p>这是一款来自加拿大的纯正枫糖浆，采用传统工艺制作，无添加防腐剂。</p><p>富含天然矿物质，是早餐必备佳品。</p>',
        sales_count: 128
      };
    }, 500);
  } catch (error) {
    console.error('获取商品详情失败:', error);
    uni.showToast({
      title: '获取商品详情失败',
      icon: 'none'
    });
  }
};

// 选择规格
const selectSpec = (specName) => {
  selectedSpec.value = specName;
};

// 增加数量
const increaseQuantity = () => {
  if (quantity.value < goodsInfo.value.stock) {
    quantity.value++;
  } else {
    uni.showToast({
      title: '库存不足',
      icon: 'none'
    });
  }
};

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// 输入数量
const onQuantityInput = (e) => {
  const value = parseInt(e.detail.value) || 1;
  if (value <= 0) {
    quantity.value = 1;
  } else if (value > goodsInfo.value.stock) {
    quantity.value = goodsInfo.value.stock;
    uni.showToast({
      title: '库存不足',
      icon: 'none'
    });
  } else {
    quantity.value = value;
  }
};

// 添加到购物车
const addToCart = () => {
  uni.showToast({
    title: '已添加到购物车',
    icon: 'success'
  });
};

// 立即购买
const buyNow = () => {
  // 创建订单数据
  const orderItem = {
    id: goodsInfo.value.id,
    name: goodsInfo.value.name,
    price: goodsInfo.value.price,
    quantity: quantity.value,
    image: goodsInfo.value.images[0],
    stock: goodsInfo.value.stock
  };

  // 跳转到订单页面
  uni.navigateTo({
    url: `/pages/order/create?goods=${encodeURIComponent(JSON.stringify(orderItem))}`
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 显示分享
const showShare = () => {
  uni.showActionSheet({
    itemList: ['分享到微信', '分享到朋友圈', '复制链接'],
    success: (res) => {
      console.log('用户选择了:', res.tapIndex);
    }
  });
};

// 去购物车页面
const goToCart = () => {
  uni.switchTab({
    url: '/pages/index/cart'
  });
};

// 联系客服
const goToCustomerService = () => {
  uni.makePhoneCall({
    phoneNumber: '123-456-7890' // 替换为实际客服电话
  });
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.goods-banner {
  height: 750rpx;
  padding: $spacing-md;

  .banner-swiper {
    height: 100%;
    border-radius: $radius-lg;

    .banner-image {
      width: 100%;
      height: 100%;
      border-radius: $radius-lg;
    }
  }
}

.goods-info-section {
  padding: $spacing-md;
  margin: 0 $spacing-md $spacing-md;

  .goods-title {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-color;
    margin-bottom: $spacing-sm;
    line-height: 1.4;
  }

  .goods-subtitle {
    font-size: $font-size-md;
    color: $text-color-secondary;
    margin-bottom: $spacing-md;
    line-height: 1.4;
  }

  .goods-price-section {
    margin: $spacing-md 0;
    display: flex;
    align-items: baseline;

    .current-price {
      font-size: $font-size-xl;
      font-weight: bold;
      color: $danger-color;
      margin-right: $spacing-sm;
    }

    .original-price {
      font-size: $font-size-md;
      color: $text-color-placeholder;
      text-decoration: line-through;
    }
  }

  .goods-meta {
    display: flex;
    justify-content: space-between;
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: $border;

    .meta-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .meta-label {
      font-size: $font-size-sm;
      color: $text-color-placeholder;
      margin-bottom: $spacing-xs;
    }

    .meta-value {
      font-size: $font-size-md;
      color: $text-color;
      font-weight: 500;
    }
  }
}

.goods-detail-section {
  padding: $spacing-md;
  margin: 0 $spacing-md $spacing-md;

  .section-title {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-color;
    margin-bottom: $spacing-md;
  }

  .detail-content {
    line-height: 1.6;
  }
}

.goods-specs-section {
  padding: $spacing-md;
  margin: 0 $spacing-md $spacing-md;

  .section-title {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-color;
    margin-bottom: $spacing-md;
  }

  .specs-options {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  .spec-option {
    padding: $spacing-sm $spacing-md;
    border: $border;
    border-radius: $radius-round;
    font-size: $font-size-md;
    color: $text-color-secondary;
  }

  .spec-option.active {
    border-color: $primary-color;
    color: $primary-color;
    background-color: rgba($primary-color, 0.1);
  }
}

.quantity-section {
  padding: $spacing-md;
  margin: 0 $spacing-md $spacing-md;

  .section-title {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-color;
    margin-bottom: $spacing-md;
  }

  .quantity-controls {
    display: flex;
    align-items: center;

    .quantity-btn {
      width: 60rpx;
      height: 60rpx;
      border: $border;
      background: #fff;
      color: $text-color;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: $font-size-lg;
    }

    .quantity-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity-input {
      width: 80rpx;
      height: 60rpx;
      border: $border;
      border-radius: $radius-round;
      text-align: center;
      margin: 0 $spacing-md;
      font-size: $font-size-md;
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
  z-index: 999;
  padding-bottom: env(safe-area-inset-bottom);

  .action-left {
    display: flex;
    width: 40%;

    .action-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-right: $border;
      background: #fff;
      color: $text-color-secondary;
      font-size: $font-size-sm;
    }
  }

  .action-right {
    display: flex;
    width: 60%;
  }

  .add-cart-btn {
    background: #ffd95a;
    color: #333;
    border: none;
    font-size: $font-size-md;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .buy-now-btn {
    background: $primary-color;
    color: #fff;
    border: none;
    font-size: $font-size-md;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>