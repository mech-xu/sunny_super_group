<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav nav-bar">
      <view class="nav-back" @tap="goBack">
        <text class="iconfont icon-back"></text>
      </view>
      <view class="nav-title">SunnyNow团购</view>
      <view class="nav-more">
        <text class="iconfont icon-search"></text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-section card">
      <view class="search-bar" @tap="goToSearch">
        <text class="iconfont icon-search"></text>
        <text>搜索商品</text>
      </view>
    </view>

    <!-- 轮播图 -->
    <view class="banner-section">
      <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500" circular>
        <swiper-item v-for="(item, index) in banners" :key="index">
          <image :src="item.image" class="banner-image" @tap="goToBannerDetail(item)"></image>
        </swiper-item>
      </swiper>
    </view>

    <!-- 快捷菜单 -->
    <view class="quick-menu card">
      <view class="menu-grid">
        <view class="menu-item" v-for="(item, index) in menuList" :key="index" @tap="goToPage(item)">
          <image :src="item.icon" class="menu-icon"></image>
          <text class="menu-text">{{ item.text }}</text>
        </view>
      </view>
    </view>

    <!-- 推荐商品 -->
    <view class="recommend-section">
      <view class="section-header">
        <text class="section-title">推荐商品</text>
        <text class="section-more" @tap="goToRecommend">查看更多</text>
      </view>
      <view class="goods-list">
        <view class="goods-card" v-for="(item, index) in recommendGoods" :key="item.id" @tap="goToGoodsDetail(item)">
          <image :src="item.image || defaultImage" class="goods-image" mode="aspectFill"></image>
          <view class="goods-info">
            <view class="goods-title">{{ item.name }}</view>
            <view class="goods-desc">{{ item.description || '加拿大优质商品' }}</view>
            <view class="goods-price">
              <text class="goods-price-text">CAD ${{ item.price }}</text>
              <text class="goods-original-price" v-if="item.original_price">CAD ${{ item.original_price }}</text>
            </view>
            <view class="goods-actions">
              <text class="goods-stock">库存: {{ item.stock || '充足' }}</text>
              <view class="goods-add-btn" @tap.stop="addToCart(item)">+</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-safe-area"></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/utils/request';

// 数据
const banners = ref([
  { id: 1, image: 'https://via.placeholder.com/750x300.png?text=Banner+1', url: '/pages/goods/list' },
  { id: 2, image: 'https://via.placeholder.com/750x300.png?text=Banner+2', url: '/pages/activity/seckill' },
  { id: 3, image: 'https://via.placeholder.com/750x300.png?text=Banner+3', url: '/pages/activity/groupon' }
]);

const menuList = ref([
  { id: 1, icon: '/static/images/icons/category.png', text: '分类', url: '/pages/index/category' },
  { id: 2, icon: '/static/images/icons/cart.png', text: '购物车', url: '/pages/index/cart' },
  { id: 3, icon: '/static/images/icons/groupon.png', text: '团购', url: '/pages/goods/groupon' },
  { id: 4, icon: '/static/images/icons/seckill.png', text: '秒杀', url: '/pages/goods/seckill' },
  { id: 5, icon: '/static/images/icons/coupon.png', text: '优惠券', url: '/pages/coupon/list' },
  { id: 6, icon: '/static/images/icons/order.png', text: '订单', url: '/pages/order/index' },
  { id: 7, icon: '/static/images/icons/profile.png', text: '我的', url: '/pages/user/index' },
  { id: 8, icon: '/static/images/icons/service.png', text: '客服', url: '/pages/chat/index' }
]);

const recommendGoods = ref([]);
const defaultImage = ref('https://via.placeholder.com/200x200.png?text=No+Image');

// 方法
const goBack = () => {
  uni.navigateBack();
};

const goToSearch = () => {
  uni.navigateTo({
    url: '/pages/index/search'
  });
};

const goToBannerDetail = (item) => {
  uni.navigateTo({
    url: item.url
  });
};

const goToPage = (item) => {
  uni.navigateTo({
    url: item.url
  });
};

const goToRecommend = () => {
  uni.navigateTo({
    url: '/pages/goods/list'
  });
};

const goToGoodsDetail = (item) => {
  uni.navigateTo({
    url: `/pages/goods/index?id=${item.id}`
  });
};

const addToCart = (item) => {
  // 添加到购物车逻辑
  console.log('Add to cart:', item);
  uni.showToast({
    title: '已添加到购物车',
    icon: 'success'
  });
};

// 页面加载时获取数据
onMounted(async () => {
  try {
    // 获取推荐商品
    const res = await api.goods.getList({ limit: 10 });
    if (res && res.code === 0) {
      recommendGoods.value = res.data.list || [];
    } else {
      // 模拟数据
      recommendGoods.value = [
        { id: 1, name: '加拿大枫糖浆', price: 19.99, original_price: 24.99, stock: 100, image: 'https://via.placeholder.com/200x200.png?text=Maple+Syrup', description: '纯正加拿大枫糖浆' },
        { id: 2, name: '野生蓝莓干', price: 15.99, original_price: 19.99, stock: 50, image: 'https://via.placeholder.com/200x200.png?text=Blueberry', description: '有机野生蓝莓干' },
        { id: 3, name: '三文鱼罐头', price: 12.99, original_price: 15.99, stock: 80, image: 'https://via.placeholder.com/200x200.png?text=Salmon', description: '新鲜阿拉斯加三文鱼' }
      ];
    }
  } catch (error) {
    console.error('获取推荐商品失败:', error);
    // 使用模拟数据
    recommendGoods.value = [
      { id: 1, name: '加拿大枫糖浆', price: 19.99, original_price: 24.99, stock: 100, image: 'https://via.placeholder.com/200x200.png?text=Maple+Syrup', description: '纯正加拿大枫糖浆' },
      { id: 2, name: '野生蓝莓干', price: 15.99, original_price: 19.99, stock: 50, image: 'https://via.placeholder.com/200x200.png?text=Blueberry', description: '有机野生蓝莓干' },
      { id: 3, name: '三文鱼罐头', price: 12.99, original_price: 15.99, stock: 80, image: 'https://via.placeholder.com/200x200.png?text=Salmon', description: '新鲜阿拉斯加三文鱼' }
    ];
  }
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.search-section {
  padding: $spacing-md;
  background-color: #fff;
  margin: 0 $spacing-md $spacing-md;
  border-radius: $radius-lg;

  .search-bar {
    display: flex;
    align-items: center;
    padding: $spacing-sm $spacing-md;
    background-color: $background-color;
    border-radius: $radius-round;
    color: $text-color-placeholder;

    .icon-search {
      margin-right: $spacing-sm;
    }
  }
}

.banner-section {
  margin: 0 $spacing-md $spacing-md;

  .banner-swiper {
    height: 240rpx;
    border-radius: $radius-lg;

    .banner-image {
      width: 100%;
      height: 100%;
      border-radius: $radius-lg;
    }
  }
}

.quick-menu {
  margin: 0 $spacing-md $spacing-md;
  padding: $spacing-md 0;

  .menu-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-md 0;
  }

  .menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-sm 0;

    .menu-icon {
      width: 80rpx;
      height: 80rpx;
      margin-bottom: $spacing-xs;
    }

    .menu-text {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }
}

.recommend-section {
  margin: 0 $spacing-md $spacing-md;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;

    .section-title {
      font-size: $font-size-lg;
      font-weight: bold;
      color: $text-color;
    }

    .section-more {
      font-size: $font-size-sm;
      color: $text-color-secondary;
    }
  }

  .goods-list {
    .goods-card {
      background-color: #fff;
      border-radius: $radius-lg;
      box-shadow: $shadow-sm;
      margin-bottom: $spacing-md;
    }
  }
}

.bottom-safe-area {
  height: env(safe-area-inset-bottom);
}
</style>