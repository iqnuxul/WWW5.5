🛡️ Guardian Link - 去中心化紧急互助网络

当意外发生时，你从不孤单。

Guardian Link 是一个基于区块链的去中心化紧急情况互助网络，旨在通过社区力量和智能合约自动化，为独居人士、老年人和其她有需要的群体提供 7x24 小时的紧急互助节点。
参与者可以自行将各种紧急凭证和资金加密后去中心化存储，并通过 AI+社区的双重认证，在危机时授予响应者临时的、最小化的访问权限。
在参与者意外失去意识或短期失能时绕过繁琐手续，快速争取最佳治疗方案，最大限度保护参与者生命。

🌟 核心特性

即时紧急响应

多重触发机制：支持一键求救、应急二维码扫描、守护者发起检查
链上任务调度：智能合约自动匹配最近的可用响应者
最小化信息披露：保护用户隐私的同时确保及时援助

社区激励生态

代币激励：响应者通过提供帮助获得 GLT 代币奖励
信誉系统：建立可信的守护者网络
社区治理：守护者共同监督和验证援助过程

技术支持

区块链保障：所有交互透明可审计
智能合约自动化：赏金分配自动执行
去中心化存储：敏感信息加密存储
🚀 快速开始

前置要求

Node.js 18+
Git
MetaMask 钱包
安装步骤

克隆仓库
bash
git clone https://github.com/your-username/guardian-link-demo.git
cd guardian-link-demo
安装依赖
bash
npm install
配置环境
bash
cp .env.example .env

# 编辑 .env 文件，填入你的钱包私钥和 Infura API 密钥

编译合约
bash
npx hardhat compile
部署到本地网络
bash
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
使用流程

对于需要帮助的用户

注册并设置紧急联系人和医疗信息
获取个人应急二维码（可打印随身携带）
在紧急情况下，系统自动或手动触发求助
对于响应者

质押 GLT 代币并完成培训成为认证响应者
在任务大厅接收附近的紧急任务
提供现场协助并提交证明
获得代币奖励和信誉积分
📁 项目结构

text
guardian-link-demo/
├── contracts/ # 智能合约
│ ├── GuardianToken.sol # ERC20 代币合约
│ └── EmergencyTask.sol # 紧急任务管理合约
├── scripts/ # 部署脚本
│ └── deploy.ts # 合约部署脚本
├── test/ # 测试文件
│ └── GuardianLink.test.ts # 核心功能测试
├── frontend/ # 前端应用
│ ├── src/
│ └── public/
└── hardhat.config.ts # Hardhat 配置
🔧 技术架构

智能合约

GuardianToken: 基于 ERC20 的社区激励代币
EmergencyTask: 管理任务生命周期和赏金分配
前端技术栈

Next.js 14 + TypeScript
Tailwind CSS
Wagmi/VIEM for Web3
IPFS for 去中心化存储
开发工具

Hardhat 开发框架
OpenZeppelin 合约库
Ethers.js 以太坊交互
🧪 测试与部署

运行测试套件：

bash
npx hardhat test
部署到 Sepolia 测试网：

bash
npx hardhat run scripts/deploy.ts --network sepolia
🤝 如何贡献

我们欢迎社区贡献！请阅读我们的贡献指南：

Fork 本仓库
创建特性分支 (git checkout -b feature/AmazingFeature)
提交更改 (git commit -m 'Add some AmazingFeature')
推送到分支 (git push origin feature/AmazingFeature)
开启 Pull Request
📄 许可证

本项目采用 MIT 许可证 - 查看 LICENSE 文件了解详情

🆘 紧急情况说明

⚠️ 重要提醒：本项目为技术演示原型，在真实紧急情况下，请优先拨打本地紧急电话（如 120）寻求专业医疗援助。

🙏 致谢

感谢所有为这个项目做出贡献的开发者，特别感谢 Web3 社区的支持和灵感。
