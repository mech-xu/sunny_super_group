<template>
  <div id="app">
    <router-view/>
    <ApiValidator v-if="import.meta.env.DEV" />
  </div>
</template>

<script>
import ApiValidator from './components/ApiValidator.vue';

export default {
  name: 'App',
  components: {
    ApiValidator
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

/* 通用样式 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-size: 14px;
  background-color: #f5f5f5;
}

/* 加元符号样式 */
.cad-currency::before {
  content: 'CAD $';
}

/* 商品网格响应式布局 */
@media (min-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
  }
}

/* 移动端优化 */
@media (max-width: 480px) {
  .iphone-frame {
    width: 100%;
    height: 100vh;
    border-radius: 0;
    padding: 20px 0 60px;
  }
  
  .notch {
    display: none;
  }
  
  .home-indicator {
    display: none;
  }
}
</style>