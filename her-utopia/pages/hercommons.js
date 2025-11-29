// pages/hercommons.js
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { BrowserProvider, Contract, formatEther } from "ethers";

// 从 Hardhat artifacts 导入合约 ABI
import HerCommonsArtifact from "../artifacts/contracts/HerCommons.sol/HerCommons.json";

const HER_COMMONS_ADDRESS = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d";
const HER_COMMONS_ABI = HerCommonsArtifact.abi;

const PROPOSAL_TYPE_LABELS = ["Funding", "RuleChange", "Debug", "Emergency"];
const STATUS_LABELS = ["Listening", "ConsensusBlocked", "Voting", "Executed", "Rejected"];

// 固定使用的默认 Listening / Voting 天数（UI 不展示，只在调用时用）
const DEFAULT_LISTENING_DAYS = 2;
const DEFAULT_VOTING_DAYS = 2;

export default function HerCommonsPage() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [commons, setCommons] = useState(null);

  const [treasuryBalance, setTreasuryBalance] = useState("0.0");

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState("");
  const [txMessage, setTxMessage] = useState("");

  const [activeProposals, setActiveProposals] = useState([]);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);

  // 单一 Proposal 表单（合并 Funding / Debug）
  const [proposalForm, setProposalForm] = useState({
    title: "",
    description: "",
    debugTarget: "",
  });

  // Respond & vote form
  const [respondComment, setRespondComment] = useState("");
  const [raisesCoreConcern, setRaisesCoreConcern] = useState(false);
  const [voteSupport, setVoteSupport] = useState(true);

  // ------------------------- 初始化:连接 provider + 合约 -------------------------
  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window === "undefined" || !window.ethereum) {
          setError("No wallet detected. Please install MetaMask or a compatible wallet.");
          setLoadingInit(false);
          return;
        }

        const _provider = new BrowserProvider(window.ethereum);
        setProvider(_provider);

        const accounts = await _provider.send("eth_accounts", []);
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          const signer = await _provider.getSigner();
          const _commons = new Contract(HER_COMMONS_ADDRESS, HER_COMMONS_ABI, signer);
          setCommons(_commons);
          await loadOverview(_provider, _commons);
        }
      } catch (e) {
        console.error(e);
        setError(e.message || "Failed to initialize HerCommons");
      } finally {
        setLoadingInit(false);
      }
    };

    init();
  }, []);

  // ------------------------- 手动连接钱包按钮 -------------------------
  const connectWalletHere = async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        setError("No wallet detected. Please install MetaMask or a compatible wallet.");
        return;
      }

      setError("");
      setTxMessage("");

      const _provider = new BrowserProvider(window.ethereum);
      const accounts = await _provider.send("eth_requestAccounts", []);
      const signer = await _provider.getSigner();
      const _commons = new Contract(HER_COMMONS_ADDRESS, HER_COMMONS_ABI, signer);

      setProvider(_provider);
      setCommons(_commons);
      setAccount(accounts[0]);

      await loadOverview(_provider, _commons);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to connect wallet");
    }
  };

  // ------------------------- 加载整体信息:金库余额 + 活跃提案 -------------------------
  const loadOverview = async (_provider, _commons) => {
    try {
      const balanceWei = await _provider.getBalance(HER_COMMONS_ADDRESS);
      setTreasuryBalance(formatEther(balanceWei));

      const ids = await _commons.getActiveProposals();
      const idNums = ids.map((id) => Number(id));
      const proposals = [];

      for (let i = 0; i < idNums.length; i++) {
        const pid = idNums[i];
        const basic = await _commons.getProposalBasic(pid);
        const detail = await _commons.getProposalDetail(pid);

        const proposal = {
          id: Number(basic.id ?? basic[0]),
          proposer: basic.proposer ?? basic[1],
          proposalType: Number(basic.proposalType ?? basic[2]),
          title: basic.title ?? basic[3],
          listeningEnd: Number(basic.listeningEnd ?? basic[4]),
          votingEnd: Number(basic.votingEnd ?? basic[5]),
          status: Number(basic.status ?? basic[6]),
          description: detail.description ?? detail[0],
          amount: detail.amount ?? detail[1],
          recipient: detail.recipient ?? detail[2],
          forVotes: Number(detail.forVotes ?? detail[3]),
          againstVotes: Number(detail.againstVotes ?? detail[4]),
          totalVotes: Number(detail.totalVotes ?? detail[5]),
          coreValueConcerns: Number(detail.coreValueConcerns ?? detail[6]),
          debugTarget: detail.debugTarget ?? detail[7],
        };

        proposals.push(proposal);
      }

      setActiveProposals(proposals);

      if (proposals.length > 0) {
        setSelectedProposalId(proposals[0].id);
        setSelectedProposal(proposals[0]);
      } else {
        setSelectedProposalId(null);
        setSelectedProposal(null);
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load proposals");
    }
  };

  const refreshAll = async () => {
    if (!provider || !commons) return;
    await loadOverview(provider, commons);
  };

  // ------------------------- 创建 Proposal（统一入口，走 createDebugProposal） -------------------------
  const handleCreateProposal = async () => {
    if (!commons || !account) {
      setError("Please connect wallet first.");
      return;
    }
    try {
      setError("");
      setTxMessage("");
      setLoadingAction(true);

      const tx = await commons.createDebugProposal(
        proposalForm.title,
        proposalForm.description,
        proposalForm.debugTarget,
        DEFAULT_LISTENING_DAYS,
        DEFAULT_VOTING_DAYS
      );
      await tx.wait();

      setTxMessage("Proposal created successfully.");
      setProposalForm({
        title: "",
        description: "",
        debugTarget: "",
      });

      await refreshAll();
    } catch (e) {
      console.error(e);
      setError(e.reason || e.error?.message || e.message || "Failed to create proposal");
    } finally {
      setLoadingAction(false);
    }
  };

  // ------------------------- 倾听期回应 -------------------------
  const handleRespond = async () => {
    if (!commons || !account || selectedProposalId === null) {
      setError("No proposal selected or wallet not connected.");
      return;
    }
    try {
      setError("");
      setTxMessage("");
      setLoadingAction(true);

      const tx = await commons.respondToProposal(
        selectedProposalId,
        respondComment,
        raisesCoreConcern
      );
      setTxMessage("Submitting response...");
      await tx.wait();

      setTxMessage("Responded to proposal.");
      setRespondComment("");
      setRaisesCoreConcern(false);
      await refreshAll();
    } catch (e) {
      console.error(e);
      setError(e.reason || e.error?.message || e.message || "Failed to respond");
    } finally {
      setLoadingAction(false);
    }
  };

  // ------------------------- 开启投票 -------------------------
  const handleOpenVoting = async () => {
    if (!commons || selectedProposalId === null) {
      setError("No proposal selected.");
      return;
    }
    try {
      setError("");
      setTxMessage("");
      setLoadingAction(true);

      const tx = await commons.openVoting(selectedProposalId);
      setTxMessage("Opening voting phase...");
      await tx.wait();

      setTxMessage("Voting phase opened.");
      await refreshAll();
    } catch (e) {
      console.error(e);
      setError(e.reason || e.error?.message || e.message || "Failed to open voting");
    } finally {
      setLoadingAction(false);
    }
  };

  // ------------------------- 投票 -------------------------
  const handleVote = async () => {
    if (!commons || selectedProposalId === null) {
      setError("No proposal selected.");
      return;
    }
    try {
      setError("");
      setTxMessage("");
      setLoadingAction(true);

      const tx = await commons.vote(selectedProposalId, voteSupport);
      setTxMessage("Submitting vote...");
      await tx.wait();

      setTxMessage("Voted successfully.");
      await refreshAll();
    } catch (e) {
      console.error(e);
      setError(e.reason || e.error?.message || e.message || "Failed to vote");
    } finally {
      setLoadingAction(false);
    }
  };

  // ------------------------- 执行提案 -------------------------
  const handleExecute = async () => {
    if (!commons || selectedProposalId === null) {
      setError("No proposal selected.");
      return;
    }
    try {
      setError("");
      setTxMessage("");
      setLoadingAction(true);

      const tx = await commons.executeProposal(selectedProposalId);
      setTxMessage("Executing proposal...");
      await tx.wait();

      setTxMessage("Proposal executed (or rejected based on rules).");
      await refreshAll();
    } catch (e) {
      console.error(e);
      setError(e.reason || e.error?.message || e.message || "Failed to execute proposal");
    } finally {
      setLoadingAction(false);
    }
  };

  // ------------------------- UI 渲染帮助 -------------------------
  const formatDateTime = (ts) => {
    if (!ts) return "-";
    const d = new Date(ts * 1000);
    return d.toLocaleString();
  };

  const shortAddress = (addr) => {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  const selectProposal = (pid) => {
    setSelectedProposalId(pid);
    const p = activeProposals.find((x) => x.id === pid) || null;
    setSelectedProposal(p);
    setRespondComment("");
    setRaisesCoreConcern(false);
  };

  const listeningProposals = activeProposals.filter((p) => p.status === 0);
  const votingProposals = activeProposals.filter((p) => p.status === 2);
  const blockedProposals = activeProposals.filter((p) => p.status === 1);

  // ------------------------- 页面 -------------------------

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 100%)",
        minHeight: "100vh",
        color: "#8B4513",
      }}
    >
      <Header />

      {/* 顶部 Hero */}
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
          Her Commons
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
          "倾听先于表决,理解先于裁决。"
        </p>
      </div>

      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "30px 20px 60px 20px",
        }}
      >
        {loadingInit && <p>Loading HerCommons state from chain…</p>}

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "rgba(255, 105, 180, 0.12)",
              border: "1px solid #FF69B4",
              color: "#8B0A50",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        {txMessage && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "rgba(255, 182, 193, 0.2)",
              border: "1px solid #FF69B4",
              color: "#C71585",
              fontSize: "0.9rem",
            }}
          >
            ✅ {txMessage}
          </div>
        )}

        {/* 三列布局 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(320px, 1fr) minmax(0, 1.8fr) minmax(280px, 0.9fr)",
            gap: "24px",
            alignItems: "flex-start",
          }}
        >
          {/* 左侧: Start a Collective Conversation（统一 Proposal 表单） */}
          <div
            style={{
              background: "rgba(255,255,255,0.8)",
              borderRadius: "20px",
              border: "1px solid #FFB6C1",
              padding: "20px 20px 24px 20px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "12px",
                fontSize: 20,
              }}
            >
              Start a Collective Conversation
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "#A0522D",
                marginBottom: "16px",
                lineHeight: 1.6,
              }}
            >
              在这里,发起提案不是递交一份申请表,而是把一个问题、一份关切或一个愿望交给共同体。
              <br />
              妳不是在请求别人来“批准”你,而是在邀请大家一起理解、一起看见。
              <br />
              在这里,妳的声音不是被计数,而是被倾听。
            </p>

            <div
              style={{
                padding: "14px 14px 18px 14px",
                borderRadius: "16px",
                background: "rgba(255, 240, 245, 0.9)",
                border: "1px dashed #FFB6C1",
              }}
            >
              <h3 style={{ marginTop: 0, fontSize: "1rem" }}>Proposal</h3>
              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "0.85rem" }}>Title</label>
                <input
                  type="text"
                  value={proposalForm.title}
                  onChange={(e) =>
                    setProposalForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  style={inputStyle}
                  placeholder="Name the change, question or experiment you want to bring in..."
                />
              </div>
              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "0.85rem" }}>Description</label>
                <textarea
                  value={proposalForm.description}
                  onChange={(e) =>
                    setProposalForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  style={{ ...inputStyle, minHeight: "60px" }}
                  placeholder="What do you hope to shift, repair or explore together?"
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "0.85rem" }}>
                  Reflection Focus (Optional)
                </label>
                <input
                  type="text"
                  value={proposalForm.debugTarget}
                  onChange={(e) =>
                    setProposalForm((prev) => ({
                      ...prev,
                      debugTarget: e.target.value,
                    }))
                  }
                  style={inputStyle}
                  placeholder="What part of the system needs collective care and attention?"
                />
              </div>
              <button
                onClick={handleCreateProposal}
                disabled={loadingAction}
                style={primaryButtonStyle}
              >
                {loadingAction ? "Submitting..." : "Create Proposal"}
              </button>
            </div>
          </div>

          {/* 中间:System Snapshot + Proposals in Process */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* System Snapshot 模块 + Connect Wallet 按钮 */}
            <div
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,240,245,0.95) 0%, rgba(255,228,233,0.95) 100%)",
                borderRadius: "20px",
                border: "2px solid #FFB6C1",
                padding: "24px",
                boxShadow: "0 4px 12px rgba(255,182,193,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 8,
                }}
              >
                <h2
                  style={{
                    marginTop: 0,
                    marginBottom: "8px",
                    fontSize: 20,
                    color: "#FF69B4",
                    fontWeight: "700",
                  }}
                >
                  System Snapshot
                </h2>

                {!account && (
                  <button
                    onClick={connectWalletHere}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 999,
                      border: "none",
                      background:
                        "linear-gradient(45deg, #FF69B4, #FFB6C1, #FFD1DC)",
                      color: "white",
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(255,105,180,0.45)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🔗 Connect Wallet
                  </button>
                )}
              </div>

              <div
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: "#8B4513",
                  textAlign: "justify",
                }}
              >
                <p style={{ marginTop: 0, marginBottom: "10px" }}>
                  治理在 <strong>Her Commons</strong>
                  中并非权力的体现,而是一种<strong>共识的形成过程</strong>。
                  这里的每一位成员不仅是参与者,也是治理者。
                </p>

                <p style={{ marginBottom: "10px" }}>
                  一切规则的制定、修改与提案,都从<strong>"倾听"</strong>
                  开始,而不是从争夺开始。
                  治理不是对立的过程,而是集体理解与共同创造的过程。
                </p>

                <p style={{ marginBottom: 0 }}>
                  <strong>Her Commons</strong> 将
                  <span style={{ color: "#FF69B4" }}>
                    共识优先(Consensus-First)机制
                  </span>
                  与
                  <span style={{ color: "#C71585" }}>
                    共识治理(Consensus Governance)框架
                  </span>
                  结合,
                  构建出一个以<strong>包容差异、强调共识与去权力化</strong>
                  为基础的治理结构。
                  治理因此成为一种建立在<em>共感与理解</em>
                  之上的协作实践。
                </p>
              </div>
            </div>

            {/* Proposals in Process */}
            <div
              style={{
                background: "rgba(255,255,255,0.85)",
                borderRadius: "20px",
                border: "1px solid #FFB6C1",
                padding: "20px",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "16px",
                  fontSize: "20",
                }}
              >
                Proposals in Process
              </h2>

              {/* Listening Phase */}
              <div style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    fontSize: "1.05rem",
                    marginBottom: "10px",
                    color: "#FF69B4",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  Listening Phase ({listeningProposals.length})
                </h3>
                <p
                  style={{
                    fontSize: "16",
                    color: "#A0522D",
                    marginBottom: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  Your voice matters. Share your perspective before voting begins.
                </p>
                {listeningProposals.length === 0 ? (
                  <div
                    style={{
                      padding: "12px",
                      background: "rgba(255, 192, 203, 0.15)",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      color: "#A0522D",
                    }}
                  >
                    No proposals in listening phase.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {listeningProposals.map((p) => {
                      const isSelected = p.id === selectedProposalId;
                      const concernWarning = p.coreValueConcerns >= 3;
                      return (
                        <div
                          key={p.id}
                          onClick={() => selectProposal(p.id)}
                          style={{
                            padding: "12px",
                            borderRadius: "12px",
                            border: isSelected
                              ? "2px solid #FF69B4"
                              : "1px solid #FFDEE7",
                            background: isSelected
                              ? "rgba(255, 182, 193, 0.25)"
                              : "rgba(255, 250, 250, 0.9)",
                            cursor: "pointer",
                            fontSize: "0.88rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "6px",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 600,
                                color: "#8B4513",
                              }}
                            >
                              #{p.id} · {p.title}
                            </span>
                            {concernWarning && (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  padding: "3px 8px",
                                  borderRadius: "999px",
                                  background: "rgba(255, 105, 180, 0.15)",
                                  color: "#8B0A50",
                                  fontWeight: 600,
                                }}
                              >
                                Core Concerns: {p.coreValueConcerns}
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#A0522D",
                            }}
                          >
                            Listening ends: {formatDateTime(p.listeningEnd)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ⚖️ Consensus Blocked */}
              {blockedProposals.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontSize: "1.05rem",
                      marginBottom: "10px",
                      color: "#C71585",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    Consensus Blocked ({blockedProposals.length})
                  </h3>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "#A0522D",
                      marginBottom: "12px",
                      lineHeight: 1.5,
                    }}
                  >
                    These proposals raised core value concerns and cannot proceed
                    to voting.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {blockedProposals.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          padding: "12px",
                          borderRadius: "12px",
                          border: "1px solid #FFB6C1",
                          background: "rgba(255, 182, 193, 0.18)",
                          fontSize: "0.88rem",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#8B4513",
                            marginBottom: "4px",
                          }}
                        >
                          #{p.id} · {p.title}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#8B0A50",
                          }}
                        >
                          Core value concerns: {p.coreValueConcerns}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🗳 Voting Phase */}
              <div style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    fontSize: "16",
                    marginBottom: "10px",
                    color: "#FF69B4",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  Voting Phase ({votingProposals.length})
                </h3>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "#A0522D",
                    marginBottom: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  Only members who responded during listening can vote.
                </p>
                {votingProposals.length === 0 ? (
                  <div
                    style={{
                      padding: "12px",
                      background: "rgba(255, 192, 203, 0.15)",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      color: "#A0522D",
                    }}
                  >
                    No proposals in voting phase.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {votingProposals.map((p) => {
                      const isSelected = p.id === selectedProposalId;
                      return (
                        <div
                          key={p.id}
                          onClick={() => selectProposal(p.id)}
                          style={{
                            padding: "12px",
                            borderRadius: "12px",
                            border: isSelected
                              ? "2px solid #FF69B4"
                              : "1px solid #FFDEE7",
                            background: isSelected
                              ? "rgba(255, 182, 193, 0.25)"
                              : "rgba(255, 250, 252, 0.9)",
                            cursor: "pointer",
                            fontSize: "0.88rem",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#8B4513",
                              marginBottom: "6px",
                            }}
                          >
                            #{p.id} · {p.title}
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#A0522D",
                              marginBottom: "4px",
                            }}
                          >
                            ✅ {p.forVotes} · ❌ {p.againstVotes} · Total:{" "}
                            {p.totalVotes}
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#A0522D",
                            }}
                          >
                            Voting ends: {formatDateTime(p.votingEnd)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 提案详情与互动区 */}
              {selectedProposal && (
                <div
                  style={{
                    marginTop: "20px",
                    borderRadius: "16px",
                    background: "rgba(255, 245, 247, 0.9)",
                    border: "1px solid #FFD1DC",
                    padding: "16px",
                  }}
                >
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: "8px",
                      fontSize: "1.05rem",
                    }}
                  >
                    #{selectedProposal.id} · {selectedProposal.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#A0522D",
                      marginBottom: "6px",
                    }}
                  >
                    <strong>Type:</strong>{" "}
                    {PROPOSAL_TYPE_LABELS[selectedProposal.proposalType] ||
                      "Unknown"}{" "}
                    ·
                    <strong> Status:</strong>{" "}
                    {STATUS_LABELS[selectedProposal.status] || "Unknown"}
                  </p>

                  {selectedProposal.proposalType === 0 && (
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#A0522D",
                        marginBottom: "6px",
                      }}
                    >
                      <strong>Funding:</strong>{" "}
                      {formatEther(selectedProposal.amount || 0)} ETH →{" "}
                      {shortAddress(selectedProposal.recipient)}
                    </p>
                  )}

                  {selectedProposal.proposalType === 2 &&
                    selectedProposal.debugTarget && (
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#A0522D",
                          marginBottom: "6px",
                        }}
                      >
                        <strong>Debug Target:</strong>{" "}
                        {selectedProposal.debugTarget}
                      </p>
                    )}

                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#8B4513",
                      marginBottom: "8px",
                    }}
                  >
                    {selectedProposal.description}
                  </p>

                  {/* Listening Phase 操作 */}
                  {selectedProposal.status === 0 && (
                    <div
                      style={{
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px dashed #FFB6C1",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "0.9rem",
                          marginBottom: "8px",
                        }}
                      >
                        Share Your Perspective
                      </h4>
                      <textarea
                        value={respondComment}
                        onChange={(e) => setRespondComment(e.target.value)}
                        style={{ ...inputStyle, minHeight: "60px" }}
                        placeholder="Your perspective matters. What do you think about this proposal?"
                      />
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.8rem",
                          marginTop: "6px",
                          marginBottom: "10px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={raisesCoreConcern}
                          onChange={(e) => setRaisesCoreConcern(e.target.checked)}
                        />
                        I believe this proposal may harm core values
                      </label>
                      <button
                        onClick={handleRespond}
                        disabled={loadingAction}
                        style={{
                          ...primaryButtonStyle,
                          fontSize: "0.85rem",
                          padding: "6px 14px",
                        }}
                      >
                        {loadingAction ? "Sending..." : "Submit Response"}
                      </button>
                      <button
                        onClick={handleOpenVoting}
                        disabled={loadingAction}
                        style={{
                          ...secondaryButtonStyle,
                          marginLeft: "8px",
                          fontSize: "0.85rem",
                          padding: "6px 14px",
                        }}
                      >
                        Open Voting
                      </button>
                    </div>
                  )}

                  {/* Voting Phase 操作 */}
                  {selectedProposal.status === 2 && (
                    <div
                      style={{
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: "1px dashed #FFB6C1",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "0.9rem",
                          marginBottom: "8px",
                        }}
                      >
                        Cast Your Vote
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "10px",
                        }}
                      >
                        <label
                          style={{
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <input
                            type="radio"
                            checked={voteSupport === true}
                            onChange={() => setVoteSupport(true)}
                          />
                          Support
                        </label>
                        <label
                          style={{
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <input
                            type="radio"
                            checked={voteSupport === false}
                            onChange={() => setVoteSupport(false)}
                          />
                          Reject
                        </label>
                      </div>
                      <button
                        onClick={handleVote}
                        disabled={loadingAction}
                        style={{
                          ...primaryButtonStyle,
                          fontSize: "0.85rem",
                          padding: "6px 14px",
                        }}
                      >
                        {loadingAction ? "Submitting vote..." : "Submit Vote"}
                      </button>
                      <button
                        onClick={handleExecute}
                        disabled={loadingAction}
                        style={{
                          ...secondaryButtonStyle,
                          marginLeft: "8px",
                          fontSize: "0.85rem",
                          padding: "6px 14px",
                        }}
                      >
                        Execute Proposal
                      </button>
                    </div>
                  )}

                  {(selectedProposal.status === 3 ||
                    selectedProposal.status === 4 ||
                    selectedProposal.status === 1) && (
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#A0522D",
                        marginTop: "12px",
                      }}
                    >
                      This proposal is finalized as{" "}
                      <strong>
                        {STATUS_LABELS[selectedProposal.status]}
                      </strong>
                      .
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 右侧:How Consensus Works */}
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              borderRadius: "20px",
              border: "1px solid #FFB6C1",
              padding: "18px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "16px",
                fontSize: "20",
                color: "#FF69B4",
              }}
            >
              How Consensus Works
            </h2>

            {/* Participation Ethics */}
            <div
              style={{
                marginBottom: "18px",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(255, 240, 245, 0.9)",
                border: "1px solid #FFB6C1",
              }}
            >
              <h3
                style={{
                  fontSize: "19",
                  marginTop: 0,
                  marginBottom: "8px",
                  color: "#FF69B4",
                }}
              >
                Participation Ethics
              </h3>
              <p
                style={{
                  fontSize: "16",
                  lineHeight: 1.6,
                  margin: 0,
                  color: "#8B4513",
                }}
              >
                在 Her Commons 中:
                <br />
                • 投票权不是天赋的,而是通过倾听获得的
                <br />
                • 妳必须在倾听期回应过,才能在投票期投票
                <br />
                • 这确保决策者都是理解过讨论的人
                <br />
                <br />
                <em>"参与投票的权利,来自你是否倾听过别人。"</em>
              </p>
            </div>

            {/* Governance Flow */}
            <div
              style={{
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(255, 245, 247, 0.9)",
                border: "1px solid #FFD1DC",
              }}
            >
              <h3
                style={{
                  fontSize: "19",
                  marginTop: 0,
                  marginBottom: "10px",
                  color: "#FF69B4",
                }}
              >
                Governance Flow
              </h3>
              <div
                style={{
                  fontSize: "0.75rem",
                  lineHeight: 2,
                  color: "#8B4513",
                  fontFamily: "monospace",
                }}
              >
                [Proposal Created]
                <br />
                &nbsp;&nbsp;&nbsp;↓
                <br />
                [ Listening ]
                <br />
                &nbsp;&nbsp;&nbsp;↓
                <br />
                [Consensus Check]
                <br />
                &nbsp;&nbsp;&nbsp;├─ Core value concerns remain unresolved → ❌
                Pause &amp; Re-design
                <br />
                &nbsp;&nbsp;&nbsp;└─ No major concerns after listening → ✅ Move
                to voting
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
                <br />
                &nbsp;&nbsp;&nbsp;[ Voting ]
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
                <br />
                &nbsp;&nbsp;&nbsp;[Community Decision]
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;[Executed]
              </div>
            </div>
          </div>
        </div>
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
        治理不是权力的彰显,而是一种共识形成的过程。
        <br />
        每一次共识都是社会信任的重建。
      </footer>
    </div>
  );
}

// 共用样式
const inputStyle = {
  width: "100%",
  padding: "6px 10px",
  borderRadius: "10px",
  border: "1px solid #FFC0CB",
  fontSize: "0.85rem",
  outline: "none",
  background: "rgba(255,255,255,0.9)",
};

const primaryButtonStyle = {
  padding: "8px 16px",
  borderRadius: "18px",
  border: "none",
  background: "linear-gradient(45deg, #FF69B4, #FFB6C1)",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.9rem",
};

const secondaryButtonStyle = {
  padding: "8px 16px",
  borderRadius: "18px",
  border: "1px solid #FF69B4",
  background: "white",
  color: "#FF69B4",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.9rem",
};
