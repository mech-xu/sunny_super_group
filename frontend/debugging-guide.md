# SunnyNow 团购自提系统 - Chrome iPhone 模拟调试指南

## 如何在 Chrome 中模拟 iPhone 设备调试

### 1. 启动本地开发服务器
确保您已经在 `/Users/sunny/sunnynow_local/frontend` 目录下运行了：
```bash
npm run dev
```

### 2. 打开 Chrome 开发者工具
- 打开 Chrome 浏览览器，访问 `http://localhost:5173`
- 按 `F12` 键或右键选择"检查"打开开发者工具

### 3. 启用设备模拟
- 点击开发者工具栏左上角的设备模拟图标（一个手机和平板的图标）
- 或按快捷键 `Ctrl+Shift+M` (Windows/Linux) 或 `Cmd+Shift+M` (Mac)

### 4. 选择 iPhone 设备
在设备下拉列表中，选择以下任一 iPhone 型号：
- iPhone 4
- iPhone 5/SE
- iPhone 6/7/8
- iPhone 6/7/8 Plus
- iPhone X
- iPhone XR
- iPhone 12 Pro
- iPhone 12 Pro Max

### 5. 调试要点
- 检查页面在移动端的显示效果
- 验证按钮和触摸区域的大小是否合适
- 测试页面滚动和交互功能
- 验证响应式布局是否正确

### 6. 调试订单流程
在模拟的iPhone环境中测试以下订单流程：
1. 用户认证流程
2. 商品浏览和选择
3. 购物车操作
4. 订单确认和提交
5. 订单查看和管理

### 7. 常见问题排查
- 如果页面显示异常，检查CSS媒体查询是否正确
- 确保触摸事件在模拟设备上正常工作
- 验证字体大小和间距在小屏幕上是否合适
- 检查表单输入在移动端是否易用

### 8. 调试技巧
- 使用"Element"面板检查和修改DOM元素
- 使用"Console"面板查看JavaScript错误
- 使用"Network"面板监控API请求
- 使用"Sources"面板设置断点进行调试