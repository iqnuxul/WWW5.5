// pages/herprotocol.js
import React, { useEffect, useState, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import Header from "../components/Header";

// 从 Hardhat artifacts 导入 ABI
import HerProtocolArtifact from "../artifacts/contracts/HerProtocol.sol/HerProtocol.json";

const HERPROTOCOL_ADDRESS =
  "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";

// 使用 artifacts 中的 ABI
const HERPROTOCOL_ABI = HerProtocolArtifact.abi;

// enum 显示用
const RELATIONSHIP_TYPE_LABEL = {
  0: "Emotional",
  1: "Collaborative",
  2: "Mentorship",
  3: "Solidarity",
  4: "Romantic",
};

const RELATIONSHIP_TYPE_EMOJI = {
  0: "💗",
  1: "🤝",
  2: "📚",
  3: "🕯️",
  4: "💌",
};

const RELATIONSHIP_STATUS_LABEL = {
  0: "Active",
  1: "Cooldown",
  2: "Terminated",
};

export default function HerProtocolPage() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  const [error, setError] = useState("");
  const [txMessage, setTxMessage] = useState("");

  // 发起关系提案表单
  const [counterparty, setCounterparty] = useState("");
  const [relType, setRelType] = useState(0);
  const [terms, setTerms] = useState("");
  const [proposing, setProposing] = useState(false);

  // 我收到/发起的 Consent 合约
  const [consents, setConsents] = useState([]);
  const [loadingConsents, setLoadingConsents] = useState(false);

  // 我的关系列表
  const [relationships, setRelationships] = useState([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);

  // 边界更新 & 冷却 & 终止操作中的 relationship
  const [updatingBoundaryId, setUpdatingBoundaryId] = useState(null);
  const [newBoundary, setNewBoundary] = useState("");
  const [cooldownWorkingId, setCooldownWorkingId] = useState(null);
  const [terminateWorkingId, setTerminateWorkingId] = useState(null);
  const [terminateReason, setTerminateReason] = useState("");

  // Consent 同意中
  const [consentWorkingId, setConsentWorkingId] = useState(null);

  // ---------------- Tools ----------------

  const shortAddr = (addr) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

  const formatDate = (ts) => {
    const n = Number(ts);
    if (!n) return "-";
    return new Date(n * 1000).toLocaleString();
  };

  const shortenBytes32 = (b) => {
    if (!b) return "";
    if (b.length <= 12) return b;
    return b.slice(0, 8) + "..." + b.slice(-6);
  };

  // ---------------- Contract Init / account changes ----------------

  // 监听 accounts 变化：同时初始化合约
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handler = async (accounts) => {
      const addr = accounts[0] || null;
      setAccount(addr);

      if (!addr || !HERPROTOCOL_ADDRESS) {
        setContract(null);
        return;
      }

      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const c = new Contract(HERPROTOCOL_ADDRESS, HERPROTOCOL_ABI, signer);
        setContract(c);
      } catch (e) {
        console.error(e);
      }
    };

    window.ethereum.on("accountsChanged", handler);
    return () => {
      window.ethereum.removeListener("accountsChanged", handler);
    };
  }, []);

  // 页面首次加载：如果已经连过钱包，就直接实例化
  useEffect(() => {
    (async () => {
      if (typeof window === "undefined" || !window.ethereum) return;
      if (!HERPROTOCOL_ADDRESS) return;
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts && accounts.length > 0) {
          const signer = await provider.getSigner();
          setAccount(accounts[0]);
          const c = new Contract(HERPROTOCOL_ADDRESS, HERPROTOCOL_ABI, signer);
          setContract(c);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // ---------------- Load Consents & Relationships ----------------

  const loadConsents = useCallback(
    async (addr) => {
      if (!contract || !addr) return;
      try {
        setLoadingConsents(true);
        setError("");
        const ids = await contract.getUserConsentContracts(addr);
        const items = [];

        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          const c = await contract.getConsentContract(id);
          const consent = {
            id,
            initiator: c[0],
            counterparty: c[1],
            initiatedConsent: c[2],
            counterpartyConsent: c[3],
            proposedAt: Number(c[4]),
            consentedAt: Number(c[5]),
            relationshipType: Number(c[6]),
            relationshipTerms: c[7],
          };
          items.push(consent);
        }
        setConsents(items);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load consents.");
      } finally {
        setLoadingConsents(false);
      }
    },
    [contract]
  );

  const loadRelationships = useCallback(
    async (addr) => {
      if (!contract || !addr) return;
      try {
        setLoadingRelationships(true);
        setError("");
        const ids = await contract.getUserRelationships(addr);
        const items = [];
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i];
          const r = await contract.getRelationship(id);
          items.push({
            id,
            partyA: r[0],
            partyB: r[1],
            relationshipType: Number(r[2]),
            boundaries: r[3],
            cooldownEnd: Number(r[4]),
            status: Number(r[5]),
            createdAt: Number(r[6]),
            terminatedAt: Number(r[7]),
            terminationReason: r[8],
          });
        }
        setRelationships(items);
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to load relationships.");
      } finally {
        setLoadingRelationships(false);
      }
    },
    [contract]
  );

  useEffect(() => {
    if (contract && account) {
      loadConsents(account);
      loadRelationships(account);
    }
  }, [contract, account, loadConsents, loadRelationships]);

  // ---------------- Actions ----------------

  const handlePropose = async (e) => {
    e.preventDefault();
    if (!contract || !account) {
      setError("Please connect wallet (via header) first.");
      return;
    }
    if (!counterparty || counterparty.length !== 42) {
      setError("Please input a valid counterparty address.");
      return;
    }
    if (!terms.trim()) {
      setError("Please describe relationship terms / boundaries.");
      return;
    }

    try {
      setProposing(true);
      setTxMessage("");
      setError("");
      const tx = await contract.proposeRelationship(
        counterparty.trim(),
        Number(relType),
        terms.trim()
      );
      setTxMessage("Submitting proposal transaction...");
      await tx.wait();
      setTxMessage("Relationship proposal created ✔️");

      setCounterparty("");
      setRelType(0);
      setTerms("");

      await loadConsents(account);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to propose relationship.");
    } finally {
      setProposing(false);
    }
  };

  const handleConsent = async (consentId) => {
    if (!contract || !account) {
      setError("Please connect wallet first.");
      return;
    }
    try {
      setConsentWorkingId(consentId);
      setTxMessage("");
      setError("");
      const tx = await contract.consentToRelationship(consentId);
      setTxMessage("Submitting consent transaction...");
      await tx.wait();
      setTxMessage("Relationship consented & established 💗");
      await loadConsents(account);
      await loadRelationships(account);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to consent to relationship.");
    } finally {
      setConsentWorkingId(null);
    }
  };

  const handleUpdateBoundary = async (relationshipId) => {
    if (!contract || !account) {
      setError("Please connect wallet first.");
      return;
    }
    if (!newBoundary.trim()) {
      setError("Please input new boundary text / CID.");
      return;
    }

    try {
      setUpdatingBoundaryId(relationshipId);
      setTxMessage("");
      setError("");
      const tx = await contract.updateBoundaries(
        relationshipId,
        newBoundary.trim()
      );
      setTxMessage("Updating boundaries on-chain...");
      await tx.wait();
      setTxMessage("Boundaries updated ✔️");
      setNewBoundary("");
      await loadRelationships(account);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to update boundaries.");
    } finally {
      setUpdatingBoundaryId(null);
    }
  };

  const handleInitiateCooldown = async (relationshipId) => {
    if (!contract || !account) {
      setError("Please connect wallet first.");
      return;
    }
    try {
      setCooldownWorkingId(relationshipId);
      setTxMessage("");
      setError("");
      const tx = await contract.initiateCooldown(relationshipId);
      setTxMessage("Initiating cooldown period...");
      await tx.wait();
      setTxMessage("Cooldown started 🧊");
      await loadRelationships(account);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to initiate cooldown.");
    } finally {
      setCooldownWorkingId(null);
    }
  };

  const handleConfirmCooldown = async (relationshipId) => {
    if (!contract || !account) {
      setError("Please connect wallet first.");
      return;
    }
    try {
      setCooldownWorkingId(relationshipId);
      setTxMessage("");
      setError("");
      const tx = await contract.confirmCooldownEnd(relationshipId);
      setTxMessage("Confirming cooldown end...");
      await tx.wait();
      setTxMessage(
        "Cooldown confirmation recorded. If both confirmed, relationship returns to Active."
      );
      await loadRelationships(account);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to confirm cooldown end.");
    } finally {
      setCooldownWorkingId(null);
    }
  };

  const handleTerminate = async (relationshipId) => {
    if (!contract || !account) {
      setError("Please connect wallet first.");
      return;
    }
    if (!terminateReason.trim()) {
      setError("Please provide a termination statement / reason.");
      return;
    }
    try {
      setTerminateWorkingId(relationshipId);
      setTxMessage("");
      setError("");
      const tx = await contract.terminateRelationship(
        relationshipId,
        terminateReason.trim()
      );
      setTxMessage("Submitting termination statement...");
      await tx.wait();
      setTxMessage("Relationship terminated and recorded ⚖️");
      setTerminateReason("");
      await loadRelationships(account);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to terminate relationship.");
    } finally {
      setTerminateWorkingId(null);
    }
  };

  // ---------------- Derived Lists ----------------

  const pendingConsents = consents.filter((c) => !c.counterpartyConsent);

  const incomingPending = account
    ? pendingConsents.filter(
        (c) =>
          c.counterparty &&
          c.counterparty.toLowerCase() === account.toLowerCase()
      )
    : [];

  const outgoingPending = account
    ? pendingConsents.filter(
        (c) =>
          c.initiator && c.initiator.toLowerCase() === account.toLowerCase()
      )
    : [];

  const activeRelationships = relationships.filter((r) => r.status === 0);
  const cooldownRelationships = relationships.filter((r) => r.status === 1);
  const terminatedRelationships = relationships.filter((r) => r.status === 2);

  // ---------------- UI ----------------

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
            fontSize: "5rem",
            marginTop: 0,
            marginBottom: "10px",
            fontWeight: "800",
            color: "white",
            textShadow: "2px 2px 4px rgba(139, 69, 19, 0.35)",
            letterSpacing: "1px",
          }}
        >
          Her Protocol
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
          “从占有的关系，走向共生的连接。”
        </p>
      </div>

      <main
        style={{
          maxWidth: 1600,
          margin: "0 auto",
          padding: "30px 24px 60px 24px",
        }}
      >
        {(error || txMessage) && (
          <div
            style={{
              marginBottom: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {txMessage && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(255, 182, 193, 0.3)",
                  border: "1px solid #FF69B4",
                  fontSize: "0.9rem",
                  color: "#8B0A50",
                }}
              >
                {txMessage}
              </div>
            )}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(255,192,203,0.35)",
                  border: "1px solid #FF1493",
                  fontSize: "0.9rem",
                  color: "#8B0000",
                }}
              >
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        {/* ========= 第一排：Consent Space / System Snapshot / 右侧列 ========= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 20,
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          {/* 1. Consent Space */}
          <section
            style={{
              background: "rgba(255,255,255,0.85)",
              borderRadius: 20,
              border: "1px solid #FFC0CB",
              padding: 22,
              boxShadow: "0 8px 24px rgba(255,182,193,0.35)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 8,
                fontSize: "1.3rem",
                color: "#C71585",
              }}
            >
               Consent Space
            </h2>
            <p
              style={{
                fontSize: "0.88rem",
                color: "#A0522D",
                marginBottom: 14,
                lineHeight: 1.6,
              }}
            >
              关系始于明确的<strong>同意</strong>,而非假设或默认。
              在这里你可以为任何关系起草一份链上同意合约:
              谁与谁、是什么类型、以怎样的边界开始。
              <br />
              关系从这一刻在链上建立，确保双方自由、平等。
            </p>

            <form
              onSubmit={handlePropose}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div>
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#8B4513",
                  }}
                >
                  Counterparty Address
                </label>
                <input
                  type="text"
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  placeholder="0x..."
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #FFB6C1",
                    fontSize: "0.9rem",
                    outline: "none",
                    background: "rgba(255,255,255,0.95)",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#8B4513",
                  }}
                >
                  Relationship Type
                </label>
                <select
                  value={relType}
                  onChange={(e) => setRelType(Number(e.target.value))}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #FFB6C1",
                    background: "#FFF0F5",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                >
                  <option value={0}>Emotional</option>
                  <option value={1}>Collaborative</option>
                  <option value={2}>Mentorship</option>
                  <option value={3}>Solidarity</option>
                  <option value={4}>Romantic</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#8B4513",
                  }}
                >
                  Relationship Boundaries 
                </label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="For example: frequency of communication, emotional boundaries, expectations of time and space, non-negotiable red lines…"
                  rows={4}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "8px 10px",
                    borderRadius: 12,
                    border: "1px solid #FFB6C1",
                    fontSize: "0.9rem",
                    outline: "none",
                    resize: "vertical",
                    background: "rgba(255,255,255,0.95)",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={proposing || !contract || !account}
                style={{
                  marginTop: 6,
                  padding: "10px 16px",
                  borderRadius: 18,
                  border: "none",
                  background: "linear-gradient(45deg,#FF69B4,#FFB6C1)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: proposing ? "wait" : "pointer",
                  opacity: contract && account ? 1 : 0.7,
                }}
              >
                {proposing ? "Submitting…" : "Create Consent Contract"}
              </button>
            </form>
          </section>

          {/* 2. System Snapshot */}
          <section
            style={{
              background:
                "linear-gradient(135deg, rgba(255,228,233,0.95) 0%, rgba(255,240,245,0.95) 100%)",
              borderRadius: 20,
              border: "2px solid #FFD1DC",
              padding: 22,
              boxShadow: "0 8px 24px rgba(255,192,203,0.3)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 10,
                fontSize: "1.4rem",
                color: "#C71585",
                fontWeight: 700,
              }}
            >
               System Snapshot
            </h2>
            <div
              style={{
                fontSize: "0.88rem",
                color: "#8B4513",
                lineHeight: 1.75,
                whiteSpace: "pre-wrap",
              }}
            >
              传统的关系模式往往隐含父权式的权力结构：谁定义关系、谁说了算、谁掌握退出权。这种结构让关系沦为占有与依附，而非共识与协作。
              {"\n\n"}
              <strong>Her Protocol</strong>{" "}
              借鉴女性主义哲学中的核心命题："权力不是拥有，而是流动。"
              在这里，关系的成立与终止不再取决于某一方的意志，而由双方的同意、边界、协商与关怀共同构成。
              {"\n\n"}
              这是一种<strong>去中心化的亲密关系观</strong>：
              {"\n"}• 关系不是绑定或附属，而是两个主体在公共空间中的并行存在
              {"\n"}• 同意不再只是口头承诺，而是可验证的链上共识
              {"\n"}• 边界不是冷漠，而是尊重；不是拒绝连接，而是让连接变得安全
              {"\n\n"}
              <em style={{ color: "#C71585" }}>
                "女性主义不是去性化，而是去权力化。爱与自由在 HerProtocol
                同时被守护。"
              </em>
            </div>
          </section>

          {/* 3. 右侧列：Boundaries Lab + Cooldown Chamber */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Boundaries Lab */}
            <section
              style={{
                background: "rgba(255,255,255,0.9)",
                borderRadius: 20,
                border: "1px solid #FFD1DC",
                padding: 22,
                boxShadow: "0 8px 24px rgba(255,192,203,0.35)",
                flex: 1,
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 8,
                  fontSize: "1.25rem",
                  color: "#C71585",
                }}
              >
                 Boundaries Lab
              </h2>
              <p
                style={{
                  fontSize: "0.86rem",
                  color: "#A0522D",
                  marginBottom: 10,
                  lineHeight: 1.6,
                }}
              >
                边界更新<strong>不需要解释</strong>,只需要声明。
                边界是主体性的声明,也是对"拥有"的否定:
                我可以选择如何与妳连接,也可以选择如何退出。
              </p>

              {loadingRelationships ? (
                <div style={{ fontSize: "0.88rem", marginTop: 6 }}>
                  Loading relationships…
                </div>
              ) : activeRelationships.length === 0 &&
                cooldownRelationships.length === 0 ? (
                <div
                  style={{
                    fontSize: "0.88rem",
                    marginTop: 6,
                    padding: 10,
                    borderRadius: 12,
                    background: "rgba(255, 240, 245, 0.9)",
                    border: "1px dashed #FFB6C1",
                    color: "#A0522D",
                  }}
                >
                  When you have on-chain relationships, this space becomes your "Boundary Lab".
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginTop: 6,
                    maxHeight: 240,
                    overflowY: "auto",
                  }}
                >
                  {[...activeRelationships, ...cooldownRelationships].map(
                    (r) => {
                      const isActive = r.status === 0;
                      return (
                        <div
                          key={r.id}
                          style={{
                            borderRadius: 14,
                            border: "1px solid #FFD1DC",
                            background:
                              "linear-gradient(135deg,#FFE4E9 0%,#FFFFFF 70%)",
                            padding: 10,
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.82rem",
                                color: "#A0522D",
                              }}
                            >
                              {RELATIONSHIP_TYPE_EMOJI[r.relationshipType]}{" "}
                              {RELATIONSHIP_TYPE_LABEL[r.relationshipType]} ·{" "}
                              {shortenBytes32(r.id)}
                            </div>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                padding: "3px 8px",
                                borderRadius: 999,
                                border: "1px solid #FFB6C1",
                                background:
                                  r.status === 0
                                    ? "rgba(255, 182, 193, 0.45)"
                                    : "rgba(255, 192, 203, 0.6)",
                              }}
                            >
                              {RELATIONSHIP_STATUS_LABEL[r.status]}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: "#8B4513",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            Boundaries:{" "}
                            {r.boundaries && r.boundaries.length
                              ? r.boundaries
                              : "(no boundary text recorded yet)"}
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#A0522D",
                            }}
                          >
                            Created: {formatDate(r.createdAt)}
                          </div>

                          {isActive ? (
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                alignItems: "center",
                                marginTop: 4,
                                flexWrap: "wrap",
                              }}
                            >
                              <input
                                type="text"
                                value={
                                  updatingBoundaryId &&
                                  String(updatingBoundaryId) === String(r.id)
                                    ? newBoundary
                                    : ""
                                }
                                onChange={(e) => {
                                  setUpdatingBoundaryId(r.id);
                                  setNewBoundary(e.target.value);
                                }}
                                placeholder="New boundary text / CID"
                                style={{
                                  flex: 1,
                                  minWidth: 140,
                                  padding: "6px 8px",
                                  borderRadius: 999,
                                  border: "1px solid #FFB6C1",
                                  fontSize: "0.78rem",
                                  background: "rgba(255,255,255,0.95)",
                                }}
                              />
                              <button
                                onClick={() => handleUpdateBoundary(r.id)}
                                disabled={
                                  updatingBoundaryId &&
                                  String(updatingBoundaryId) === String(r.id)
                                }
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 999,
                                  border: "none",
                                  background:
                                    "linear-gradient(45deg,#FF69B4,#FFB6C1)",
                                  color: "white",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  cursor:
                                    updatingBoundaryId &&
                                    String(updatingBoundaryId) === String(r.id)
                                      ? "wait"
                                      : "pointer",
                                }}
                              >
                                {updatingBoundaryId &&
                                String(updatingBoundaryId) === String(r.id)
                                  ? "Updating…"
                                  : "Update"}
                              </button>
                            </div>
                          ) : (
                            <div
                              style={{
                                marginTop: 4,
                                fontSize: "0.75rem",
                                color: "#A0522D",
                              }}
                            >
                              During cooldown, boundaries are read-only on-chain.
                              <br />
                              （冷静期结束并由双方确认后，关系恢复 Active，妳可以再次更新边界。）
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}

              {terminatedRelationships.length > 0 && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 10,
                    borderTop: "1px dashed #FFB6C1",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#C71585",
                      marginBottom: 4,
                    }}
                  >
                     Recently closed connections
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      maxHeight: 80,
                      overflowY: "auto",
                    }}
                  >
                    {terminatedRelationships.slice(0, 2).map((r) => (
                      <div
                        key={r.id}
                        style={{
                          borderRadius: 10,
                          padding: 8,
                          background: "rgba(255,248,252,0.9)",
                          border: "1px solid #FFE4E9",
                          fontSize: "0.78rem",
                          color: "#A0522D",
                        }}
                      >
                        <div>
                          {RELATIONSHIP_TYPE_EMOJI[r.relationshipType]}{" "}
                          {RELATIONSHIP_TYPE_LABEL[r.relationshipType]} ·{" "}
                          {shortenBytes32(r.id)}
                        </div>
                        <div>Closed: {formatDate(r.terminatedAt)}</div>
                        {r.terminationReason && (
                          <div style={{ marginTop: 2 }}>
                            Reason: {r.terminationReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Cooldown Chamber */}
            <section
              style={{
                background: "rgba(255,255,255,0.9)",
                borderRadius: 20,
                border: "1px solid #FFC0CB",
                padding: 22,
                boxShadow: "0 8px 24px rgba(255,182,193,0.35)",
                flex: 1,
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 8,
                  fontSize: "1.25rem",
                  color: "#C71585",
                }}
              >
                 Cooldown Chamber
              </h2>
              <p
                style={{
                  fontSize: "0.86rem",
                  color: "#A0522D",
                  marginBottom: 10,
                  lineHeight: 1.6,
                }}
              >
                冷静期不是惩罚,而是承认:
                <br />
                人会犹豫、会后悔、会想清楚。
                <br />
                关系可以暂时降温,而不是只剩"要么继续要么分手"。
              </p>

              {cooldownRelationships.length === 0 ? (
                <div
                  style={{
                    fontSize: "0.9rem",
                    marginTop: 6,
                    padding: 10,
                    borderRadius: 12,
                    background: "rgba(255, 240, 245, 0.9)",
                    border: "1px dashed #FFB6C1",
                    color: "#A0522D",
                  }}
                >
                  No relationships are currently in cooldown.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginTop: 6,
                    maxHeight: 240,
                    overflowY: "auto",
                  }}
                >
                  {cooldownRelationships.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        borderRadius: 16,
                        border: "1px solid #FFD1DC",
                        background:
                          "linear-gradient(135deg,#FFE4E9 0%,#FFFFFF 70%)",
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#A0522D",
                        }}
                      >
                        {RELATIONSHIP_TYPE_EMOJI[r.relationshipType]}{" "}
                        {RELATIONSHIP_TYPE_LABEL[r.relationshipType]} ·{" "}
                        {shortenBytes32(r.id)}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#A0522D",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                        }}
                      >
                        <span>A: {shortAddr(r.partyA)}</span>
                        <span>·</span>
                        <span>B: {shortAddr(r.partyB)}</span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#8B4513",
                        }}
                      >
                        Cooldown until: {formatDate(r.cooldownEnd)}
                      </div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "#8B4513",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        Boundaries:{" "}
                        {r.boundaries && r.boundaries.length
                          ? r.boundaries
                          : "(no boundary text recorded yet)"}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          display: "flex",
                          gap: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => handleConfirmCooldown(r.id)}
                          disabled={
                            cooldownWorkingId &&
                            String(cooldownWorkingId) === String(r.id)
                          }
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "none",
                            background:
                              "linear-gradient(45deg,#FF69B4,#FFB6C1)",
                            color: "white",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            cursor:
                              cooldownWorkingId &&
                              String(cooldownWorkingId) === String(r.id)
                                ? "wait"
                                : "pointer",
                          }}
                        >
                          {cooldownWorkingId &&
                          String(cooldownWorkingId) === String(r.id)
                            ? "Confirming…"
                            : "Confirm Cooldown End"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                style={{
                  marginTop: 14,
                  fontSize: "0.8rem",
                  color: "#A0522D",
                  lineHeight: 1.5,
                }}
              >
                <strong>设计说明:</strong>
                <br />
                · 冷却结束后,需要双方分别确认才能回到 Active。
                <br />
                · 任何时候,妳都保留终止关系并写下离场声明的权利。
              </div>
            </section>
          </div>
        </div>

        {/* ========= 第二排：Pending Consents (全宽) ========= */}
        <section
          style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: 20,
            border: "1px solid #FFC0CB",
            padding: 22,
            boxShadow: "0 8px 24px rgba(255,182,193,0.35)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 8,
              fontSize: "1.25rem",
              color: "#C71585",
            }}
          >
             Pending Consents
          </h2>
          <p
            style={{
              fontSize: "0.86rem",
              color: "#A0522D",
              marginBottom: 10,
              lineHeight: 1.6,
            }}
          >
            每一个同意都值得被慎重对待。  
            这里展示正在等待同意的关系合约:妳发起的,和你收到的。
          </p>

          {loadingConsents ? (
            <div style={{ fontSize: "0.9rem", marginTop: 6 }}>
              Loading consents…
            </div>
          ) : pendingConsents.length === 0 ? (
            <div
              style={{
                fontSize: "0.9rem",
                marginTop: 6,
                padding: 10,
                borderRadius: 12,
                background: "rgba(255, 240, 245, 0.9)",
                border: "1px dashed #FFB6C1",
                color: "#A0522D",
              }}
            >
              No relationship contracts are pending approval.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                gap: 16,
                marginTop: 6,
              }}
            >
              {incomingPending.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#C71585",
                      marginBottom: 8,
                    }}
                  >
                    → Pending your approval.
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {incomingPending.map((c) => (
                      <div
                        key={"in-" + c.id}
                        style={{
                          borderRadius: 14,
                          border: "1px solid #FFD1DC",
                          background:
                            "linear-gradient(135deg,#FFE4E9 0%,#FFFFFF 70%)",
                          padding: 12,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.82rem",
                              color: "#A0522D",
                            }}
                          >
                            ID: {shortenBytes32(c.id)} ·{" "}
                            {RELATIONSHIP_TYPE_EMOJI[c.relationshipType]}{" "}
                            {RELATIONSHIP_TYPE_LABEL[c.relationshipType]}
                          </div>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              padding: "3px 8px",
                              borderRadius: 999,
                              border: "1px solid #FFB6C1",
                              background: "rgba(255, 228, 233, 0.9)",
                            }}
                          >
                            Awaiting your consent
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#A0522D",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                          }}
                        >
                          <span>From: {shortAddr(c.initiator)}</span>
                          <span>·</span>
                          <span>Proposed: {formatDate(c.proposedAt)}</span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#8B4513",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          Terms: {c.relationshipTerms || "(no text)"}
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <button
                            onClick={() => handleConsent(c.id)}
                            disabled={
                              consentWorkingId &&
                              String(consentWorkingId) === String(c.id)
                            }
                            style={{
                              padding: "6px 12px",
                              borderRadius: 999,
                              border: "none",
                              background:
                                "linear-gradient(45deg,#FF69B4,#FFB6C1)",
                              color: "white",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              cursor:
                                consentWorkingId &&
                                String(consentWorkingId) === String(c.id)
                                  ? "wait"
                                  : "pointer",
                            }}
                          >
                            {consentWorkingId &&
                            String(consentWorkingId) === String(c.id)
                              ? "Consenting…"
                              : "✅ I agree to this relationship"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {outgoingPending.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#C71585",
                      marginBottom: 8,
                    }}
                  >
                    ← 等待对方同意
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {outgoingPending.map((c) => (
                      <div
                        key={"out-" + c.id}
                        style={{
                          borderRadius: 14,
                          border: "1px solid #FFD1DC",
                          background:
                            "linear-gradient(135deg,#FFE4E9 0%,#FFFFFF 70%)",
                          padding: 12,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.82rem",
                              color: "#A0522D",
                            }}
                          >
                            ID: {shortenBytes32(c.id)} ·{" "}
                            {RELATIONSHIP_TYPE_EMOJI[c.relationshipType]}{" "}
                            {RELATIONSHIP_TYPE_LABEL[c.relationshipType]}
                          </div>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              padding: "3px 8px",
                              borderRadius: 999,
                              border: "1px solid #FFB6C1",
                              background: "rgba(255, 248, 252, 0.9)",
                            }}
                          >
                            Waiting for counterparty
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#A0522D",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                          }}
                        >
                          <span>To: {shortAddr(c.counterparty)}</span>
                          <span>·</span>
                          <span>Proposed: {formatDate(c.proposedAt)}</span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#8B4513",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          Terms: {c.relationshipTerms || "(no text)"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer
        style={{
          marginTop: 40,
          textAlign: "center",
          fontSize: 11,
          color: "#A0522D",
          opacity: 0.8,
          paddingBottom: 30,
          lineHeight: 1.8,
        }}
      >
        女性主义不是去性化，而是去权力化。
        <br />
        爱与自由在 Her Protocol 同时被守护。
      </footer>
    </div>
  );
}
