<template>
  <header class="simple-header">
    <div class="header-content">
      <div class="left-section">
        <slot name="left">
          <button v-if="showBack" @click="goBack" class="back-btn">←</button>
        </slot>
      </div>
      <div class="title">{{ title }}</div>
      <div class="right-section">
        <slot name="right"></slot>
      </div>
    </div>
  </header>
</template>

<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  showBack: {
    type: Boolean,
    default: true
  }
});

const router = useRouter();

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.simple-header {
  background: #fff;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  box-sizing: border-box;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}

.left-section, .right-section {
  min-width: 40px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
  flex: 1;
  margin: 0 16px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #333;
  cursor: pointer;
  padding: 4px;
}
</style>