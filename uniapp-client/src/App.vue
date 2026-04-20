<script setup>
import { onLaunch, onShow, onError } from '@dcloudio/uni-app';

onLaunch(() => {
  console.log('SunnyNow团购自提系统启动');
  
  // 隐藏原生导航栏，使用自定义底部导航
  uni.hideTabBar();
});

onError((err) => {
  console.log('AppOnError:', err);
});

onShow(() => {
  // 应用显示时的逻辑
  console.log('SunnyNow团购自提系统显示');
});
</script>

<style lang="scss">
@import './styles/index.scss';
</style>