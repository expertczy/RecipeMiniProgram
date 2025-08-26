# Configuration Guide 配置指南

[English](#english) | [中文](#chinese)

---

## English

### 🔧 Configuration Setup

This directory contains configuration files for the Recipe Mini Program. To get started:

1. **Copy the example configuration**
   ```bash
   cp config.example.js config.js
   ```

2. **Update the configuration values**
   - Open `config.js`
   - Update `API_ENDPOINT` with your actual AWS API Gateway URL
   - Modify other settings as needed

3. **Never commit `config.js`**
   - The `config.js` file is already in `.gitignore`
   - Only `config.example.js` should be committed to version control

### 📋 Configuration Options

#### API Configuration
- `API_ENDPOINT`: Your AWS API Gateway endpoint URL
- Example: `https://your-api.execute-api.region.amazonaws.com`

#### App Configuration
- `APP_NAME`: Application name
- `APP_VERSION`: Application version
- `ENABLE_LOGGING`: Enable/disable logging
- `ENABLE_DEBUG`: Enable/disable debug mode

#### UI Configuration
- `DEFAULT_PAGE_SIZE`: Number of items per page
- `ANIMATION_DURATION`: Animation duration in milliseconds

#### Image Configuration
- `IMAGE_QUALITY`: Image quality (0.0 to 1.0)
- `MAX_IMAGE_SIZE`: Maximum image size in bytes

#### Cache Configuration
- `CACHE_EXPIRY`: Cache expiration time in milliseconds

### 🔒 Security Notes

- **Never commit sensitive information** like API keys or endpoints
- **Use environment variables** for production deployments
- **Keep `config.example.js` updated** with all available options
- **Validate configuration** before deployment

---

## Chinese

### 🔧 配置设置

此目录包含菜谱小程序的配置文件。开始使用：

1. **复制示例配置文件**
   ```bash
   cp config.example.js config.js
   ```

2. **更新配置值**
   - 打开 `config.js`
   - 将 `API_ENDPOINT` 更新为你的实际 AWS API Gateway URL
   - 根据需要修改其他设置

3. **切勿提交 `config.js`**
   - `config.js` 文件已在 `.gitignore` 中
   - 只有 `config.example.js` 应该提交到版本控制

### 📋 配置选项

#### API配置
- `API_ENDPOINT`: 你的 AWS API Gateway 端点 URL
- 示例: `https://your-api.execute-api.region.amazonaws.com`

#### 应用配置
- `APP_NAME`: 应用名称
- `APP_VERSION`: 应用版本
- `ENABLE_LOGGING`: 启用/禁用日志
- `ENABLE_DEBUG`: 启用/禁用调试模式

#### UI配置
- `DEFAULT_PAGE_SIZE`: 每页项目数量
- `ANIMATION_DURATION`: 动画持续时间（毫秒）

#### 图片配置
- `IMAGE_QUALITY`: 图片质量（0.0 到 1.0）
- `MAX_IMAGE_SIZE`: 最大图片大小（字节）

#### 缓存配置
- `CACHE_EXPIRY`: 缓存过期时间（毫秒）

### 🔒 安全注意事项

- **切勿提交敏感信息**，如 API 密钥或端点
- **生产环境部署时使用环境变量**
- **保持 `config.example.js` 更新**，包含所有可用选项
- **部署前验证配置**

---

## 📝 Example Configuration 配置示例

```javascript
export const config = {
  // API Configuration
  API_ENDPOINT: 'https://your-api.execute-api.region.amazonaws.com',
  
  // App Configuration
  APP_NAME: 'Recipe Mini Program',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_LOGGING: true,
  ENABLE_DEBUG: false,
  
  // UI Configuration
  DEFAULT_PAGE_SIZE: 20,
  ANIMATION_DURATION: 300,
  
  // Image Configuration
  IMAGE_QUALITY: 0.8,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Cache Configuration
  CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
}
```
