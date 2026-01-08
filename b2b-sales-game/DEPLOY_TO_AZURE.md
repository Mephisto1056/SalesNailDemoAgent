# 如何部署到 Azure (最简方案)

由于您的本地环境似乎没有安装 Docker 和 Azure CLI，**最简单**的方法是利用 **GitHub + Azure Web App** 的自动构建功能。

这种方式不需要您在本地构建镜像，只需要将代码推送到 GitHub，Azure 就会自动拉取代码、构建并部署。

## 第一步：推送到 GitHub
1. 在 GitHub 上创建一个新的仓库（Repository）。
2. 将当前代码提交并推送到该仓库：
   ```bash
   git add .
   git commit -m "Initial commit for Azure deployment"
   git branch -M main
   # 替换下面的 URL 为您的仓库地址
   git remote add origin https://github.com/您的用户名/您的仓库名.git
   git push -u origin main
   ```

## 第二步：在 Azure Portal 创建 Web App
1. 登录 [Azure Portal](https://portal.azure.com)。
2. 搜索并选择 **"App Services"** (应用服务)。
3. 点击 **"Create"** -> **"Web App"**。
4. 填写基本信息：
   *   **Subscription**: 您的订阅。
   *   **Resource Group**: 新建一个，例如 `rg-sales-game`。
   *   **Name**: 给您的网站起个名字，例如 `sales-game-demo-001` (这将是您的网址前缀)。
   *   **Publish**: 选择 **"Code"** (代码)。
   *   **Runtime stack**: 选择 **"Node 20 LTS"**。
   *   **Operating System**: 选择 **"Linux"**。
   *   **Region**: 选择离您最近的区域（如 East Asia 或 Japan East）。
   *   **Pricing Plan**: 对于演示，可以选择 **Basic (B1)** 或 **Free (F1)** (如果有)。
5. 点击 **"Review + create"**，然后点击 **"Create"**。

## 第三步：配置自动部署
1. 等待资源创建完成，点击 **"Go to resource"** 进入刚创建的 Web App 页面。
2. 在左侧菜单中找到 **"Deployment"** -> **"Deployment Center"** (部署中心)。
3. 在 **Settings** 标签页：
   *   **Source**: 选择 **GitHub**。
   *   **Organization/Repository/Branch**: 选择您刚才推送的仓库和分支 (main)。
4. 点击顶部的 **"Save"**。
   *   *此时 Azure 会自动在您的 GitHub 仓库中添加一个 Action Workflow，并开始第一次构建和部署。*

## 第四步：配置环境变量 (关键)
为了让游戏能正常运行并连接 AI，您必须配置环境变量。

1. 在 Web App 左侧菜单中，找到 **"Settings"** -> **"Environment variables"**。
2. 点击 **"Add"**，逐个添加以下变量：

| Name | Value | 说明 |
|------|-------|------|
| `AZURE_ANTHROPIC_API_KEY` | `您的Azure密钥...` | **必须**。请查看 `.env.local` 复制。 |
| `GAME_ACCESS_PASSWORD` | `设置一个密码` | **推荐**。用于网站访问保护。 |
| `GAME_MODEL_ID` | `claude-opus-4-5` | (可选) 如果需要指定模型。 |
| `AZURE_ANTHROPIC_BASE_URL` | `您的API地址...` | (可选) 如果默认地址不正确。 |

3. 添加完成后，务必点击底部的 **"Apply"**，然后点击顶部的 **"Confirm"**。
4. 此时应用会自动重启以应用新配置。

## 第五步：验证
1. 在 Web App 的 **Overview** 页面找到 **Default domain** (例如 `https://sales-game-demo-001.azurewebsites.net`)。
2. 点击访问。
3. 如果设置了 `GAME_ACCESS_PASSWORD`，通过弹出的登录框输入密码即可开始游戏！

---
### 常见问题排查

*   **构建失败？**
    *   查看 GitHub 仓库的 "Actions" 标签页，看具体的错误日志。
    *   确保您的 `package.json` 中有 `"build": "next build"` 和 `"start": "next start"` (已确认现有代码包含)。
*   **应用启动错误 (Application Error)？**
    *   在 Azure Portal 左侧菜单找到 **"Monitoring"** -> **"Log stream"**。
    *   查看实时日志，通常是因为环境变量没配置对，或者端口问题（Azure 默认会注入 `PORT` 环境变量，Next.js 会自动识别，无需手动修改）。
