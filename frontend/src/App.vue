<template>
  <div class="min-h-screen flex flex-col bg-financial-navy text-slate-200 font-sans">
    
    <!-- 1. 简化版登录页 (Login View) -->
    <div v-if="!currentUser" class="flex-1 flex flex-col items-center justify-center p-6">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-white tracking-tighter mb-2">
          sunnynow<span class="text-financial-accent">.net</span>
        </h1>
        <p class="text-slate-500">请选择您的身份进入工作台 <span class="text-xs block opacity-60">Please select your identity to enter</span></p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <!-- 管理员组 -->
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div class="flex items-center space-x-2 mb-6 border-b border-slate-800 pb-3">
            <div class="w-2 h-6 bg-financial-accent rounded-full"></div>
            <h2 class="text-xl font-bold text-white">管理员组 <span class="text-slate-500 text-sm font-normal ml-2">Admin Group</span></h2>
          </div>
          <div class="grid gap-3">
            <button v-for="u in adminUsers" :key="u.id" @click="login(u)" 
              class="flex items-center p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-transparent hover:border-financial-accent group">
              <img :src="u.avatar_url" class="w-10 h-10 rounded-full bg-slate-700 mr-3 border border-slate-600" />
              <div class="text-left">
                <div class="text-white font-medium group-hover:text-financial-accent transition">{{ u.username }}</div>
                <div class="text-xs text-slate-500">系统管理员 System Admin</div>
              </div>
            </button>
          </div>
        </div>

        <!-- 普通用户组 -->
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div class="flex items-center space-x-2 mb-6 border-b border-slate-800 pb-3">
            <div class="w-2 h-6 bg-slate-600 rounded-full"></div>
            <h2 class="text-xl font-bold text-white">用户组 <span class="text-slate-500 text-sm font-normal ml-2">Member Group</span></h2>
          </div>
          <div class="grid gap-3">
            <button v-for="u in memberUsers" :key="u.id" @click="login(u)" 
              class="flex items-center p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-transparent hover:border-slate-500 group">
              <img :src="u.avatar_url" class="w-10 h-10 rounded-full bg-slate-700 mr-3 border border-slate-600" />
              <div class="text-left">
                <div class="text-white font-medium group-hover:text-slate-300 transition">{{ u.username }}</div>
                <div class="text-xs text-slate-500">授权成员 Authorized Member</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 主工作台 (Main Workspace) -->
    <template v-else>
      <nav class="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <h1 class="text-xl font-bold text-white tracking-tight">
            sunnynow<span class="text-financial-accent">.net</span>
          </h1>
          <div class="h-4 w-px bg-slate-700"></div>
          <div class="flex items-center space-x-2 text-sm text-slate-400">
            <img :src="currentUser.avatar_url" class="w-5 h-5 rounded-full" />
            <span>{{ currentUser.username }}</span>
            <span class="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] uppercase">{{ currentUser.role }}</span>
          </div>
        </div>
        <button @click="logout" class="text-xs text-slate-500 hover:text-white transition px-3 py-1 border border-slate-800 rounded-lg">
          退出登录 Logout
        </button>
      </nav>

      <main class="flex-1 p-6 max-w-6xl mx-auto w-full">
        <!-- Admin View -->
        <div v-if="currentUser.role === 'admin'" class="space-y-8">
          <section>
            <h2 class="text-2xl font-semibold mb-4 text-white">管理工作台 <span class="text-slate-500 text-lg font-normal ml-2">Admin Dashboard</span></h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <!-- 左侧：发布公告 -->
              <div class="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 class="text-lg font-medium mb-4 text-white">发布公告 <span class="text-slate-500 text-sm font-normal ml-2">Publish Announcement</span></h3>
                <input v-model="newPost.title" placeholder="公告标题 Title" class="w-full bg-slate-800 border border-slate-700 p-2 rounded mb-3 text-white focus:outline-none focus:border-financial-accent" />
                <textarea v-model="newPost.content" placeholder="公告内容 Content" class="w-full bg-slate-800 border border-slate-700 p-2 rounded mb-3 text-white focus:outline-none focus:border-financial-accent" rows="4"></textarea>
                <select v-model="newPost.category" class="w-full bg-slate-800 border border-slate-700 p-2 rounded mb-3 text-white focus:outline-none">
                  <option value="产品发布">产品发布 Product Launch</option>
                  <option value="业绩报告">业绩报告 Performance Report</option>
                  <option value="合规提醒">合规提醒 Compliance Alert</option>
                  <option value="培训通知">培训通知 Training Notice</option>
                  <option value="激励方案">激励方案 Incentive Plan</option>
                  <option value="危机处理">危机处理 Crisis Management</option>
                </select>
                <button @click="publishPost" class="w-full bg-financial-accent hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition">
                  立即发布并广播 Publish & Broadcast
                </button>
              </div>

              <!-- 右侧：群组分发中心 (New) -->
              <div class="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 class="text-lg font-medium mb-4 text-white">群组分发 <span class="text-slate-500 text-sm font-normal ml-2">Group Distribution</span></h3>
                <div class="space-y-3">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-xs text-slate-400">选择分发群组 Select Groups</span>
                    <button @click="toggleAllGroups" class="text-xs text-financial-accent hover:underline">
                      {{ allSelected ? '取消全选' : '全选' }}
                    </button>
                  </div>
                  <div v-for="group in availableGroups" :key="group.id" 
                    class="flex items-center p-2 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition cursor-pointer"
                    @click="toggleGroup(group.id)">
                    <input type="checkbox" :checked="selectedGroups.includes(group.id)" class="mr-3 accent-financial-accent" />
                    <span class="text-sm text-slate-300">{{ group.name }}</span>
                  </div>
                </div>
                <div class="mt-6 p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div class="text-[10px] text-slate-500 uppercase font-bold mb-1">Bot 状态 Bot Status</div>
                  <div class="flex items-center text-xs text-green-400">
                    <span class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    超级群助理-Beta 已就绪
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <!-- 准入审核 (移至下方) -->
          <section>
            <h2 class="text-xl font-semibold mb-4 text-white">准入审核 <span class="text-slate-500 text-base font-normal ml-2">Member Audit</span></h2>
            <div class="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <div v-if="applications.length === 0" class="text-slate-400 italic text-sm text-center py-4">暂无待审核申请 No pending applications.</div>
              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="app in applications" :key="app.id" class="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <div class="flex-1">
                    <span class="text-sm font-medium text-white">{{ app.username }}</span>
                    <div class="text-xs text-slate-400 mt-1">
                      {{ new Date(app.created_at).toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }}
                    </div>
                  </div>
                  <div class="space-x-2">
                    <button @click="audit(app.id, 'approved')" class="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-500">通过</button>
                    <button @click="audit(app.id, 'rejected')" class="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500">拒绝</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-semibold mb-4 text-white">统一反馈看板 <span class="text-slate-500 text-lg font-normal ml-2">Feedback Kanban</span></h2>
            <div class="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-800 text-slate-300">
                  <tr>
                    <th class="p-3">成员 Member</th>
                    <th class="p-3">关联公告 Post</th>
                    <th class="p-3">反馈内容 Feedback</th>
                    <th class="p-3">操作 Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800">
                  <tr v-for="fb in feedbacks" :key="fb.id">
                    <td class="p-3 text-white">{{ fb.username }}</td>
                    <td class="p-3 text-slate-400">{{ fb.post_title }}</td>
                    <td class="p-3 text-slate-400">{{ fb.content }}</td>
                    <td class="p-3"><button class="text-financial-accent hover:underline">回复 Reply</button></td>
                  </tr>
                  <tr v-if="feedbacks.length === 0">
                    <td colspan="4" class="p-8 text-center text-slate-500 italic">暂无反馈记录 No feedback received yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- Member View -->
        <div v-else class="space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold text-white">公告广场 <span class="text-slate-500 text-lg font-normal ml-2">Announcement Square</span></h2>
            <button @click="showApplyModal = true" class="text-sm bg-financial-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">申请入群 Join Group</button>
          </div>

          <div v-if="loading" class="text-center py-10 text-slate-500">正在加载专业资讯... Loading professional feed...</div>
          <div v-else class="grid gap-4">
            <div v-for="post in posts" :key="post.id" class="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-financial-accent transition group">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold text-white group-hover:text-financial-accent transition">{{ post.title }}</h3>
                <span class="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">{{ post.category }}</span>
              </div>
              <p class="text-slate-400 text-sm mb-4 leading-relaxed">{{ post.content }}</p>
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">浏览 {{ post.view_count }} | 回复 {{ post.reply_count }}</span>
                <button @click="openFeedback(post)" class="text-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded transition">提交反馈 Reply</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
    
    <!-- Feedback Modal (New) -->
    <div v-if="showFeedbackModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-white">提交反馈 <span class="text-slate-500 text-base font-normal ml-2">Submit Feedback</span></h3>
          <button @click="showFeedbackModal = false" class="text-slate-500 hover:text-white text-2xl">&times;</button>
        </div>
        <div class="mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
          <div class="text-xs text-slate-500 uppercase font-bold mb-1">关联公告 Related Post</div>
          <div class="text-white font-medium">{{ activePost?.title }}</div>
        </div>
        <textarea v-model="feedbackText" placeholder="请输入您的反馈内容... Please enter your feedback..." class="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl mb-4 text-white focus:outline-none focus:border-financial-accent" rows="4"></textarea>
        <div class="flex justify-end space-x-3">
          <button @click="showFeedbackModal = false" class="px-4 py-2 text-slate-400 hover:text-white transition">取消 Cancel</button>
          <button @click="submitFeedback" class="bg-financial-accent text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">发送反馈 Send</button>
        </div>
      </div>
    </div>

    <div v-if="showApplyModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full">
        <h3 class="text-xl font-bold text-white mb-4">提交入群申请 <span class="text-slate-500 text-base font-normal ml-2">Submit Application</span></h3>
        <input v-model="application.username" placeholder="您的姓名 Your Name" class="w-full bg-slate-800 border border-slate-700 p-2 rounded mb-3 text-white" />
        <textarea v-model="application.reason" placeholder="申请理由 Reason for joining..." class="w-full bg-slate-800 border border-slate-700 p-2 rounded mb-4 text-white" rows="3"></textarea>
        <div class="flex justify-end space-x-3">
          <button @click="showApplyModal = false" class="px-4 py-2 text-slate-400 hover:text-white transition">取消 Cancel</button>
          <button @click="submitApplication" class="bg-financial-accent text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">提交申请 Submit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from './api'
import axios from 'axios'

// 状态管理
const currentUser = ref(null)
const loading = ref(true)
const showApplyModal = ref(false)
const showFeedbackModal = ref(false)
const activePost = ref(null)
const feedbackText = ref('')

const posts = ref([])
const applications = ref([])
const feedbacks = ref([])

const newPost = ref({ title: '', content: '', category: '产品发布' })
const application = ref({ username: '', reason: '' })

// --- 分布式群组管理状态 (New) ---
const availableGroups = ref([
  { id: '1', name: '群组-01 (高净值客户)' },
  { id: '2', name: '群组-02 (银行渠道经理)' },
  { id: '3', name: '群组-03 (零售理财组)' },
])
const selectedGroups = ref(['1', '2']) // 默认选中前两个

const allSelected = computed({
  get: () => selectedGroups.value.length === availableGroups.value.length,
  set: (val) => {
    selectedGroups.value = val ? availableGroups.value.map(g => g.id) : []
  }
})

const toggleGroup = (id) => {
  const index = selectedGroups.value.indexOf(id)
  if (index > -1) {
    selectedGroups.value.splice(index, 1)
  } else {
    selectedGroups.value.push(id)
  }
}

const toggleAllGroups = () => {
  allSelected.value = !allSelected.value
}
// ----------------------------

// 模拟登录的用户列表
const adminUsers = ref([
  { id: 'e806c1ab-d659-471a-8e96-18e8d9f91d6e', username: 'Sunny (系统管理员)', role: 'admin', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunny' },
  { id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', username: '区域经理 Manager A', role: 'admin', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ManagerA' },
])

const memberUsers = ref([
  { id: 'f1e2d3c4-b5a6-4b5a-9c8d-7e6f5a4b3c2d', username: '高净值客户 Client 01', role: 'member', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Client01' },
  { id: 'd1c2b3a4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', username: '银行代销经理 Client 02', role: 'member', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Client02' },
  { id: 'b1a2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', username: '零售客户 Client 03', role: 'member', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Client03' },
])

const login = (user) => {
  currentUser.value = user
  fetchData()
}

const logout = () => {
  currentUser.value = null
}

const fetchData = async () => {
  loading.value = true
  try {
    posts.value = await api.getPosts()
    if (currentUser.value && currentUser.value.role === 'admin') {
      applications.value = await api.getApplications()
      feedbacks.value = await api.getFeedback()
    }
  } catch (e) {
    console.error('API Error:', e)
    alert('无法连接到 API 服务器，请检查网络或隧道状态。')
  } finally {
    loading.value = false
  }
}

const audit = async (id, status) => {
  try {
    // 1. 更新申请状态
    await api.updateApplication(id, status)

    // 2. 获取申请详情（用于群组通知）
    const applications = await api.getApplications()
    const app = applications.find(a => a.id === id)
    if (app) {
      // 3. 调用 Bot 通知审核结果
      await axios.post('http://localhost:3000/notify-audit', {
        username: app.username,
        status: status,
        groupId: '1' // TODO: 实际应用中应从群组关联表中获取
      })
      alert(`审核已通知用户: ${status === 'approved' ? '通过' : '拒绝'}`)
    }

    await fetchData()
  } catch (e) {
    alert('审核失败。Audit failed.')
  }
}

const publishPost = async () => {
  try {
    // 1. 写入数据库 (Persistence)
    await api.createPost({ 
      ...newPost.value, 
      user_id: currentUser.value.id 
    })

    // 2. 分发至选中的模拟微信群 (Broadcast)
    if (selectedGroups.value.length > 0) {
      await axios.post('http://localhost:3000/broadcast', {
        title: newPost.value.title,
        content: newPost.value.content,
        groups: selectedGroups.value
      })
    }

    alert('公告已发布并同步至选定群组！Post published and broadcasted!')
    newPost.value = { title: '', content: '', category: '产品发布' }
    await fetchData()
  } catch (e) {
    console.error('Publish Error:', e)
    alert('发布失败，请检查 Bot 服务是否启动。Error publishing post.')
  }
}

// Removed duplicate audit function
const submitApplication = async () => {
  try {
    await api.submitFeedback({ 
      username: application.value.username, 
      content: `入群申请: ${application.value.reason}`,
      post_id: null 
    })
    alert('申请已提交，请等待审核。Application submitted!')
    showApplyModal.value = false
  } catch (e) {
    alert('提交失败，请重试。Submission failed.')
  }
}

const openFeedback = (post) => {
  activePost.value = post
  feedbackText.value = ''
  showFeedbackModal.value = true
}

const submitFeedback = async () => {
  if (!feedbackText.value.trim()) return
  try {
    await api.submitFeedback({ 
      username: currentUser.value.username, 
      content: feedbackText.value, 
      post_id: activePost.value.id 
    })
    alert('反馈发送成功！Feedback sent!')
    showFeedbackModal.value = false
    feedbackText.value = ''
    await fetchData()
  } catch (e) {
    alert('提交失败，请重试。Submission failed.')
  }
}

onMounted(() => {
})
</script>
