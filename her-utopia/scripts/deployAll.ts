// scripts/deployAll.ts
// @ts-nocheck  // 关闭 TS 类型干扰

import { network } from "hardhat";

async function main() {
  // ✅ Hardhat 3 正确获取 ethers 的方式
  const { ethers } = await network.connect();

  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying contracts with:", deployer.address);

  // ✅ ethers v6 查询余额方式
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", balance.toString());

  // ============================
  // 1️⃣ 部署 HerTerritory
  // ============================
  console.log("\nDeploying HerTerritory...");
  const territory = await ethers.deployContract("HerTerritory");
  await territory.waitForDeployment();
  const territoryAddr = await territory.getAddress();
  console.log("✅ HerTerritory deployed to:", territoryAddr);

  // ============================
  // 2️⃣ 部署 HerEconomy
  // ============================
  console.log("\nDeploying HerEconomy...");
  const economy = await ethers.deployContract("HerEconomy", [territoryAddr]);
  await economy.waitForDeployment();
  const economyAddr = await economy.getAddress();
  console.log("✅ HerEconomy deployed to:", economyAddr);

  // ============================
  // 3️⃣ 部署 HerCommons
  // ============================
  console.log("\nDeploying HerCommons...");
  const commons = await ethers.deployContract("HerCommons", [territoryAddr]);
  await commons.waitForDeployment();
  const commonsAddr = await commons.getAddress();
  console.log("✅ HerCommons deployed to:", commonsAddr);

  // ============================
  // 4️⃣ 部署 HerStory
  // ============================
  console.log("\nDeploying HerStory...");
  const story = await ethers.deployContract("HerStory", [territoryAddr]);
  await story.waitForDeployment();
  const storyAddr = await story.getAddress();
  console.log("✅ HerStory deployed to:", storyAddr);

  // ============================
  // 5️⃣ 部署 HerProtocol
  // ============================
  console.log("\nDeploying HerProtocol...");
  const protocol = await ethers.deployContract("HerProtocol", [territoryAddr]);
  await protocol.waitForDeployment();
  const protocolAddr = await protocol.getAddress();
  console.log("✅ HerProtocol deployed to:", protocolAddr);

  // ============================
  // 6️⃣ 部署 HerDebug
  // ============================
  console.log("\nDeploying HerDebug...");
  const multisig = deployer.address;  // 暂用部署者作为 multisig
  const debug = await ethers.deployContract("HerDebug", [territoryAddr, multisig]);
  await debug.waitForDeployment();
  const debugAddr = await debug.getAddress();
  console.log("✅ HerDebug deployed to:", debugAddr);

  // ============================
  // 打印前端用地址
  // ============================
  console.log("\n===============================");
  console.log("✅ ALL CONTRACTS DEPLOYED ✅");
  console.log("===============================");
  console.log("NEXT_PUBLIC_HERTERRITORY_ADDRESS=" + territoryAddr);
  console.log("NEXT_PUBLIC_HERECONOMY_ADDRESS=" + economyAddr);
  console.log("NEXT_PUBLIC_HERCOMMONS_ADDRESS=" + commonsAddr);
  console.log("NEXT_PUBLIC_HERSTORY_ADDRESS=" + storyAddr);
  console.log("NEXT_PUBLIC_HERPROTOCOL_ADDRESS=" + protocolAddr);
  console.log("NEXT_PUBLIC_HERDEBUG_ADDRESS=" + debugAddr);
  console.log("===============================");
}

main().catch((error) => {
  console.error("❌ Deployment failed:");
  console.error(error);
  process.exit(1);
});
