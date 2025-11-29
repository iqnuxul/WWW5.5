// pages/herstory.js
import React, { useEffect, useState, useCallback } from "react";
import { BrowserProvider, Contract, keccak256, toUtf8Bytes } from "ethers";
import Header from "../components/Header";

// 合约地址（保持不变）
const HERSTORY_ADDRESS = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

// 从 Hardhat artifacts 导入 ABI
import HerStoryArtifact from "../artifacts/contracts/HerStory.sol/HerStory.json";
const HERSTORY_ABI = HerStoryArtifact.abi;

const RESONANCE_TYPES = [
  { value: 0, label: "Support", emoji: "🤝" },
  { value: 1, label: "Empathy", emoji: "💗" },
  { value: 2, label: "Solidarity", emoji: "🕯️" },
  { value: 3, label: "Recognition", emoji: "👀" },
  { value: 4, label: "Healing", emoji: "🌱" },
];

export default function HerStoryPage() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loadingContract, setLoadingContract] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("diary");
  // 新增：正文内容
  const [storyContent, setStoryContent] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [recentNarratives, setRecentNarratives] = useState([]);
  const [highResonanceNarratives, setHighResonanceNarratives] = useState([]);
  const [sealedNarratives, setSealedNarratives] = useState([]);
  const [loadingNarratives, setLoadingNarratives] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [resonanceSelection, setResonanceSelection] = useState({});

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [error, setError] = useState("");
  const [txMessage, setTxMessage] = useState("");

  const shortAddr = (addr) => (addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "");

  const formatDate = (ts) => {
    const n = Number(ts);
    if (!n) return "-";
    return new Date(n * 1000).toLocaleString();
  };

  const truncateHash = (h) => {
    if (!h) return "";
    if (h.length <= 20) return h;
    return h.slice(0, 10) + "..." + h.slice(-6);
  };

  const initContract = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        setError("No wallet detected. Please install MetaMask.");
        return;
      }
      if (!HERSTORY_ADDRESS) {
        setError("HerStory contract address not configured.");
        return;
      }

      setLoadingContract(true);
      setError("");
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);

      const c = new Contract(HERSTORY_ADDRESS, HERSTORY_ABI, signer);
      setContract(c);
      setTxMessage("Connected to HerStory ✅");
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to connect.");
    } finally {
      setLoadingContract(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const handler = (accounts) => setAccount(accounts[0] || null);
    window.ethereum.on("accountsChanged", handler);
    return () => window.ethereum.removeListener("accountsChanged", handler);
  }, []);

  useEffect(() => {
    (async () => {
      if (typeof window === "undefined" || !window.ethereum) return;
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts && accounts.length > 0 && HERSTORY_ADDRESS) {
          const signer = await provider.getSigner();
          setAccount(accounts[0]);
          const c = new Contract(HERSTORY_ADDRESS, HERSTORY_ABI, signer);
          setContract(c);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const loadAllData = useCallback(async () => {
    if (!contract) return;
    try {
      setLoadingNarratives(true);
      setError("");

      const recentIds = await contract.getRecentNarratives(20);
      const recentArr = [];
      for (let i = 0; i < recentIds.length; i++) {
        const id = Number(recentIds[i]);
        const info = await contract.getNarrativeInfo(id);
        recentArr.push({
          id,
          author: info[1],
          contentHash: info[2],
          isEncrypted: info[3],
          status: Number(info[4]),
          timestamp: Number(info[5]),
          attestationCount: Number(info[6]),
          resonanceScore: Number(info[7]),
          title: info[8],
          narrativeType: info[9],
        });
      }
      setRecentNarratives(recentArr);

      const highIds = await contract.getHighResonanceNarratives(5);
      const highArr = [];
      for (let i = 0; i < highIds.length; i++) {
        const id = Number(highIds[i]);
        const info = await contract.getNarrativeInfo(id);
        highArr.push({
          id,
          author: info[1],
          contentHash: info[2],
          isEncrypted: info[3],
          status: Number(info[4]),
          timestamp: Number(info[5]),
          attestationCount: Number(info[6]),
          resonanceScore: Number(info[7]),
          title: info[8],
          narrativeType: info[9],
        });
      }
      setHighResonanceNarratives(highArr);

      const sealed = recentArr.filter((n) => n.isEncrypted);

      setSealedNarratives(sealed);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load narratives.");
    } finally {
      setLoadingNarratives(false);
    }
  }, [contract]);

  const loadStats = useCallback(
    async (addr) => {
      if (!contract || !addr) return;
      try {
        setLoadingStats(true);
        setError("");
        const res = await contract.getNarrativeStats(addr);
        setStats({
          totalCreated: Number(res[0]),
          totalAttested: Number(res[1]),
          totalResonated: Number(res[2]),
          totalResonanceReceived: Number(res[3]),
        });
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load stats.");
      } finally {
        setLoadingStats(false);
      }
    },
    [contract]
  );

  useEffect(() => {
    if (contract) {
      loadAllData();
      if (account) loadStats(account);
    }
  }, [contract, account, loadAllData, loadStats]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!contract || !account) {
      setError("Please connect wallet first.");
      return;
    }
    if (!storyContent.trim()) {
      setError("Please write your story content before minting.");
      return;
    }

    try {
      setPublishing(true);
      setTxMessage("");
      setError("");

      // 在前端自动计算正文的 keccak256 哈希，作为 _contentHash 写入合约
      const content = storyContent.trim();
      const contentHash = keccak256(toUtf8Bytes(content));

      const tx = await contract.recordNarrative(
        contentHash,
        isEncrypted,
        newTitle.trim(),
        newType.trim()
      );
      setTxMessage("Minting your narrative SBF...");
      await tx.wait();
      setTxMessage("Narrative minted successfully ✨");

      // 重置表单
      setStoryContent("");
      setNewTitle("");
      setNewType("diary");
      setIsEncrypted(false);

      await loadAllData();
      await loadStats(account);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to mint narrative.");
    } finally {
      setPublishing(false);
    }
  };

  const handleAttest = async (id) => {
    if (!contract || !account) {
      setError("Please connect wallet first.");
      return;
    }
    try {
      setActionLoadingId(id);
      setTxMessage("");
      setError("");
      const tx = await contract.attestNarrative(id);
      setTxMessage("Witnessing...");
      await tx.wait();
      setTxMessage("Witnessed 🪞");
      await loadAllData();
      await loadStats(account);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to attest.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResonate = async (id) => {
    if (!contract || !account) {
      setError("Please connect wallet first.");
      return;
    }
    const selected = resonanceSelection[id];
    if (selected === undefined || selected === null) {
      setError("Please choose a resonance type first.");
      return;
    }

    try {
      setActionLoadingId(id);
      setTxMessage("");
      setError("");
      const tx = await contract.resonateWithNarrative(id, selected);
      setTxMessage("Resonating...");
      await tx.wait();
      setTxMessage("Resonance sent 💗");
      await loadAllData();
      await loadStats(account);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to resonate.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const activePublicNarratives = recentNarratives.filter((n) => n.status === 0);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 100%)",
        minHeight: "100vh",
        color: "#8B4513",
      }}
    >
      <Header />

      {/* Hero */}
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
          HERSTORY
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
          “我们不再等待被记录，而是自己书写；我们不再接受评判，而是共同见证。”
        </p>
      </div>

      <main
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "30px 20px 60px 20px",
        }}
      >
        {(error || txMessage || loadingContract) && (
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {loadingContract && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "rgba(255,182,193,0.45)",
                  border: "1px solid #FF69B4",
                  fontSize: "0.9rem",
                }}
              >
                Connecting...
              </div>
            )}
            {txMessage && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "rgba(255,240,245,0.95)",
                  border: "1px solid #FF9BBF",
                  fontSize: "0.9rem",
                  color: "#A0522D",
                }}
              >
                {txMessage}
              </div>
            )}
            {error && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "rgba(255,192,203,0.25)",
                  border: "1px solid #C71585",
                  fontSize: "0.9rem",
                  color: "#8B1A1A",
                }}
              >
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        {/* 上下两排 · 左中右布局 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 20,
            rowGap: 24,
          }}
        >
          {/* Row 1 - Left: Resonance Web */}
          <section
            style={{
              background:
                "linear-gradient(135deg, rgba(255,240,245,0.95) 0%, rgba(255,255,255,0.98) 100%)",
              borderRadius: 16,
              border: "1px solid #FFC0CB",
              padding: 18,
              boxShadow: "0 6px 16px rgba(255,182,193,0.45)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 6,
                fontSize: "1.25rem",
                color: "#C71585",
              }}
            >
               The Resonance Web
            </h2>
            <p
              style={{
                fontSize: "0.86rem",
                color: "#8B4513",
                marginBottom: 12,
                lineHeight: 1.5,
                fontStyle: "italic",
              }}
            >
              叙事不是孤立的文本,而是情感连接的节点。
            </p>

            {loadingNarratives ? (
              <div style={{ fontSize: "0.9rem", marginTop: 10 }}>
                Loading resonance web...
              </div>
            ) : highResonanceNarratives.length === 0 ? (
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#A0522D",
                  padding: 14,
                  textAlign: "center",
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: 10,
                }}
              >
                The web is still forming. Share your story to begin weaving
                connections.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {highResonanceNarratives.slice(0, 5).map((n) => {
                  const accent = "rgba(255,182,193,0.6)";
                  return (
                    <div
                      key={n.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 12,
                        background:
                          "linear-gradient(135deg, rgba(255,228,232,0.9) 0%, rgba(255,255,255,0.98) 100%)",
                        border: `1px solid #FFB6C1`,
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#A0522D",
                          marginBottom: 2,
                        }}
                      >
                        #{n.id} · {n.narrativeType}
                      </div>
                      <div
                        style={{
                          fontSize: "0.96rem",
                          fontWeight: 600,
                          color: "#8B4513",
                          marginBottom: 4,
                        }}
                      >
                        {n.title || "(Untitled)"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "#A0522D",
                          marginBottom: 6,
                        }}
                      >
                        by {shortAddr(n.author)} · {formatDate(n.timestamp)}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          fontSize: "0.78rem",
                        }}
                      >
                        <span
                          style={{
                            background: "rgba(255,255,255,0.9)",
                            padding: "3px 7px",
                            borderRadius: 8,
                          }}
                        >
                          🪞 {n.attestationCount} witnesses
                        </span>
                        <span
                          style={{
                            background: "rgba(255,255,255,0.9)",
                            padding: "3px 7px",
                            borderRadius: 8,
                          }}
                        >
                          💗 {n.resonanceScore} resonance
                        </span>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 10,
                          fontSize: "1.1rem",
                          background: accent,
                          borderRadius: "999px",
                          padding: "2px 6px",
                        }}
                      >
                        💗
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Row 1 - Middle: System Snapshot */}
          <section
            style={{
              background: "rgba(255,255,255,0.98)",
              borderRadius: 16,
              border: "1px solid #FFB6C1",
              padding: 18,
              boxShadow: "0 6px 18px rgba(255,182,193,0.45)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 10,
                fontSize: "1.3rem",
                color: "#C71585",
              }}
            >
              System Snapshot
            </h2>
            <p
              style={{
                fontSize: "0.88rem",
                color: "#8B4513",
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              在传统的 history 叙事中，叙事结构往往由权力占优的一方定义，使历史多由胜利者的视角构成。
              女性、少数者、边缘群体被排除在“可被记录”的范围之外。“她们的故事”往往被沉默、被扭曲、或被遗忘。
              而 HerStory 不是简单的性别反转，它是多声部、非线性、共生性的叙事生态，是一次叙事权的去中心化革命。
              在这个以主观性为价值基础的去中心化社群实验中，每个女性的经验、情绪、视角，都可以以加密形式存在于链上，
              被尊重、被赋值、被看见。每个叙事都是独立节点，无需中心化的“审稿者”。共鸣与认证取代了评判与删改，
              构成了一种去中心化的历史编织。
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                alignItems: "flex-end",
              }}
            >
              <div>
                <div
                  style={{ opacity: 0.7, fontSize: 12, color: "#A0522D" }}
                >
                  Recent Narratives (on-chain)
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#C71585",
                    marginTop: 4,
                  }}
                >
                  {recentNarratives.length}
                </div>
              </div>
              <div>
                <div
                  style={{ opacity: 0.7, fontSize: 12, color: "#A0522D" }}
                >
                  Sealed Narratives
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#C71585",
                    marginTop: 4,
                  }}
                >
                  {sealedNarratives.length}
                </div>
              </div>
              <div>
                <div
                  style={{ opacity: 0.7, fontSize: 12, color: "#A0522D" }}
                >
                  Public Voices in Stream
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#C71585",
                    marginTop: 4,
                  }}
                >
                  {activePublicNarratives.length}
                </div>
              </div>

              <button
                onClick={() => {
                  loadAllData();
                  if (account) loadStats(account);
                }}
                style={{
                  marginLeft: "auto",
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(45deg, #FF69B4, #FFB6C1)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(255,105,180,0.5)",
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </section>

          {/* Row 1 - Right: Sacred Space */}
          <section
            style={{
              background:
                "linear-gradient(135deg, rgba(255,245,247,0.96) 0%, rgba(255,255,255,0.98) 100%)",
              borderRadius: 16,
              border: "1px solid #FFB6C1",
              padding: 18,
              boxShadow: "0 6px 16px rgba(255,182,193,0.45)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 6,
                fontSize: "1.25rem",
                color: "#C71585",
              }}
            >
               Sacred Space
            </h2>
            <p
              style={{
                fontSize: "0.86rem",
                color: "#8B4513",
                marginBottom: 12,
                lineHeight: 1.5,
                fontStyle: "italic",
              }}
            >
              这些故事选择了沉默,但沉默本身也是一种叙事。
            </p>

            {loadingNarratives ? (
              <div style={{ fontSize: "0.9rem", marginTop: 10 }}>
                Loading sealed narratives...
              </div>
            ) : sealedNarratives.length === 0 ? (
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#A0522D",
                  padding: 14,
                  textAlign: "center",
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: 10,
                }}
              >
                No sealed narratives yet. Some stories need time and safety
                before they can be shared.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {sealedNarratives.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.96)",
                      border: "1px solid #FFB6C1",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#A0522D",
                          marginBottom: 2,
                        }}
                      >
                        #{n.id} · {n.narrativeType}
                      </div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: "#8B4513",
                        }}
                      >
                        {n.title || "(Sealed Narrative)"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#A0522D",
                          marginTop: 4,
                        }}
                      >
                        {formatDate(n.timestamp)}
                      </div>
                    </div>
                    <div style={{ fontSize: "1.2rem" }}>🔐</div>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 10,
                background: "rgba(255,240,245,0.9)",
                fontSize: "0.8rem",
                color: "#8B4513",
                lineHeight: 1.5,
              }}
            >
              💡 <strong>About Sealed Narratives:</strong> Authors can grant
              decryption access through off-chain coordination, honoring the
              principle of informed consent.
            </div>
          </section>

          {/* Row 2 - Left: Mint Your Voice */}
          <section
            style={{
              background: "rgba(255,255,255,0.97)",
              borderRadius: 16,
              border: "1px solid #FFB6C1",
              padding: 18,
              boxShadow: "0 6px 16px rgba(255,182,193,0.45)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 6,
                fontSize: "1.25rem",
                color: "#C71585",
              }}
            >
               Mint Your Voice
            </h2>
            <p
              style={{
                fontSize: "0.86rem",
                color: "#8B4513",
                marginBottom: 14,
                lineHeight: 1.5,
              }}
            >
              这不是发帖,而是铸造一个永恒的见证。每个叙事都是一枚{" "}
              <strong>Soulbound NFT</strong> — 永远属于妳,不可转让,不可交易。
            </p>

            <form
              onSubmit={handlePublish}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    color: "#8B4513",
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="A letter to my younger self"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    color: "#8B4513",
                  }}
                >
                  Narrative Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="diary">Diary </option>
                  <option value="poem">Poem </option>
                  <option value="voice">Voice </option>
                  <option value="essay">Essay </option>
                  <option value="memory">Memory </option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* 新增：正文 textarea，用来生成哈希 */}
              <div>
                <label
                  style={{
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    color: "#8B4513",
                  }}
                >
                  Your Story (off-chain content)
                </label>
                <textarea
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  placeholder="Write the story, memory or feeling you want to mint as a Soulbound narrative..."
                  style={{
                    ...inputStyle,
                    minHeight: 120,
                    resize: "vertical",
                    lineHeight: 1.5,
                  }}
                />
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#A0522D",
                    marginTop: 3,
                  }}
                >
                  The story itself is <strong>not</strong> stored on-chain.
                  We compute a keccak256 hash in your browser and only store
                  that hash on-chain. You can keep the full content in your own
                  storage (local file, IPFS, encrypted note, etc.).
                </div>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.84rem",
                  color: "#8B4513",
                  marginTop: 2,
                }}
              >
                <input
                  type="checkbox"
                  checked={isEncrypted}
                  onChange={(e) => setIsEncrypted(e.target.checked)}
                />
                Seal this narrative (encrypted / requires decryption negotiation)
              </label>

              <button
                type="submit"
                disabled={publishing || !contract || !account}
                style={{
                  marginTop: 8,
                  padding: "10px 16px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    contract && account
                      ? "linear-gradient(45deg, #FF69B4, #FFB6C1)"
                      : "#E5E5E5",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: publishing
                    ? "wait"
                    : contract && account
                    ? "pointer"
                    : "not-allowed",
                }}
              >
                {publishing ? "Minting..." : "Mint Narrative SBF"}
              </button>
            </form>
          </section>

          {/* Row 2 - Middle: Your Narrative Footprint */}
          <section
            style={{
              background: "rgba(255,255,255,0.97)",
              borderRadius: 16,
              border: "1px solid #FFB6C1",
              padding: 18,
              boxShadow: "0 6px 16px rgba(255,182,193,0.45)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 6,
                fontSize: "1.25rem",
                color: "#C71585",
              }}
            >
              Your Narrative Footprint
            </h2>
            <p
              style={{
                fontSize: "0.86rem",
                color: "#8B4513",
                marginBottom: 14,
                lineHeight: 1.5,
                fontStyle: "italic",
              }}
            >
              在这里,数字不代表价值高低,而代表关系的深度。
            </p>

            {!account ? (
              <div
                style={{
                  fontSize: "0.9rem",
                  marginTop: 10,
                  textAlign: "center",
                  padding: 16,
                  background: "rgba(255,240,245,0.9)",
                  borderRadius: 10,
                }}
              >
                Connect your wallet to view your narrative footprint.
              </div>
            ) : loadingStats ? (
              <div
                style={{
                  fontSize: "0.9rem",
                  marginTop: 10,
                }}
              >
                Loading your footprint...
              </div>
            ) : !stats ? (
              <div
                style={{
                  fontSize: "0.9rem",
                  marginTop: 10,
                }}
              >
                No data yet.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg, rgba(255,192,203,0.5) 0%, rgba(255,255,255,0.98) 100%)",
                    border: "1px solid #FFB6C1",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#A0522D",
                      marginBottom: 2,
                    }}
                  >
                    Stories You've Minted
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color: "#C71585",
                    }}
                  >
                    {stats.totalCreated}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#8B4513",
                      marginTop: 3,
                    }}
                  >
                    Each one is a permanent part of the collective memory.
                  </div>
                </div>

                <div
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg, rgba(255,182,193,0.45) 0%, rgba(255,255,255,0.98) 100%)",
                    border: "1px solid #FFB6C1",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#A0522D",
                      marginBottom: 2,
                    }}
                  >
                    Stories You've Witnessed
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color: "#C71585",
                    }}
                  >
                    {stats.totalAttested}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#8B4513",
                      marginTop: 3,
                    }}
                  >
                    "I hear you. I see you." — Acts of recognition.
                  </div>
                </div>

                <div
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg, rgba(255,204,213,0.5) 0%, rgba(255,255,255,0.98) 100%)",
                    border: "1px solid #FFB6C1",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#A0522D",
                      marginBottom: 2,
                    }}
                  >
                    Resonances You've Sent
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color: "#C71585",
                    }}
                  >
                    {stats.totalResonated}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#8B4513",
                      marginTop: 3,
                    }}
                  >
                    Support · Empathy · Solidarity · Recognition · Healing
                  </div>
                </div>

                <div
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background:
                      "linear-gradient(135deg, rgba(255,218,230,0.6) 0%, rgba(255,255,255,0.98) 100%)",
                    border: "1px solid #FFB6C1",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#A0522D",
                      marginBottom: 2,
                    }}
                  >
                    Resonance You've Received
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color: "#C71585",
                    }}
                  >
                    {stats.totalResonanceReceived}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#8B4513",
                      marginTop: 3,
                    }}
                  >
                    This is emotional labor made visible and valued.
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Row 2 - Right: Stream of Voices */}
          <section
            style={{
              background: "rgba(255,255,255,0.97)",
              borderRadius: 16,
              border: "1px solid #FFD1DC",
              padding: 18,
              boxShadow: "0 6px 18px rgba(255,209,220,0.45)",
              maxHeight: "520px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 8,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.3rem",
                    color: "#C71585",
                  }}
                >
                   The Stream of Voices
                </h2>
                <p
                  style={{
                    fontSize: "0.84rem",
                    color: "#8B4513",
                    marginTop: 4,
                    fontStyle: "italic",
                  }}
                >
                  叙事不是被写下的过去,而是持续被记录的现在。
                </p>
              </div>
              <button
                onClick={() => loadAllData()}
                style={{
                  fontSize: "0.8rem",
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "1px solid #FFB6C1",
                  background: "#FFF0F5",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Refresh
              </button>
            </div>

            {loadingNarratives ? (
              <div
                style={{
                  marginTop: 10,
                  fontSize: "0.9rem",
                  textAlign: "center",
                }}
              >
                Loading the stream...
              </div>
            ) : activePublicNarratives.length === 0 ? (
              <div
                style={{
                  marginTop: 10,
                  fontSize: "0.9rem",
                  textAlign: "center",
                  padding: 18,
                  background: "rgba(255,240,245,0.8)",
                  borderRadius: 10,
                }}
              >
                The stream is quiet. Be the first to share your voice.
              </div>
            ) : (
              <div
                style={{
                  marginTop: 8,
                  overflowY: "auto",
                  paddingRight: 4,
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 10,
                }}
              >
                {activePublicNarratives.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    style={{
                      borderRadius: 12,
                      padding: 12,
                      border: "1px solid #FFD1DC",
                      background:
                        "linear-gradient(135deg, #FFE4E9 0%, #FFFFFF 100%)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#A0522D",
                            marginBottom: 2,
                          }}
                        >
                          #{n.id} · {n.narrativeType}
                        </div>
                        <div
                          style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "#8B4513",
                          }}
                        >
                          {n.title || "(Untitled Narrative)"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#A0522D",
                      }}
                    >
                      by {shortAddr(n.author)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#A0522D",
                      }}
                    >
                      {formatDate(n.timestamp)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#A0522D",
                      }}
                    >
                      Hash: {truncateHash(n.contentHash)}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        fontSize: "0.8rem",
                        marginTop: 4,
                      }}
                    >
                      <span
                        style={{
                          background: "rgba(255,255,255,0.9)",
                          padding: "3px 8px",
                          borderRadius: 8,
                        }}
                      >
                        🪞 {n.attestationCount}
                      </span>
                      <span
                        style={{
                          background: "rgba(255,255,255,0.9)",
                          padding: "3px 8px",
                          borderRadius: 8,
                        }}
                      >
                        💗 {n.resonanceScore}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        marginTop: 6,
                      }}
                    >
                      <button
                        onClick={() => handleAttest(n.id)}
                        disabled={actionLoadingId === n.id}
                        style={{
                          padding: "7px 10px",
                          borderRadius: 999,
                          border: "none",
                          background: "#FFB6C1",
                          color: "#8B4513",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          cursor:
                            actionLoadingId === n.id ? "wait" : "pointer",
                        }}
                      >
                        {actionLoadingId === n.id ? "..." : "🪞 Witness"}
                      </button>

                      <select
                        value={
                          resonanceSelection[n.id] !== undefined
                            ? resonanceSelection[n.id]
                            : ""
                        }
                        onChange={(e) =>
                          setResonanceSelection((prev) => ({
                            ...prev,
                            [n.id]:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          }))
                        }
                        style={{
                          padding: "7px 8px",
                          borderRadius: 10,
                          border: "1px solid #FFB6C1",
                          fontSize: "0.82rem",
                          background: "#FFF0F5",
                        }}
                      >
                        <option value="">Choose resonance...</option>
                        {RESONANCE_TYPES.map((rt) => (
                          <option key={rt.value} value={rt.value}>
                            {rt.emoji} {rt.label}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleResonate(n.id)}
                        disabled={actionLoadingId === n.id}
                        style={{
                          padding: "7px 10px",
                          borderRadius: 999,
                          border: "none",
                          background: "#FF69B4",
                          color: "white",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          cursor:
                            actionLoadingId === n.id ? "wait" : "pointer",
                        }}
                      >
                        {actionLoadingId === n.id ? "..." : "💗 Resonate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer
        style={{
          marginTop: 40,
          textAlign: "center",
          fontSize: 11,
          color: "#A0522D",
          opacity: 0.85,
          paddingBottom: 30,
          lineHeight: 1.8,
        }}
      >
        HerStory不是被写下的过去，而是持续被记录的现在。
      </footer>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: 3,
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #FFB6C1",
  outline: "none",
  fontSize: "0.88rem",
  background: "#FFFFFF",
};
