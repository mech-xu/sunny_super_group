<template>
  <!-- Mobile Order Simulator - WeChat-friendly -->
  <div class="min-h-screen bg-financial-navy text-slate-200 font-sans">
    <nav class="bg-slate-900 border-b border-slate-800 p-4 flex items-center sticky top-0 z-10">
      <button @click="goBack" class="mr-4 text-slate-400 hover:text-white transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-lg font-bold text-white">订单信息</h1>
      <div class="flex-1"></div>
      <button @click="resetForm" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded border border-slate-700 transition">
        重置
      </button>
    </nav>

    <main class="p-4 max-w-md mx-auto w-full">
      <!-- Product Selection Quick Bar -->
      <div class="mb-4">
        <label class="text-xs text-slate-500 mb-2 block">快速选择产品</label>
        <div class="flex flex-wrap gap-2">
          <button v-for="p in quickProducts" :key="p.name" @click="selectProduct(p)"
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded border border-slate-700 transition">
            {{ p.name }} - ${{ p.price }}
          </button>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
        <div class="space-y-1">
          <label class="text-xs text-slate-500 ml-1">客户昵称</label>
          <input v-model="form.customer_nickname" type="text" placeholder="请输入姓名..."
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-financial-accent transition" />
        </div>

        <div class="space-y-1">
          <label class="text-xs text-slate-500 ml-1">微信号</label>
          <input v-model="form.customer_wechat_id" type="text" placeholder="wxid_..."
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-financial-accent transition" />
        </div>

        <div class="space-y-1">
          <label class="text-xs text-slate-500 ml-1">订购产品</label>
          <input v-model="form.product_name" type="text" placeholder="请输入产品..."
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-financial-accent transition" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="text-xs text-slate-500 ml-1">数量</label>
            <input v-model.number="form.quantity" type="number" min="1" step="1"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-financial-accent transition" />
          </div>
          <div class="space-y-1">
            <label class="text-xs text-slate-500 ml-1">单价 ($)</label>
            <input v-model.number="form.unit_price" type="number" step="0.01" min="0"
              class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-financial-accent transition" />
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-xs text-slate-500 ml-1">取货时间</label>
          <input v-model="form.pickup_time" type="datetime-local"
            class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-financial-accent transition" />
        </div>

        <!-- Action Buttons (touch friendly) -->
        <div class="flex space-x-3 pt-2">
          <button @click="submitOrder" 
            class="flex-1 bg-financial-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition flex items-center justify-center">
            <svg v-if="!submitting" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ submitting ? '正在提交...' : '确认订单' }}
          </button>
          <button @click="clearForm" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition">
            清空
          </button>
        </div>
      </div>

      <!-- Order History -->
      <div v-if="orders.length" class="mt-4">
        <h3 class="text-xs font-bold text-slate-500 mb-2">最近订单</h3>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-2">
          <div v-for="o in orders.slice(0, 8)" :key="o.id" 
            class="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs">
            <div class="flex justify-between text-slate-400">
              <span>{{ o.customer_nickname || 'anonymous' }}</span>
              <span class="text-slate-500">{{ formatTime(o.pickup_time) }}</span>
            </div>
            <div class="text-slate-300 mt-1">{{ o.product_name }}</div>
            <div class="text-financial-accent mt-1">${{ o.total_price }}</div>
          </div>
        </div>
      </div>
    </main>

    <!-- Submit Confirmation Modal -->
    <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" @click="showConfirm = false"></div>
      <div class="relative bg-slate-900 border border-slate-700 rounded-t-2xl w-full max-w-md p-6 pb-8">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-white font-bold mb-2">订单提交成功</h3>
          <p class="text-slate-400 text-sm mb-6">Order submitted successfully</p>
          <div class="flex space-x-3">
            <button @click="goBack" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition">
              返回 / Back
            </button>
            <button @click="showConfirm = false" class="flex-1 bg-financial-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition">
              确定 / OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  customer_nickname: '',
  customer_wechat_id: '',
  product_name: '',
  quantity: 1,
  unit_price: 0,
  pickup_time: '',
})

const orders = ref([])
const quickProducts = ref([
  { name: '草莓 (2kg)', price: 12.50 },
  { name: '橙子', price: 8.00 },
  { name: '草莓组合', price: 15.00 },
  { name: '多肉组合', price: 20.00 },
])
const submitting = ref(false)
const showConfirm = ref(false)

const selectProduct = (p) => {
  form.value.product_name = p.name
  form.value.unit_price = p.price
}

const submitOrder = async () => {
  if (!form.value.product_name) {
    alert('请选择产品')
    return
  }
  form.value.total_price = (form.value.quantity * form.value.unit_price).toFixed(2)
  form.value.id = 'sim-' + Date.now()
  form.value.status = 'pending'
  orders.value.unshift({ ...form.value })
  showConfirm.value = true
  // In real app, would POST to API:
  // await api.post('/orders', form.value)
  resetForm()
}

const resetForm = () => {
  form.value = {
    customer_nickname: '',
    customer_wechat_id: '',
    product_name: '',
    quantity: 1,
    unit_price: 0,
    pickup_time: '',
  }
  orders.value = []
  showConfirm.value = false
}

const clearForm = () => {
  resetForm()
}

const goBack = () => {
  if (confirm('确定退出当前页面？')) {
    window.history.back()
  }
}

const formatTime = (t) => {
  if (!t) return ''
  const d = new Date(t)
  return d.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Auto-set pickup time to +30 minutes default
const now = new Date()
now.setMinutes(now.getMinutes() + 30)
form.value.pickup_time = now.toISOString().slice(0, 16)
</script>

<style scoped>
/* Ensure touch targets are mobile-friendly */
button, input {
  min-height: 44px; /* Apple HIG minimum touch target */
}
</style>
