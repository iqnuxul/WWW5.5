// hardhat.config.ts
import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

// ✅ 这里先直接写死，赶进度用
// 👉 把下面这两个改成你自己的
const SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/g8FsjeNa9T0AcaeNC-Vr1";
const PRIVATE_KEY = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // 可以带 0x，也可以不带

export default defineConfig({
  solidity: "0.8.20",   // 和你合约 pragma solidity ^0.8.20 一致

  networks: {
    // 本地 Hardhat 节点（npx hardhat node）
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
    },

    // 内存网络
    hardhat: {
      type: "edr-simulated",
    },

    // ✅ Sepolia 测试网
    sepolia: {
      type: "http",
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
});

