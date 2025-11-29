// pages/herterritory.js
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Header from "../components/Header";

// 从 Hardhat artifacts 导入 ABI
import HerTerritoryArtifact from "../artifacts/contracts/HerTerritory.sol/HerTerritory.json";

const HER_TERRITORY_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const HER_TERRITORY_ABI = HerTerritoryArtifact.abi;

function formatTimestamp(ts) {
  if (!ts) return "-";
  const n = Number(ts);
  if (!n) return "-";
  const d = new Date(n * 1000);
  return d.toLocaleString();
}

// 只读合约：直接连本地 Hardhat 节点，不依赖钱包网络
async function getReadContract() {
  const rpcProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  return new ethers.Contract(
    HER_TERRITORY_ADDRESS,
    HER_TERRITORY_ABI,
    rpcProvider
  );
}

export default function HerTerritoryPage() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

  const [networkError, setNetworkError] = useState("");

  // 合约状态
  const [totalMembers, setTotalMembers] = useState(0);
  const [isMember, setIsMember] = useState(false);
  const [myMemberInfo, setMyMemberInfo] = useState(null);

  const [joining, setJoining] = useState(false);
  const [txMessage, setTxMessage] = useState("");

  // 尝试从 MetaMask 获取当前已连接账号（和 Header 保持联动）
  useEffect(() => {
    const initFromMetamask = async () => {
      if (typeof window === "undefined" || !window.ethereum) return;

      const _provider = new ethers.BrowserProvider(window.ethereum);
      const network = await _provider.getNetwork();

      // 要求是本地 hardhat 网络（chainId 31337）
      if (network.chainId !== 31337n && network.chainId !== 31337) {
        setNetworkError(
          `Current Network chainId=${network.chainId.toString()}，Please switch to the local Hardhat network（RPC http://127.0.0.1:8545, chainId 31337）。`
        );
        return;
      }

      const accounts = await _provider.send("eth_accounts", []);
      if (accounts && accounts.length > 0) {
        const _signer = await _provider.getSigner();
        const _contract = new ethers.Contract(
          HER_TERRITORY_ADDRESS,
          HER_TERRITORY_ABI,
          _signer
        );
        setProvider(_provider);
        setSigner(_signer);
        setContract(_contract);
        setAccount(accounts[0]);
      }

      // 监听账号切换
      window.ethereum.on("accountsChanged", async (accountsChanged) => {
        const acc = accountsChanged[0] || "";
        setAccount(acc);

        if (!acc) {
          setSigner(null);
          setContract(null);
          setIsMember(false);
          setMyMemberInfo(null);
          return;
        }

        const p = new ethers.BrowserProvider(window.ethereum);
        const net = await p.getNetwork();
        if (net.chainId !== 31337n && net.chainId !== 31337) {
          setNetworkError(
            `Current Network chainId=${net.chainId.toString()}，Please switch to the local Hardhat network（RPC http://127.0.0.1:8545, chainId 31337）。`
          );
          setSigner(null);
          setContract(null);
          setIsMember(false);
          setMyMemberInfo(null);
          return;
        }

        const _signer2 = await p.getSigner();
        const _contract2 = new ethers.Contract(
          HER_TERRITORY_ADDRESS,
          HER_TERRITORY_ABI,
          _signer2
        );
        setProvider(p);
        setSigner(_signer2);
        setContract(_contract2);
      });
    };

    initFromMetamask();
  }, []);

  // 手动连接按钮
  const connectWalletHere = async () => {
    setNetworkError("");
    setTxMessage("");
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        setNetworkError("MetaMask not detected. Please install the browser extension.");
        return;
      }
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const network = await _provider.getNetwork();

      if (network.chainId !== 31337n && network.chainId !== 31337) {
        setNetworkError(
          `Current Network chainId=${network.chainId.toString()}，Please switch to the local Hardhat network（RPC http://127.0.0.1:8545, chainId 31337）。`
        );
        return;
      }

      const accounts = await _provider.send("eth_requestAccounts", []);
      const _signer = await _provider.getSigner();
      const _contract = new ethers.Contract(
        HER_TERRITORY_ADDRESS,
        HER_TERRITORY_ABI,
        _signer
      );

      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);
      setAccount(accounts[0]);
    } catch (err) {
      console.error(err);
      setNetworkError(err.message || "Connection Failed");
    }
  };

  // 加载当前账号在 Territory 中的状态（用本地 RPC 读，不依赖钱包网络）
  const loadMyStatus = async (_account) => {
    try {
      const readContract = await getReadContract();

      // 1. 读取 totalMembers（和谁登录无关）
      const tm = await readContract.totalMembers();
      setTotalMembers(Number(tm));

      // 2. 如果没有账号，就只展示 totalMembers
      if (!_account) {
        setIsMember(false);
        setMyMemberInfo(null);
        return;
      }

      const memberFlag = await readContract.isMember(_account);
      setIsMember(memberFlag);

      if (memberFlag) {
        const info = await readContract.getMember(_account);
        setMyMemberInfo({
          id: Number(info.id),
          wallet: info.wallet,
          joinTime: Number(info.joinTime),
          isActive: info.isActive,
        });
      } else {
        setMyMemberInfo(null);
      }
    } catch (err) {
      console.error("loadMyStatus error:", err);

      if (err.code === "BAD_DATA") {
        setNetworkError(
          "Failed to decode return data when calling the contract. Please ensure your local Hardhat node is running (npx hardhat node) and the contract address matches the one in the frontend"
        );
      }
    }
  };

  // account 或页面初始化时自动加载状态
  useEffect(() => {
    loadMyStatus(account);
  }, [account]);

  // 调用 joinCommunity（需要钱包签名）
  const handleJoin = async () => {
    if (!contract || !account) {
      setTxMessage("Please connect your wallet first");
      return;
    }
    setTxMessage("");
    setJoining(true);
    try {
      const tx = await contract.joinCommunity();
      setTxMessage("Transaction sent. Awaiting confirmation...");
      await tx.wait();
      setTxMessage("Successfully Joined! 🎉");
      await loadMyStatus(account);
    } catch (err) {
      console.error(err);
      if (err.code === "BAD_DATA") {
        setTxMessage(
          "Transaction sent to the wrong network or address. Please ensure your wallet is connected to the local Hardhat network (chainId 31337) and refresh the page."
        );
      } else {
        setTxMessage(err.reason || err.message || "Join Failed");
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 100%)",
        minHeight: "100vh",
        color: "#8B4513",
      }}
    >
      {/* 顶部导航 */}
      <Header />

      {/* 顶部模块标题 */}
      <div
        style={{
          padding: "60px 20px 20px 20px",
          textAlign: "center",
          borderBottom: "2px solid #FFB6C1",
          background:
            "linear-gradient(135deg, #FFB6C1 0%, #FFD1DC 50%, #FFE4E9 100%)",
          boxShadow: "0 4px 20px rgba(255, 105, 180, 0.25)",
        }}
      >
        <h1
          style={{
            fontSize: "5.5rem",
            marginTop: 0,
            marginBottom: "10px",
            fontWeight: "800",
            color: "white",
            textShadow: "2px 2px 4px rgba(139, 69, 19, 0.35)",
            letterSpacing: "1px",
          }}
        >
          Her Territory
        </h1>
        <p
          style={{
            fontSize: "1.3rem",
            margin: 0,
            color: "rgba(255,255,255,0.95)",
            maxWidth: 720,
            marginInline: "auto",
            lineHeight: 1.6,
          }}
        >
          “归属与信任先于交易，身份先于价值构建。”
        </p>
      </div>

      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "30px 20px 60px 20px",
        }}
      >
        {networkError && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #FF7F7F",
              background: "rgba(255,127,127,0.12)",
              fontSize: 13,
              color: "#8B0000",
            }}
          >
            {networkError}
          </div>
        )}

        {/* 系统概览卡片 */}
        <section
          style={{
            marginBottom: 30,
            padding: 20,
            borderRadius: 20,
            background: "rgba(255,255,255,0.7)",
            border: "1px solid #FFB6C1",
            boxShadow: "0 12px 30px rgba(255,182,193,0.4)",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              marginTop: 0,
              marginBottom: 10,
              color: "#FF69B4",
            }}
          >
            System Snapshot
          </h2>
          <p
            style={{
              fontSize: 16,
              marginBottom: 16,
              lineHeight: 1.6,
              color: "#A0522D",
            }}
          >
            Her Territory 作为整个 Her Utopia 的 身份根层（Identity Root Layer），为每一位加入者创建一条不可转让、不可买卖、不可操控的链上成员记录。在 Her Utopia 中，身份不是资产，也不是权限，更不是一种可被授予的资格。身份是一种关系性存在。它来自主体的自我声明，来自共同体的承认，来自彼此之间的信任结构，而非来自权力的审批。
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            <div>
              <div style={{ opacity: 0.7, fontSize: 13 }}>Total Members</div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#8B4513",
                  marginTop: 4,
                }}
              >
                {totalMembers}
              </div>
            </div>
            <div>
              <div style={{ opacity: 0.7, fontSize: 13 }}>My Status</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginTop: 4,
                  color: "#A0522D",
                }}
              >
                {account
                  ? isMember
                    ? "✅ Joined · SBT Holder"
                    : "Join Now"
                  : "Connect Walllet"}
              </div>
            </div>
            {!account && (
              <button
                onClick={connectWalletHere}
                style={{
                  marginLeft: "auto",
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(45deg, #FF69B4, #FFB6C1, #FFD1DC)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(255,105,180,0.45)",
                }}
              >
                🔗 Connect Walllet
              </button>
            )}
          </div>
        </section>

        {/* 我的身份 + 加入按钮 */}
        <section
          style={{
            marginBottom: 30,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: 24,
          }}
        >
          {/* 加入 / 文案卡 */}
          <div
            style={{
              padding: 22,
              borderRadius: 20,
              background:
                "linear-gradient(135deg, #FFE4E9 0%, #FFF0F5 100%)",
              border: "1px solid #FFB6C1",
            }}
          >
            <h2
              style={{
                fontSize: 20,
                marginTop: 0,
                marginBottom: 10,
                color: "#FF69B4",
              }}
            >
              Join HerTerritory
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                marginBottom: 18,
                color: "#A0522D",
              }}
            >
              在 HerTerritory 中，身份不是权力授予，而是自我声明与彼此承认。点击下方按钮，妳将：
              <br />
              · 在链上写入一条不可转让的成员记录
              <br />
              · 获得一枚原生 SBT（Soulbound Token）
              <br />
              · 成为 HerEconomy / HerCommons / HerStory / HerProtocol / HerDebug 的合法参与者
              <br />
              · 表达一件事：我在这里，我属于这里
            </p>

            <button
              onClick={handleJoin}
              disabled={!account || joining || isMember}
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                border: "none",
                cursor:
                  !account || joining || isMember ? "not-allowed" : "pointer",
                background: isMember
                  ? "rgba(255,255,255,0.8)"
                  : "linear-gradient(45deg, #FF69B4, #FFB6C1)",
                color: isMember ? "#A9A9A9" : "white",
                fontWeight: 700,
                fontSize: 14,
                boxShadow: isMember
                  ? "none"
                  : "0 6px 18px rgba(255,105,180,0.45)",
              }}
            >
              {isMember
                ? "You are already a member"
                : joining
                ? "Joining…"
                : "✨ Join HerTerritory"}
            </button>

            {txMessage && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: "#A0522D",
                }}
              >
                {txMessage}
              </div>
            )}
          </div>

          {/* 我的链上身份信息 */}
          <div
            style={{
              padding: 22,
              borderRadius: 20,
              background: "rgba(255,255,255,0.6)",
              border: "1px dashed #FFB6C1",
            }}
          >
            <h3
              style={{
                fontSize: 20,
                marginTop: 0,
                marginBottom: 10,
                color: "#FF69B4",
              }}
            >
              My On-chain Identity
            </h3>
            {account ? (
              isMember && myMemberInfo ? (
                <div style={{ fontSize: 16, lineHeight: 1.7 }}>
                  <div>
                    <span style={{ opacity: 0.7 }}>
                      Member ID / SBT tokenId：
                    </span>
                    <strong>{myMemberInfo.id}</strong>
                  </div>
                  <div>
                    <span style={{ opacity: 0.7 }}>Wallet Address：</span>
                    <span style={{ wordBreak: "break-all" }}>
                      {myMemberInfo.wallet}
                    </span>
                  </div>
                  <div>
                    <span style={{ opacity: 0.7 }}>Date Joined：</span>
                    <span>{formatTimestamp(myMemberInfo.joinTime)}</span>
                  </div>
                  <div>
                    <span style={{ opacity: 0.7 }}>Status：</span>
                    <span>
                      {myMemberInfo.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ) : (
                <p
                  style={{
                    fontSize: 15,
                    color: "#A0522D",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Wallet Connected, But Not a Member Yet
                  <br />
                  Click the button on the left to claim your membership and
                  receive a non-transferable identity SBT.
                </p>
              )
            ) : (
              <p
                style={{
                  fontSize: 15,
                  color: "#A0522D",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Wallet Not Connected
                <br />
                Please click the「Connect Wallet」button at the top of the page.
              </p>
            )}
          </div>
        </section>

        {/* 解释 Territory 如何被其他模块使用 */}
        <section
          style={{
            padding: 22,
            borderRadius: 20,
            background: "rgba(255,255,255,0.75)",
            border: "1px solid #FFD1DC",
          }}
        >
          <h2
            style={{
              fontSize: 20,
              marginTop: 0,
              marginBottom: 16,
              color: "#FF69B4",
            }}
          >
            Identity Integration
          </h2>
          <p
            style={{
              fontSize: 16,
              marginTop: 0,
              marginBottom: 18,
              color: "#A0522D",
              lineHeight: 1.6,
            }}
          >
            HerTerritory 并不直接“管理”其他模块，而是作为一个纯粹的身份根层，被 HerEconomy / HerCommons /
            HerStory / HerProtocol / HerDebug 在各自的逻辑中引用。
            <br />
            换句话说，这里只表达一件事：我在这里，我属于这里。其余的权利、行为和关系，都发生在其他模块中。
          </p>

          <div>
            {/* 左侧：合约侧交互说明 */}
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "rgba(255,240,245,0.9)",
                border: "1px dashed #FFB6C1",
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                Integrating with HerTerritory
              </div>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                <li>
                  在 HerEconomy 中：
                  <br />
                  没有主体，就没有“劳动的指向”。
                  <br />
                  情绪劳动、照护劳动、创作劳动只有在“谁付出 —— 谁接收”被清晰承认时，才能被记录成价值。
                  <br />
                  Territory 提供的是这种最小粒度的“身份光点”。
                </li>
                <li style={{ marginTop: 6 }}>
                  在 HerCommons 中：
                  <br />
                  治理不是抽象投票，而是具体的人之间建立的理解。
                  <br />
                  如果没有主体的边界、经验与在场，共识无法形成。
                  <br />
                  Territory 保证每一个发声者都不是匿名力量，而是一个拥有故事的存在。
                </li>
                <li style={{ marginTop: 6 }}>
                  在 HerStory 中：
                  <br />
                  故事不是信息，而是与身体连结的时间痕迹。
                  <br />
                  每一个叙事之所以能被共鸣，是因为它从一个具体主体的经验开始。
                  <br />
                  Territory 为每个故事提供“它属于谁”的坐标。
                </li>
                <li style={{ marginTop: 6 }}>
                  在 HerProtocol 中：
                  <br />
                  亲密关系、协作关系、指导关系都需要两个可见的边界。
                  <br />
                  Territory 为每段关系提供一种“平等起点”——
                  <br />
                  不是拥有者与被拥有者，而是两个自我主权的主体的并列。
                </li>
                <li style={{ marginTop: 6 }}>
                  在 HerDebug 中：
                  <br />
                  “是谁感到不公、是谁指出缺口、是谁提出修复”并不是技术问题，而是一种责任伦理。
                  <br />
                  Territory 让系统能够确切知道：
                  <br />
                  这是一位真实加入者发出的“世界需要被修补”的信号。
                </li>
              </ul>
            </div>
          </div>
        </section>

        <footer
          style={{
            marginTop: 40,
            textAlign: "center",
            fontSize: 11,
            color: "#A0522D",
            opacity: 0.8,
          }}
        >
          身份并非市场化的资产，而是参与、责任与共同体承认的基础。
        </footer>
      </main>
    </div>
  );
}
