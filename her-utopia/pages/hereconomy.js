// pages/hereconomy.js
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Header from "../components/Header";

// 从 Hardhat artifacts 导入 ABI
import HerEconomyArtifact from "../artifacts/contracts/HerEconomy.sol/HerEconomy.json";

const HER_ECONOMY_ADDRESS = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
const HER_ECONOMY_ABI = HerEconomyArtifact.abi;

const LABOR_TYPES = [
  { value: 0, label: "Emotional " },
  { value: 1, label: "Care " },
  { value: 2, label: "Education " },
  { value: 3, label: "Support " },
  { value: 4, label: "Creative " },
  { value: 5, label: "Others " },
];

function formatTimestamp(ts) {
  if (!ts) return "-";
  const n = Number(ts);
  if (!n) return "-";
  const d = new Date(n * 1000);
  return d.toLocaleString();
}

export default function HerEconomyPage() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

  const [networkError, setNetworkError] = useState("");

  // 账户相关数据
  const [herBalance, setHerBalance] = useState("0");
  const [totalContribution, setTotalContribution] = useState("0");

  // 劳动类型价值系数（目前没用到，但保留以便以后拓展）
  const [laborUnitValues, setLaborUnitValues] = useState({});

  // 记录劳动表单
  const [laborType, setLaborType] = useState(0);
  const [duration, setDuration] = useState("1"); // 设置默认值为1
  const [receiver, setReceiver] = useState("");
  const [cid, setCid] = useState("");
  const [recordTxMsg, setRecordTxMsg] = useState("");
  const [recording, setRecording] = useState(false);

  // 转账表单
  const [toAddress, setToAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferTxMsg, setTransferTxMsg] = useState("");
  const [transferring, setTransferring] = useState(false);

  // 最近劳动记录
  const [myRecords, setMyRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // 初始化：尝试从MetaMask拿到账号并构建 provider / signer / contract
  useEffect(() => {
    const initFromMetamask = async () => {
      if (typeof window === "undefined" || !window.ethereum) return;

      const _provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await _provider.send("eth_accounts", []);
      if (accounts && accounts.length > 0) {
        const _signer = await _provider.getSigner();
        const _contract = new ethers.Contract(
          HER_ECONOMY_ADDRESS,
          HER_ECONOMY_ABI,
          _signer
        );
        setProvider(_provider);
        setSigner(_signer);
        setContract(_contract);
        setAccount(accounts[0]);
      }

      // 监听账号变化
      window.ethereum.on("accountsChanged", async (accountsChanged) => {
        const acc = accountsChanged[0] || "";
        setAccount(acc);
        if (acc && _provider) {
          const _signer2 = await _provider.getSigner();
          const _contract2 = new ethers.Contract(
            HER_ECONOMY_ADDRESS,
            HER_ECONOMY_ABI,
            _signer2
          );
          setSigner(_signer2);
          setContract(_contract2);
        } else {
          setSigner(null);
          setContract(null);
          setHerBalance("0");
          setTotalContribution("0");
          setMyRecords([]);
        }
      });
    };
    initFromMetamask();
  }, []);

  // 页面内连接按钮
  const connectWalletHere = async () => {
    setNetworkError("");
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        setNetworkError("Install MetaMask to continue.");
        return;
      }
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await _provider.send("eth_requestAccounts", []);
      const _signer = await _provider.getSigner();
      const _contract = new ethers.Contract(
        HER_ECONOMY_ADDRESS,
        HER_ECONOMY_ABI,
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

  // 加载与当前账号相关的经济数据
  const loadMyEconomy = async (_account, _contract) => {
    if (!_account || !_contract) return;
    try {
      const [bal, totalVal] = await Promise.all([
        _contract.getHerBalance(_account),
        _contract.getProviderTotalValue(_account),
      ]);
      setHerBalance(bal.toString());
      setTotalContribution(totalVal.toString());
    } catch (err) {
      console.error("loadMyEconomy error:", err);
    }
  };

  // 加载当前用户的最近劳动记录
  const loadMyRecords = async (_account, _contract) => {
    if (!_account || !_contract) return;
    setRecordsLoading(true);
    try {
      const ids = await _contract.getProviderRecords(_account);
      const idsArray = ids.map((x) => Number(x));
      // 只展示最近5条
      const last5 = idsArray.slice(-5).reverse();
      const recs = [];
      for (let id of last5) {
        const r = await _contract.getLaborRecord(id);
        recs.push({
          id: Number(r.id_ ?? r.id), // 兼容不同solc编码
          provider: r.provider,
          receiver: r.receiver,
          laborType: Number(r.laborType),
          duration: r.duration.toString(),
          value: r.value.toString(),
          timestamp: Number(r.timestamp),
          cid: r.cid,
        });
      }
      setMyRecords(recs);
    } catch (err) {
      console.error("loadMyRecords error:", err);
    } finally {
      setRecordsLoading(false);
    }
  };

  // 当 account 和 contract 就绪时，加载数据
  useEffect(() => {
    if (account && contract) {
      loadMyEconomy(account, contract);
      loadMyRecords(account, contract);
    }
  }, [account, contract]);

  // 记录劳动
  const handleRecordLabor = async () => {
    if (!contract || !account) {
      setRecordTxMsg("Please connect your wallet first.");
      return;
    }
    setRecordTxMsg("");
    if (!receiver || !ethers.isAddress(receiver)) {
      setRecordTxMsg("Please enter a valid recipient address.");
      return;
    }

    // 使用默认duration值
    const durationValue = duration || "1";

    setRecording(true);
    try {
      const tx = await contract.recordLabor(
        Number(laborType),
        ethers.toBigInt(durationValue),
        receiver,
        cid || ""
      );
      setRecordTxMsg("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setRecordTxMsg("Recorded successfully! 🌱 Your work has been recognized.");

      // 重置部分表单
      setCid("");
      // 刷新数据
      await loadMyEconomy(account, contract);
      await loadMyRecords(account, contract);
    } catch (err) {
      console.error(err);
      setRecordTxMsg(err.reason || err.message || "Recording Failed");
    } finally {
      setRecording(false);
    }
  };

  // 转移 HER 记账值
  const handleTransfer = async () => {
    if (!contract || !account) {
      setTransferTxMsg("Please connect your wallet first.");
      return;
    }
    setTransferTxMsg("");
    if (!toAddress || !ethers.isAddress(toAddress)) {
      setTransferTxMsg("Please enter a valid recipient address.");
      return;
    }
    if (!transferAmount || Number(transferAmount) <= 0) {
      setTransferTxMsg("Please enter a transfer amount greater than 0.");
      return;
    }

    setTransferring(true);
    try {
      const tx = await contract.transferTokens(
        toAddress,
        ethers.toBigInt(transferAmount)
      );
      setTransferTxMsg("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setTransferTxMsg(
        "Transfer Successful! 💌 This HER is on its way to the person you want to thank."
      );

      setTransferAmount("");
      // 刷新余额
      await loadMyEconomy(account, contract);
    } catch (err) {
      console.error(err);
      setTransferTxMsg(err.reason || err.message || "Transaction failed.");
    } finally {
      setTransferring(false);
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
      <Header />

      {/* 顶部模块标题区 */}
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
          Her Economy
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
          “价值源于流动的关系，而非囤积的权力。”
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

        {/* 经济概览 */}
        <section
          style={{
            marginBottom: 30,
            padding: 20,
            borderRadius: 20,
            background: "rgba(255,255,255,0.75)",
            border: "1px solid #FFC0CB",
            boxShadow: "0 12px 30px rgba(255,192,203,0.45)",
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
              marginBottom: 18,
              lineHeight: 1.7,
              color: "#A0522D",
            }}
          >
            在传统经济体系中，“劳动”往往等同于商品生产，Her Economy 试图打破这种单一划分，
            将女性长期承担却被主流经济学系统性忽视的劳动——情绪劳动、照料劳动、教育劳动、支持劳动、创作劳动等，
            以制度化、参与式、可追溯的方式纳入社区治理与资源分配的核心，通过将“未被看见的女性劳动”
            具象化为链上经济单元，一次性挑战资本主义对价值定义的垄断。
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              alignItems: "flex-end",
            }}
          >
            <div>
              <div style={{ opacity: 0.7, fontSize: 13 }}>My HER Balance</div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#8B4513",
                  marginTop: 4,
                }}
              >
                {herBalance}
              </div>
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.7,
                  marginTop: 2,
                }}
              ></div>
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
                    "linear-gradient(45deg, #FF69B4, #FFC0CB, #FFD1DC)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow: "0 6px 18px rgba(255,105,180,0.45)",
                }}
              >
                🔗 Connect Wallet
              </button>
            )}
          </div>
        </section>

        {/* Record Your Work 和 Say Thank You 并排 */}
        <section
          style={{
            marginBottom: 30,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: 24,
          }}
        >
          {/* 左：记录劳动表单 */}
          <div
            style={{
              padding: 22,
              borderRadius: 20,
              background:
                "linear-gradient(135deg, #FFE4E9 0%, #FFF0F5 100%)",
              border: "1px solid #FFC0CB",
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
              Record Your Work
            </h2>
            <p
              style={{
                fontSize: 16,
                marginTop: 0,
                marginBottom: 16,
                lineHeight: 1.6,
                color: "#A0522D",
              }}
            >
              这里可以记录一段情绪、照料、教育、支持、创作等劳动。
              妳的每一次付出都会被看见、记录，并得到应有的尊重，
              还会获得象征性代币奖励（HER token），
              系统会自动将 HER 记入妳的账户。
            </p>

            {/* laborType */}
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 4,
                color: "#8B4513",
                fontWeight: 600,
              }}
            >
              Type of Work
            </label>
            <select
              value={laborType}
              onChange={(e) => setLaborType(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid #FFC0CB",
                background: "rgba(255,255,255,0.9)",
                fontSize: 13,
                marginBottom: 10,
                color: "#8B4513",
              }}
            >
              {LABOR_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* receiver */}
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 4,
                color: "#8B4513",
                fontWeight: 600,
              }}
            >
              Recipient Address
            </label>
            <input
              type="text"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="0x... Recipient Wallet Address - HerTerritory Members Only"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid #FFC0CB",
                background: "rgba(255,255,255,0.9)",
                fontSize: 13,
                marginBottom: 10,
                color: "#8B4513",
              }}
            />

            {/* cid */}
            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 4,
                color: "#8B4513",
                fontWeight: 600,
              }}
            >
              Description (Optional)
            </label>
            <input
              type="text"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              placeholder="Optional description with IPFS CID or other notes"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid #FFC0CB",
                background: "rgba(255,255,255,0.9)",
                fontSize: 13,
                marginBottom: 14,
                color: "#8B4513",
              }}
            />

            <button
              onClick={handleRecordLabor}
              disabled={!account || recording}
              style={{
                padding: "9px 18px",
                borderRadius: 999,
                border: "none",
                background: !account
                  ? "rgba(255,255,255,0.7)"
                  : "linear-gradient(45deg, #FF69B4, #FFC0CB)",
                color: !account ? "#A9A9A9" : "white",
                fontWeight: 700,
                fontSize: 13,
                cursor: !account || recording ? "not-allowed" : "pointer",
                boxShadow:
                  !account || recording
                    ? "none"
                    : "0 6px 18px rgba(255,105,180,0.45)",
              }}
            >
              {recording ? "recording…" : "🌱 Record Work"}
            </button>

            {recordTxMsg && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#A0522D",
                }}
              >
                {recordTxMsg}
              </div>
            )}
          </div>

          {/* 右：HER 记账值转移 */}
          <div
            style={{
              padding: 22,
              borderRadius: 20,
              background: "rgba(255,255,255,0.85)",
              border: "1px solid #FFC0CB",
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
              Say "Thank You"
            </h3>
            <p
              style={{
                fontSize: 16,
                marginTop: 0,
                marginBottom: 16,
                color: "#A0522D",
                lineHeight: 1.6,
              }}
            >
              HER token代表的是能量的交换，而非治理权力的积累。
              成员之间可以互相转移 HER，以象征性方式进行“回馈”或“感谢”。
              它不是用来攀比财富的工具，而是一种象征彼此支撑的价值标记。
            </p>

            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 4,
                color: "#8B4513",
                fontWeight: 600,
              }}
            >
              Recipient Address
            </label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="0x... — Members only"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid #FFC0CB",
                background: "rgba(255,255,255,0.9)",
                fontSize: 13,
                marginBottom: 10,
                color: "#8B4513",
              }}
            />

            <label
              style={{
                display: "block",
                fontSize: 13,
                marginBottom: 4,
                color: "#8B4513",
                fontWeight: 600,
              }}
            >
              Amount
            </label>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="e.g., 50"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid #FFC0CB",
                background: "rgba(255,255,255,0.9)",
                fontSize: 13,
                marginBottom: 14,
                color: "#8B4513",
              }}
            />

            <button
              onClick={handleTransfer}
              disabled={!account || transferring}
              style={{
                padding: "9px 18px",
                borderRadius: 999,
                border: "none",
                background: !account
                  ? "rgba(255,255,255,0.7)"
                  : "linear-gradient(45deg, #FF69B4, #FFC0CB)",
                color: !account ? "#A9A9A9" : "white",
                fontWeight: 700,
                fontSize: 13,
                cursor: !account || transferring ? "not-allowed" : "pointer",
                boxShadow:
                  !account || transferring
                    ? "none"
                    : "0 6px 18px rgba(255,105,180,0.45)",
              }}
            >
              {transferring ? "transferring…" : "💌 Send HER"}
            </button>

            {transferTxMsg && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#A0522D",
                }}
              >
                {transferTxMsg}
              </div>
            )}
          </div>
        </section>

        {/* 最近劳动记录 */}
        <section
          style={{
            marginBottom: 30,
          }}
        >
          <div
            style={{
              padding: 22,
              borderRadius: 20,
              background: "rgba(255,255,255,0.9)",
              border: "1px dashed #FFC0CB",
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
              Recent Contributions
            </h3>
            <p
              style={{
                fontSize: 16,
                marginTop: 0,
                marginBottom: 10,
                color: "#A0522D",
                lineHeight: 1.5,
              }}
            >
              这里展示妳最近被记录的几次劳动。
              在技术上，它们只是结构体；在伦理上，它们是被承认的照护、支持与创造。
            </p>

            {recordsLoading ? (
              <div style={{ fontSize: 13, color: "#A0522D" }}>
                Loading...
              </div>
            ) : myRecords.length === 0 ? (
              <div
                style={{
                  fontSize: 13,
                  color: "#A0522D",
                  opacity: 0.9,
                }}
              >
                No records yet. Ready to get started? Use the button above to
                record your work and make your mark with HER.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginTop: 4,
                }}
              >
                {myRecords.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: 10,
                      borderRadius: 14,
                      background: "rgba(255,240,245,0.9)",
                      border: "1px solid rgba(255,192,203,0.6)",
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#8B4513",
                        }}
                      >
                        #{r.id} ·{" "}
                        {LABOR_TYPES[r.laborType]?.label || "Unknown"}
                      </span>
                      <span style={{ opacity: 0.7 }}>
                        {formatTimestamp(r.timestamp)}
                      </span>
                    </div>
                    <div>
                      <span style={{ opacity: 0.7 }}>时长：</span>
                      <span>{r.duration}</span>
                    </div>
                    <div>
                      <span style={{ opacity: 0.7 }}>HER 价值：</span>
                      <span>{r.value}</span>
                    </div>
                    <div>
                      <span style={{ opacity: 0.7 }}>接收者：</span>
                      <span style={{ wordBreak: "break-all" }}>
                        {r.receiver}
                      </span>
                    </div>
                    {r.cid && (
                      <div>
                        <span style={{ opacity: 0.7 }}>CID：</span>
                        <span style={{ wordBreak: "break-all" }}>
                          {r.cid}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer
          style={{
            marginTop: 40,
            textAlign: "center",
            fontSize: 11,
            color: "#A0522D",
            opacity: 0.85,
          }}
        >
          HerEconomy 不是资本主义的模拟，而是一场温柔的价值重写。
        </footer>
      </main>
    </div>
  );
}
