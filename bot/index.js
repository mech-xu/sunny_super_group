const redis = require('redis');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CONFIG = {
  REDIS_URL: 'redis://192.168.2.71:6380',
  API_URL: 'https://demo-api.sunnynow.net',
  BOT_NAME: '超级群助理-Beta'
};

const publisher = redis.createClient({ url: CONFIG.REDIS_URL });
const subscriber = redis.createClient({ url: CONFIG.REDIS_URL });

async function startBot() {
  await publisher.connect();
  await subscriber.connect();
  console.log('🚀 [超级群助理] 已上线，增强模式启动...');

  subscriber.pSubscribe('wechat:group:*', async (message, channel) => {
    console.log(`📩 [收到消息] ${channel}: ${message}`);
    await handleIncomingMessage(channel, message);
  });
}

async function handleIncomingMessage(channel, message) {
  const groupId = channel.split(':').pop();
  
  // 1. 帮助指令
  if (message.includes('#帮助')) {
    await publisher.publish(channel, `[${CONFIG.BOT_NAME}] 帮助中心：\n\n🔹 #申请 [姓名] [理由] - 提交入群申请\n🔹 #公告 - 获取最新通知\n🔹 #客服 - 联系管理员`);
  } 
  // 2. 申请指令 (格式: #申请 张三 投资意向)
  else if (message.startsWith('#申请')) {
    const parts = message.split(' ');
    const username = parts[1] || '匿名用户';
    const reason = parts.slice(2).join(' ') || '未填写理由';
    
    try {
      // 同步到 sunnynow.net 后台
      await axios.post(`${CONFIG.API_URL}/feedback`, {
        username: username,
        content: `【群组${groupId}申请】${reason}`,
        post_id: null
      });
      await publisher.publish(channel, `✅ [${CONFIG.BOT_NAME}] ${username} 您好，您的申请已提交，请等待管理员审核。`);
    } catch (e) {
      await publisher.publish(channel, `❌ [${CONFIG.BOT_NAME}] 提交失败，请稍后重试。`);
    }
  }
  // 3. 公告查询指令
  else if (message.includes('#公告')) {
    try {
      const res = await axios.get(`${CONFIG.API_URL}/posts?order=created_at.desc&limit=3`);
      const posts = res.data;
      let summary = `📢 [${CONFIG.BOT_NAME}] 最新公告汇总：\n\n`;
      posts.forEach((p, i) => {
        summary += `${i+1}. ${p.title}\n   ${p.content.substring(0, 30)}...\n\n`;
      });
      await publisher.publish(channel, summary);
    } catch (e) {
      await publisher.publish(channel, `❌ [${CONFIG.BOT_NAME}] 获取公告失败。`);
    }
  }
}

// WebUI 触发的广播
app.post('/broadcast', async (req, res) => {
  const { title, content, groups } = req.body;
  const results = [];
  for (const groupId of groups) {
    const channel = `wechat:group:${groupId}`;
    const message = `🔔 [${CONFIG.BOT_NAME} 通知]\n\n【${title}】\n${content}`;
    await publisher.publish(channel, message);
    results.push({ groupId, status: 'sent' });
  }
  res.json({ success: true, delivered: results });
});

// 新增：审核结果通知接口 (由 WebUI 调用)
app.post('/notify-audit', async (req, res) => {
  const { username, status, groupId } = req.body;
  const channel = `wechat:group:${groupId}`;
  const msg = status === 'approved' 
    ? `🎉 [${CONFIG.BOT_NAME}] ${username} 您好，您的入群申请已通过！欢迎加入。`
    : `⚠️ [${CONFIG.BOT_NAME}] ${username} 您好，很抱歉您的申请未通过审核。`;
  
  await publisher.publish(channel, msg);
  res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🌐 [Bot API] 监听端口 ${PORT}, 等待指令...`);
  startBot().catch(console.error);
});
