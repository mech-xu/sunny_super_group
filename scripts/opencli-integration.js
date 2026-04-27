#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  DEV_SERVER_URL: 'http://localhost:5173', // Vite 默认端口
  DOCS_OUTPUT_DIR: './docs/reference',
  DEBUG_OUTPUT_DIR: './debug'
};

/**
 * 验证本地开发服务器状态（使用curl替代antigravity）
 */
function checkDevServerStatus() {
  console.log('🔍 检查本地开发服务器状态...');
  
  try {
    // 使用 curl 检查服务器是否响应
    const result = execSync(`curl -s --head ${CONFIG.DEV_SERVER_URL} | head -n 1`, { 
      encoding: 'utf8' 
    });
    
    if (result.includes('200 OK') || result.includes('304')) {
      console.log(`✅ 开发服务器正常运行: ${CONFIG.DEV_SERVER_URL}`);
      return true;
    } else {
      console.log(`❌ 开发服务器响应异常: ${result.trim()}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 检查开发服务器失败: ${error.message}`);
    return false;
  }
}

/**
 * 获取网页内容用于调试（使用web read）
 */
function capturePageContent() {
  console.log('📸 捕获页面内容...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(CONFIG.DEBUG_OUTPUT_DIR, `page-content-${timestamp}.md`);
    
    // 确保调试目录存在
    if (!fs.existsSync(CONFIG.DEBUG_OUTPUT_DIR)) {
      fs.mkdirSync(CONFIG.DEBUG_OUTPUT_DIR, { recursive: true });
    }
    
    // 使用 web read 获取页面内容
    execSync(`opencli web read --url "${CONFIG.DEV_SERVER_URL}" --output "${CONFIG.DEBUG_OUTPUT_DIR}" --stdout false --wait 5`, { 
      stdio: 'inherit' 
    });
    
    console.log(`✅ 页面内容已保存到调试目录`);
    return outputPath;
  } catch (error) {
    console.log(`❌ 捕获页面内容失败: ${error.message}`);
    return null;
  }
}

/**
 * 抓取技术文档参考
 * @param {string} url - 文档URL
 * @param {string} name - 文档名称
 */
function fetchTechnicalDocs(url, name) {
  console.log(`📚 抓取技术文档: ${name}`);
  
  try {
    // 确保文档目录存在
    if (!fs.existsSync(CONFIG.DOCS_OUTPUT_DIR)) {
      fs.mkdirSync(CONFIG.DOCS_OUTPUT_DIR, { recursive: true });
    }
    
    // 使用 web read 抓取文档
    execSync(`opencli web read --url "${url}" --output "${CONFIG.DOCS_OUTPUT_DIR}" --stdout false --wait 3`, { 
      stdio: 'inherit' 
    });
    
    console.log(`✅ 技术文档已保存到: ${CONFIG.DOCS_OUTPUT_DIR}`);
    return true;
  } catch (error) {
    console.log(`❌ 抓取技术文档失败: ${error.message}`);
    return false;
  }
}

/**
 * CI/CD 集成的主函数
 */
async function main() {
  const action = process.argv[2] || 'help';
  
  switch (action) {
    case 'check-dev':
      return checkDevServerStatus();
      
    case 'capture-page':
      return capturePageContent();
      
    case 'fetch-docs':
      const url = process.argv[3];
      const name = process.argv[4] || 'reference';
      if (!url) {
        console.log('❌ 请提供文档URL: npm run opencli fetch-docs <url> [name]');
        process.exit(1);
      }
      return fetchTechnicalDocs(url, name);
      
    case 'ci-validate':
      // CI/CD验证流程
      console.log('🚀 OpenCLI CI/CD 验证流程');
      console.log('=========================');
      
      // 1. 检查开发服务器
      const serverOk = checkDevServerStatus();
      if (!serverOk) {
        console.log('⚠️  开发服务器未运行，跳过页面内容捕获');
      } else {
        // 2. 捕获页面内容
        await capturePageContent();
      }
      
      // 3. 抓取必要的参考文档（在CI中可能不需要，但保留选项）
      console.log('\n📝 注意: 在CI环境中，文档抓取步骤已跳过');
      console.log('   如需启用，请在workflow中取消注释相关步骤');
      
      console.log('\n✅ OpenCLI CI/CD 验证完成!');
      return true;
      
    default:
      console.log(`
OpenCLI 集成工具使用说明:

npm run opencli check-dev          # 检查本地开发服务器状态
npm run opencli capture-page      # 捕获当前页面内容为Markdown
npm run opencli fetch-docs <url> [name]  # 抓取技术文档
npm run opencli ci-validate       # 运行完整的CI/CD验证流程

环境变量:
- DEV_SERVER_URL: 开发服务器URL (默认: http://localhost:5173)
- DOCS_OUTPUT_DIR: 文档输出目录 (默认: ./docs/reference)
- DEBUG_OUTPUT_DIR: 调试输出目录 (默认: ./debug)
      `);
      return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { 
  checkDevServerStatus, 
  capturePageContent, 
  fetchTechnicalDocs,
  main 
};