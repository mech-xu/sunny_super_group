#!/usr/bin/env node

// 加载环境变量
require('dotenv').config({ path: './frontend/.env' });

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 从环境变量获取配置
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const API_TIMEOUT = parseInt(process.env.VITE_API_TIMEOUT) || 10000;

// 检查是否配置了真实的Supabase凭证
const hasRealCredentials = SUPABASE_URL !== 'https://your-supabase-project.supabase.co' && 
                          SUPABASE_ANON_KEY !== 'your-anon-key-here';

console.log('🔧 API验证配置:');
console.log(`   Supabase URL: ${SUPABASE_URL}`);
console.log(`   Has real credentials: ${hasRealCredentials}`);

if (!hasRealCredentials) {
  console.log('\n⚠️  警告: 使用的是占位符凭证，无法进行真实API测试');
  console.log('   请在 frontend/.env 文件中配置真实的Supabase凭证');
  console.log('   或者设置环境变量 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY\n');
}

// API测试配置
const API_TESTS = [
  {
    name: '获取商家列表',
    endpoint: '/merchants',
    method: 'GET',
    expectedStructure: ['id', 'name', 'contact_person', 'phone']
  },
  {
    name: '获取商品列表',
    endpoint: '/products',
    method: 'GET',
    expectedStructure: ['id', 'name', 'price', 'merchant_id']
  },
  {
    name: '获取用户信息（测试手机号）',
    endpoint: '/users?phone=eq.test123',
    method: 'GET',
    expectedStructure: ['id', 'phone']
  },
  {
    name: '获取订单列表',
    endpoint: '/orders',
    method: 'GET',
    expectedStructure: ['id', 'user_id', 'items', 'total_amount']
  }
];

async function testApiEndpoint(testConfig) {
  try {
    const url = `${SUPABASE_URL}/rest/v1${testConfig.endpoint}`;
    console.log(`🔍 测试: ${testConfig.name}`);
    console.log(`   URL: ${url}`);
    
    // 如果没有真实凭证，跳过实际请求
    if (!hasRealCredentials) {
      console.log(`   ℹ️  跳过测试（使用占位符凭证）`);
      return { success: true, data: [], skipped: true };
    }
    
    const response = await axios({
      method: testConfig.method,
      url,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      timeout: API_TIMEOUT
    });
    
    console.log(`   ✅ 状态码: ${response.status}`);
    console.log(`   ✅ 数据长度: ${Array.isArray(response.data) ? response.data.length : '单个对象'}`);
    
    // 验证数据结构
    if (response.data && response.data.length > 0) {
      const firstItem = Array.isArray(response.data) ? response.data[0] : response.data;
      const missingFields = testConfig.expectedStructure.filter(field => !(field in firstItem));
      
      if (missingFields.length > 0) {
        console.log(`   ⚠️  缺少字段: ${missingFields.join(', ')}`);
        return { success: false, error: `Missing fields: ${missingFields.join(', ')}` };
      } else {
        console.log(`   ✅ 数据结构验证通过`);
        return { success: true, data: response.data };
      }
    } else {
      console.log(`   ℹ️  无数据返回（可能正常）`);
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.log(`   ❌ 错误: ${error.message}`);
    if (error.response) {
      console.log(`      状态码: ${error.response.status}`);
      console.log(`      响应: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return { success: false, error: error.message };
  }
}

async function validateAllApis() {
  console.log('🚀 开始验证所有前端API调用...');
  console.log('================================');
  
  const results = [];
  for (const test of API_TESTS) {
    const result = await testApiEndpoint(test);
    results.push({ ...test, result });
    console.log('');
  }
  
  // 统计结果
  const successful = results.filter(r => r.result.success).length;
  const total = results.length;
  const skipped = results.filter(r => r.result.skipped).length;
  
  console.log('📊 验证结果汇总:');
  console.log(`✅ 成功: ${successful}/${total}`);
  console.log(`❌ 失败: ${total - successful - skipped}/${total}`);
  console.log(`ℹ️  跳过: ${skipped}/${total}`);
  
  if (skipped > 0) {
    console.log('\n📝 注意: 部分测试已跳过，因为使用的是占位符凭证');
    console.log('   要进行完整测试，请配置真实的Supabase凭证');
    return true; // 跳过不算失败
  } else if (successful === total) {
    console.log('\n🎉 所有API调用验证通过！');
    return true;
  } else {
    console.log('\n⚠️  部分API调用存在问题，请检查配置和网络连接。');
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  validateAllApis().catch(console.error);
}

module.exports = { validateAllApis, testApiEndpoint };