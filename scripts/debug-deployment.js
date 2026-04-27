#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

// 配置
const CONFIG = {
  SUPABASE_URL: process.env.SUPABASE_URL || 'http://localhost:8000',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'anon',
  API_TIMEOUT: 10000
};

async function testApiEndpoints() {
  console.log('🔍 开始API端点测试...');
  
  const endpoints = [
    { path: '/merchants', method: 'GET' },
    { path: '/products', method: 'GET' },
    { path: '/users', method: 'GET' },
    { path: '/orders', method: 'GET' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${CONFIG.SUPABASE_URL}/rest/v1${endpoint.path}`;
      const response = await axios({
        method: endpoint.method,
        url,
        headers: {
          'apikey': CONFIG.SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        timeout: CONFIG.API_TIMEOUT
      });
      
      console.log(`✅ ${endpoint.method} ${endpoint.path} - 状态: ${response.status}, 数据长度: ${response.data.length}`);
    } catch (error) {
      console.log(`❌ ${endpoint.method} ${endpoint.path} - 错误: ${error.message}`);
    }
  }
}

async function testDatabaseConnection() {
  console.log('\n🔍 测试数据库连接...');
  
  try {
    // 测试Supabase健康检查
    const healthUrl = `${CONFIG.SUPABASE_URL}/rest/v1/`;
    const response = await axios.get(healthUrl, {
      headers: { 'apikey': CONFIG.SUPABASE_ANON_KEY },
      timeout: CONFIG.API_TIMEOUT
    });
    
    console.log('✅ 数据库连接正常');
  } catch (error) {
    console.log(`❌ 数据库连接失败: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 SunnyNow 部署调试工具');
  console.log('=========================');
  
  await testDatabaseConnection();
  await testApiEndpoints();
  
  console.log('\n🎉 调试完成!');
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testApiEndpoints, testDatabaseConnection };