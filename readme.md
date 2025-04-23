# 备忘录应用

这是一个基于PWA (Progressive Web Application) 的轻量级备忘录应用，可以在移动设备和桌面环境中使用。

## 功能特点

- **离线工作**：完全支持离线模式，可以在没有网络连接的情况下使用
- **本地存储**：使用IndexedDB实现数据持久化存储
- **优先级分类**：使用红黄蓝三色标记事项的重要性
- **统计功能**：提供笔记数量、分类统计和最近一周新增笔记统计
- **响应式设计**：适配各种屏幕尺寸的设备
- **可安装**：支持添加到主屏幕，体验接近原生应用

## 技术栈

- HTML5 / CSS3
- JavaScript (ES6+)
- IndexedDB
- Service Worker
- Web App Manifest

## 项目结构

```
note-app/
├── index.html              // 主HTML文件
├── manifest.json           // PWA应用清单
├── service-worker.js       // Service Worker实现离线功能
├── css/
│   └── style.css           // 样式表
├── js/
│   ├── app.js              // 主应用逻辑
│   ├── database.js         // 数据库操作
│   ├── notes.js            // 笔记管理功能
│   └── statistics.js       // 统计功能
└── img/
    ├── icon-192.png        // 应用图标
    └── icon-512.png        // 应用图标
```

## 部署指南

### 本地测试

1. 克隆项目到本地：
   ```
   git clone <repository-url>
   ```

2. 使用HTTP服务器提供服务（可以使用VS Code的Live Server插件或Python的SimpleHTTPServer）：
   ```
   # 如果使用Python
   python -m http.server 8080
   ```

3. 在浏览器中访问：`http://localhost:8080`

### 部署到GitHub Pages

1. 创建一个GitHub仓库
2. 将项目推送到仓库：
   ```
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
3. 在GitHub仓库设置中启用GitHub Pages

## 使用指南

1. **添加新笔记**：点击右上角"新建"按钮
2. **编辑笔记**：在笔记卡片上点击"编辑"按钮
3. **删除笔记**：在笔记卡片上点击"删除"按钮
4. **设置优先级**：创建或编辑笔记时选择红色（高）、黄色（中）或蓝色（低）
5. **查看统计**：点击右上角"统计"按钮查看笔记统计信息
6. **安装应用**：在支持PWA的浏览器中，会出现安装提示，可将应用添加到主屏幕

## 未来计划

- 添加笔记标签功能
- 支持笔记搜索
- 增加更多统计图表
- 支持云同步
- 添加提醒功能

## 兼容性

本应用兼容所有支持现代Web标准的浏览器，包括但不限于：

- Chrome (桌面和移动版)
- Firefox (桌面和移动版)
- Safari (桌面和移动版)
- Edge

## 许可证

MIT License