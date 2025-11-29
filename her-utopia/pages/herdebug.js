// pages/herdebug.js
import React, { useEffect, useState, useCallback } from "react";
import { BrowserProvider, Contract, formatEther } from "ethers";
import Header from "../components/Header";

// Import ABI from Hardhat artifacts
import HerDebugArtifact from "../artifacts/contracts/HerDebug.sol/HerDebug.json";

const HERDEBUG_ADDRESS = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";

// Use artifacts ABI
const HERDEBUG_ABI = HerDebugArtifact.abi;

const LAYER_LABEL = {
  0: "Economic Logic 经济逻辑",
  1: "Governance Structure 治理结构",
  2: "Social Contract 社会契约",
  3: "Cultural Code 文化代码",
  4: "Technical Infrastructure 技术基建",
};

const LAYER_EMOJI = {
  0: "💸",
  1: "🏛️",
  2: "🤝",
  3: "📚",
  4: "🧱",
};

const STAGE_LABEL = {
  0: "Witnessing 正在见证",
  1: "Analyzing 正在分析",
  2: "Rewriting 正在重写",
  3: "Integrating 正在整合",
  4: "Embodying 已被体现",
};

// Pink tone gradient per stage
const STAGE_COLOR = {
  0: "linear-gradient(135deg, #FFB6C1 0%, #FFD1DC 100%)",
  1: "linear-gradient(135deg, #FFC0CB 0%, #FFE4E9 100%)",
  2: "linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%)",
  3: "linear-gradient(135deg, #FF9BB3 0%, #FFC1D9 100%)",
  4: "linear-gradient(135deg, #FF6FA3 0%, #FFE4F0 100%)",
};

export default function HerDebugPage() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loadingContract, setLoadingContract] = useState(false);

  const [error, setError] = useState("");
  const [txMessage, setTxMessage] = useState("");
  const [submittingAction, setSubmittingAction] = useState(null); // "awakening" | "witness" | "repair" | "agreement"

  // System data
  const [awareBalance, setAwareBalance] = useState(null);
  const [systemHealth, setSystemHealth] = useState({ healed: 0, witnessing: 0 });
  const [awakeningHistory, setAwakeningHistory] = useState([]); // keep logic
  const [myStats, setMyStats] = useState({ awakened: 0, witnessed: 0, repaired: 0 });

  // Awakening form
  const [layer, setLayer] = useState(1);
  const [flawDescription, setFlawDescription] = useState("");
  const [currentLogic, setCurrentLogic] = useState("");
  const [desiredLogic, setDesiredLogic] = useState("");

  // Flaws & proposals
  const [flaws, setFlaws] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loadingFlaws, setLoadingFlaws] = useState(false);

  // Selected flaw details
  const [selectedFlaw, setSelectedFlaw] = useState(null);
  const [witnessLists, setWitnessLists] = useState({});

  // Filter
  const [filterStage, setFilterStage] = useState("all"); // "all" | "witnessing" | "rewriting" | "healed"

  // Inputs
  const [witnessInput, setWitnessInput] = useState("");
  const [repairNewLogic, setRepairNewLogic] = useState("");
  const [repairMetaphor, setRepairMetaphor] = useState("");

  const shortAddr = (addr) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

  const formatDateTime = (ts) => {
    const n = Number(ts);
    if (!n) return "-";
    return new Date(n * 1000).toLocaleString("zh-CN", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ---------------- Contract Init ----------------
  const initContract = useCallback(async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        setError("Please install MetaMask wallet");
        return;
      }
      if (!HERDEBUG_ADDRESS) {
        setError("HerDebug contract address is not configured");
        return;
      }

      setLoadingContract(true);
      setError("");
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);

      const c = new Contract(HERDEBUG_ADDRESS, HERDEBUG_ABI, signer);
      setContract(c);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to connect to contract");
    } finally {
      setLoadingContract(false);
    }
  }, []);

  // Auto connect on load
  useEffect(() => {
    (async () => {
      if (typeof window === "undefined" || !window.ethereum) return;
      if (!HERDEBUG_ADDRESS) return;
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts && accounts.length > 0) {
          const signer = await provider.getSigner();
          const addr = await signer.getAddress();
          setAccount(addr);
          const c = new Contract(HERDEBUG_ADDRESS, HERDEBUG_ABI, signer);
          setContract(c);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Listen account change
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    const handler = (accounts) => {
      setAccount(accounts[0] || null);
      if (accounts[0]) {
        const provider = new BrowserProvider(window.ethereum);
        provider.getSigner().then((signer) => {
          const c = new Contract(HERDEBUG_ADDRESS, HERDEBUG_ABI, signer);
          setContract(c);
        });
      }
    };
    window.ethereum.on("accountsChanged", handler);
    return () => {
      window.ethereum.removeListener("accountsChanged", handler);
    };
  }, []);

  // ---------------- Load Data ----------------
  const loadBasics = useCallback(
    async (addr) => {
      if (!contract) return;
      try {
        const [health, history, balance] = await Promise.all([
          contract.getSystemHealth(),
          contract.getAwakeningHistory(),
          addr ? contract.getConsciousnessBalance(addr) : Promise.resolve(0),
        ]);

        setSystemHealth({
          healed: Number(health[0]),
          witnessing: Number(health[1]),
        });
        setAwakeningHistory(history);
        setAwareBalance(balance ? formatEther(balance) : "0");
      } catch (e) {
        console.error(e);
      }
    },
    [contract]
  );

  const loadFlaws = useCallback(async () => {
    if (!contract) return;
    try {
      setLoadingFlaws(true);
      const total = await contract.getTotalFlaws();
      const n = Number(total);
      const results = [];
      for (let i = 0; i < n; i++) {
        const f = await contract.systemFlaws(i);
        results.push({
          id: Number(f[0]),
          firstWitness: f[1],
          layer: Number(f[2]),
          flawDescription: f[3],
          currentLogic: f[4],
          desiredLogic: f[5],
          witnessedAt: Number(f[6]),
          stage: Number(f[7]),
          collectiveWitness: Number(f[8]),
          repairAttempts: Number(f[9]),
          isHealed: f[10],
        });
      }
      setFlaws(results.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFlaws(false);
    }
  }, [contract]);

  const loadProposals = useCallback(async () => {
    if (!contract) return;
    try {
      const total = await contract.getTotalProposals();
      const n = Number(total);
      const results = [];
      for (let i = 0; i < n; i++) {
        const p = await contract.repairProposals(i);
        results.push({
          id: Number(p[0]),
          flawId: Number(p[1]),
          rewriter: p[2],
          newLogic: p[3],
          metaphor: p[4],
          proposedAt: Number(p[5]),
          collectiveAgreement: Number(p[6]),
          isIntegrated: p[7],
        });
      }
      setProposals(results.reverse());
    } catch (e) {
      console.error(e);
    }
  }, [contract]);

  const loadWitnessesForFlaw = async (flawId) => {
    if (!contract) return;
    try {
      const arr = await contract.getFlawWitnesses(flawId);
      const list = arr.map((w) => ({
        witness: w[0],
        testimony: w[1],
        witnessedAt: Number(w[2]),
      }));
      setWitnessLists((prev) => ({ ...prev, [flawId]: list }));
    } catch (e) {
      console.error(e);
    }
  };

  const calculateMyStats = useCallback(() => {
    if (!account || !flaws.length) return;

    let awakened = 0;
    let witnessed = 0;
    let repaired = 0;

    flaws.forEach((f) => {
      if (f.firstWitness.toLowerCase() === account.toLowerCase()) {
        awakened++;
      }
      const witnesses = witnessLists[f.id] || [];
      if (
        witnesses.some(
          (w) => w.witness.toLowerCase() === account.toLowerCase()
        )
      ) {
        witnessed++;
      }
    });

    proposals.forEach((p) => {
      if (p.rewriter.toLowerCase() === account.toLowerCase()) {
        repaired++;
      }
    });

    setMyStats({ awakened, witnessed, repaired });
  }, [account, flaws, proposals, witnessLists]);

  useEffect(() => {
    if (contract) {
      loadBasics(account || null);
      loadFlaws();
      loadProposals();
    }
  }, [contract, account, loadBasics, loadFlaws, loadProposals]);

  useEffect(() => {
    calculateMyStats();
  }, [calculateMyStats]);

  // ---------------- Actions ----------------
  const handleAwaken = async (e) => {
    e.preventDefault();
    if (!contract || !account) {
      setError("Please connect your wallet first");
      return;
    }
    if (!flawDescription.trim() || !currentLogic.trim()) {
      setError("Please describe this system flaw in detail");
      return;
    }
    try {
      setSubmittingAction("awakening");
      setError("");
      setTxMessage("Recording your awakening...");
      const tx = await contract.witnessSystemFlaw(
        Number(layer),
        flawDescription.trim(),
        currentLogic.trim(),
        desiredLogic.trim()
      );
      setTxMessage("Awakening submitted, waiting for confirmation...");
      await tx.wait();
      setTxMessage(
        "✨ Your awakening is now recorded. Others can now witness it together with you."
      );

      setFlawDescription("");
      setCurrentLogic("");
      setDesiredLogic("");

      setTimeout(() => {
        loadFlaws();
        loadBasics(account);
        setTxMessage("");
      }, 3000);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to record awakening");
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleWitness = async () => {
    if (!contract || !account || !selectedFlaw) return;
    const testimony = witnessInput.trim();
    if (!testimony) {
      setError("Please write your testimony");
      return;
    }
    try {
      setSubmittingAction("witness");
      setError("");
      setTxMessage("Recording your testimony...");
      const tx = await contract.addCollectiveWitness(selectedFlaw.id, testimony);
      await tx.wait();
      setTxMessage("🕯️ Your testimony has been recorded");

      setWitnessInput("");
      await loadFlaws();
      await loadBasics(account);
      await loadWitnessesForFlaw(selectedFlaw.id);

      setTimeout(() => setTxMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to record testimony");
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleRepair = async () => {
    if (!contract || !account || !selectedFlaw) return;
    if (!repairNewLogic.trim()) {
      setError("Please write the new system logic you propose");
      return;
    }
    try {
      setSubmittingAction("repair");
      setError("");
      setTxMessage("Submitting repair proposal...");
      const tx = await contract.rewriteSystemLogic(
        selectedFlaw.id,
        repairNewLogic.trim(),
        repairMetaphor.trim()
      );
      await tx.wait();
      setTxMessage("🛠️ Your repair proposal has been submitted");

      setRepairNewLogic("");
      setRepairMetaphor("");
      await loadFlaws();
      await loadProposals();
      await loadBasics(account);

      setTimeout(() => setTxMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to submit repair proposal");
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleAgree = async (proposalId) => {
    if (!contract || !account) return;
    try {
      setSubmittingAction("agreement");
      setError("");
      setTxMessage("Recording your agreement...");
      const tx = await contract.reachCollectiveAgreement(proposalId);
      await tx.wait();
      setTxMessage("💗 Your agreement has been recorded");

      await loadFlaws();
      await loadProposals();
      await loadBasics(account);

      setTimeout(() => setTxMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to record agreement");
    } finally {
      setSubmittingAction(null);
    }
  };

  // Filtered flaws
  const filteredFlaws = flaws.filter((f) => {
    if (filterStage === "all") return true;
    if (filterStage === "healed") return f.isHealed;
    if (filterStage === "witnessing") return !f.isHealed && f.stage === 0;
    if (filterStage === "rewriting") return !f.isHealed && f.stage >= 1;
    return true;
  });

  const openFlawDetail = (flaw) => {
    setSelectedFlaw(flaw);
    if (!witnessLists[flaw.id]) {
      loadWitnessesForFlaw(flaw.id);
    }
  };

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
          padding: "60px 20px 24px 20px",
          textAlign: "center",
          borderBottom: "1px solid rgba(255,182,193,0.8)",
          background:
            "linear-gradient(135deg, #FFB6C1 0%, #FFD1DC 50%, #FFE4E9 100%)",
          boxShadow: "0 4px 20px rgba(255, 105, 180, 0.25)",
        }}
      >
        <h1
          style={{
            fontSize: "5rem", // aligned with HerProtocol
            marginTop: 0,
            marginBottom: "10px",
            fontWeight: "800",
            color: "white",
            textShadow: "2px 2px 4px rgba(139, 69, 19, 0.35)",
            letterSpacing: "1px",
          }}
        >
          Her Debug
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
          
“我们世界的规则由我们自己来编写”
        </p>
      </div>

      <main
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "30px 20px 60px 20px",
        }}
      >
        {/* Messages */}
        {(loadingContract || txMessage || error) && (
          <div
            style={{
              marginBottom: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {loadingContract && (
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: 16,
                  background: "rgba(255,182,193,0.3)",
                  border: "1px solid #FF69B4",
                  fontSize: "0.9rem",
                }}
              >
                 Connecting to the awakening network...
              </div>
            )}
            {txMessage && (
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, rgba(255,192,203,0.3), rgba(255,182,193,0.4))",
                  border: "1px solid #FF9BB3",
                  fontSize: "0.9rem",
                  boxShadow: "0 2px 8px rgba(255,182,193,0.3)",
                }}
              >
                {txMessage}
              </div>
            )}
            {error && (
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: 16,
                  background: "rgba(255,105,180,0.08)",
                  border: "1px solid #FF6FA3",
                  fontSize: "0.9rem",
                  color: "#C2185B",
                }}
              >
                ⚠️ {error}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "340px minmax(0, 1.9fr) 320px",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          {/* Left: Awakening Portal */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <section
              id="awaken-section"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,240,245,0.95))",
                borderRadius: 24,
                border: "2px solid #FFB6C1",
                padding: 24,
                boxShadow: "0 8px 32px rgba(255,105,180,0.2)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative halo */}
              <div
                style={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 150,
                  height: 150,
                  background:
                    "radial-gradient(circle, rgba(255,105,180,0.3), transparent)",
                  borderRadius: "50%",
                  filter: "blur(40px)",
                }}
              />

              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  fontSize: "1.4rem",
                  color: "#C71585",
                  fontWeight: 700,
                  position: "relative",
                }}
              >
                 Awakening Portal
              </h2>

              <div
                style={{
                  fontSize: "0.95rem",
                  color: "#8B4513",
                  marginBottom: 20,
                  lineHeight: 1.7,
                  background: "rgba(255,240,245,0.9)",
                  padding: 12,
                  borderRadius: 12,
                  borderLeft: "3px solid #FF69B4",
                }}
              >
               当你意识到有哪些系统性的不适与不公
                 <br /> 请在这里打破沉默。
                  </div>

              <form
                onSubmit={handleAwaken}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* Guiding questions (Chinese kept as explanatory text) */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,192,203,0.3), rgba(255,255,255,0.7))",
                    padding: 14,
                    borderRadius: 12,
                    fontSize: "0.88rem",
                    color: "#A0522D",
                    lineHeight: 1.6,
                  }}
                >
                  <div
                    style={{
                      marginBottom: 8,
                      fontWeight: 600,
                      color: "#C71585",
                    }}
                  >
                    Think：
                     </div> · 在这个系统里，谁的声音被忽略了？
                      <br /> · 哪条规则让你感到不被看见？
                       <br /> · 什么时刻你意识到：这里的逻辑不对？
                        </div>

                <div>
                  <label
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#8B4513",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Which layer is this flaw in?
                  </label>
                  <select
                    value={layer}
                    onChange={(e) => setLayer(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "2px solid #FFD1DC",
                      background: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    {Object.keys(LAYER_LABEL).map((key) => (
                      <option key={key} value={key}>
                        {LAYER_EMOJI[key]} {LAYER_LABEL[key]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#8B4513",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    What is happening here?
                  </label>
                  <textarea
                    value={flawDescription}
                    onChange={(e) => setFlawDescription(e.target.value)}
                    rows={3}
                    placeholder="Who is being oppressed? Who becomes invisible? Whose labor is taken for granted?"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "2px solid #FFD1DC",
                      fontSize: "0.9rem",
                      resize: "vertical",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#8B4513",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    What is the current rule / logic?
                  </label>
                  <textarea
                    value={currentLogic}
                    onChange={(e) => setCurrentLogic(e.target.value)}
                    rows={2}
                    placeholder="e.g. Only highly active members’ votes count; certain care work is always unpaid..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "2px solid #FFD1DC",
                      fontSize: "0.9rem",
                      resize: "vertical",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "#8B4513",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    What direction do you hope for? (optional)
                  </label>
                  <textarea
                    value={desiredLogic}
                    onChange={(e) => setDesiredLogic(e.target.value)}
                    rows={2}
                    placeholder="Briefly describe what would be a more just / inclusive logic..."
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: "2px solid #FFD1DC",
                      fontSize: "0.9rem",
                      resize: "vertical",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    submittingAction === "awakening" || !contract || !account
                  }
                  style={{
                    marginTop: 8,
                    padding: "12px 20px",
                    borderRadius: 20,
                    border: "none",
                    background:
                      submittingAction === "awakening"
                        ? "linear-gradient(45deg, #F2A1C7, #F8C6DD)"
                        : "linear-gradient(45deg, #FF69B4, #FFB6C1)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1rem",
                    cursor:
                      submittingAction === "awakening" ? "wait" : "pointer",
                    opacity: contract && account ? 1 : 0.6,
                    boxShadow: "0 4px 12px rgba(255,105,180,0.3)",
                    transition: "all 0.3s ease",
                  }}
                  onClick={() => {
                    if (!account) {
                      initContract();
                    }
                  }}
                >
                  {submittingAction === "awakening"
                    ? "Recording..."
                    : "✨ Record Awakening"}
                </button>
              </form>
            </section>
          </div>

          {/* Middle: Navigation text + Witness Wall */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Navigation / philosophy section (Chinese explanation kept) */}
            <section
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,240,245,0.96))",
                borderRadius: 24,
                border: "2px solid rgba(255,182,193,0.9)",
                padding: 22,
                boxShadow: "0 10px 26px rgba(255,192,203,0.3)",
              }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#C71585",
                  marginBottom: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                DEBUG · as System Navigation
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.95rem",
                  lineHeight: 1.8,
                  color: "#8B4513",
                  whiteSpace: "pre-wrap",
                }}
              >
                在既有的社会系统中，我们常常被运行、被调用、被解释。而通过 Debug 的过程，我们看见，系统并非固不可破——它可以被理解、被修改。
                当我们调试一行智能合约的代码时，实际上也是在审视父权社会的深层运行逻辑。
                我们写下的不是一条单纯的执行指令，而是让世界更公平地运行的可能性。
                {"\n\n"}
                在 Her Debug 里，Debug 不仅可以识别技术错误，更用于洞察社会结构性的不平等。
                每一次成员提交一个 Bug ，都是在指出：“这里存在一行不公的逻辑。”
                随后的系统优化则成为一次集体修复的过程——她们共同修复世界的运行逻辑，一起决定哪些旧规则应当被废除，哪些新逻辑应当被引入，一同建设属于她们自己的世界。
              </p>
            </section>

            {/* Witness Wall */}
            <section
              id="witness-wall"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,240,245,0.95))",
                borderRadius: 24,
                border: "2px solid #FFD1DC",
                padding: 24,
                boxShadow: "0 8px 32px rgba(255,182,193,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.4rem",
                    color: "#C71585",
                    fontWeight: 700,
                  }}
                >
                  🧬 Collective Witness Wall
                </h2>
                <div style={{ display: "flex", gap: 8 }}>
                  {["all", "witnessing", "rewriting", "healed"].map(
                    (stage) => (
                      <button
                        key={stage}
                        onClick={() => setFilterStage(stage)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 999,
                          border:
                            filterStage === stage
                              ? "2px solid #FF69B4"
                              : "1px solid #FFD1DC",
                          background:
                            filterStage === stage ? "#FF9BB3" : "#FFFFFF",
                          color:
                            filterStage === stage ? "white" : "#8B4513",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {stage === "all"
                          ? "All"
                          : stage === "witnessing"
                          ? "Witnessing"
                          : stage === "rewriting"
                          ? "Rewriting"
                          : "Healed"}
                      </button>
                    )
                  )}
                </div>
              </div>

              {loadingFlaws ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 0",
                    color: "#A0522D",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>
                    🔮
                  </div>
                  Loading awakening records...
                </div>
              ) : filteredFlaws.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#A0522D",
                    background: "rgba(255,240,245,0.7)",
                    borderRadius: 16,
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: 12 }}>
                    ✨
                  </div>
                  <div style={{ fontSize: "1.1rem", marginBottom: 8 }}>
                    {filterStage === "all"
                      ? "No awakening records yet"
                      : "No records under this status"}
                  </div>
                  <div style={{ fontSize: "0.9rem" }}>
                    {filterStage === "all" &&
                      "Be the first one to break the silence."}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  {filteredFlaws.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => openFlawDetail(f)}
                      style={{
                        background:
                          STAGE_COLOR[f.stage] ||
                          "linear-gradient(135deg, #FFE4E9, #FFFFFF)",
                        borderRadius: 16,
                        padding: 16,
                        border: f.isHealed
                          ? "2px solid #FF9BB3"
                          : "1px solid #FFD1DC",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: f.isHealed
                          ? "0 4px 16px rgba(255,155,179,0.4)"
                          : "0 2px 8px rgba(255,192,203,0.3)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-4px)";
                        e.currentTarget.style.boxShadow = f.isHealed
                          ? "0 8px 24px rgba(255,155,179,0.5)"
                          : "0 4px 16px rgba(255,192,203,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = f.isHealed
                          ? "0 4px 16px rgba(255,155,179,0.4)"
                          : "0 2px 8px rgba(255,192,203,0.3)";
                      }}
                    >
                      {f.isHealed && (
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            fontSize: "1.5rem",
                          }}
                        >
                          ✨
                        </div>
                      )}

                      <div style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 4,
                          }}
                        >
                          <span style={{ fontSize: "1.2rem" }}>
                            {LAYER_EMOJI[f.layer]}
                          </span>
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              color: "#8B4513",
                            }}
                          >
                            {LAYER_LABEL[f.layer]}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#A0522D",
                          }}
                        >
                          #{f.id} · {formatDateTime(f.witnessedAt)}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "#8B4513",
                          marginBottom: 12,
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {f.flawDescription}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingTop: 10,
                          borderTop:
                            "1px dashed rgba(139,69,19,0.2)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            fontSize: "0.8rem",
                            color: "#A0522D",
                          }}
                        >
                          <span>👁️ {f.collectiveWitness}</span>
                          <span>🛠️ {f.repairAttempts}</span>
                        </div>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "3px 8px",
                            borderRadius: 999,
                            background: f.isHealed
                              ? "rgba(255,155,179,0.3)"
                              : "rgba(255,255,255,0.6)",
                            border:
                              "1px solid " +
                              (f.isHealed ? "#FF9BB3" : "#FFD1DC"),
                            fontWeight: 600,
                          }}
                        >
                          {f.isHealed ? "Healed 已治愈" : STAGE_LABEL[f.stage]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right: System Health + My Journey */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* System health */}
            <section
              id="system-health"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,240,245,0.95))",
                borderRadius: 24,
                border: "2px solid #FFD1DC",
                padding: 20,
                boxShadow: "0 8px 32px rgba(255,182,193,0.2)",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  fontSize: "1.2rem",
                  color: "#C71585",
                  fontWeight: 700,
                }}
              >
                🩹 System Health
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,182,193,0.3), rgba(255,240,245,0.9))",
                    padding: 14,
                    borderRadius: 12,
                    border: "1px solid #FF9BB3",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#C2185B",
                      marginBottom: 4,
                      fontWeight: 600,
                    }}
                  >
                    Healed flaws
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 800,
                      color: "#FF69B4",
                    }}
                  >
                    {systemHealth.healed}
                  </div>
                </div>

                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,192,203,0.4), rgba(255,228,235,0.95))",
                    padding: 14,
                    borderRadius: 12,
                    border: "1px solid #FFB6C1",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#C2185B",
                      marginBottom: 4,
                      fontWeight: 600,
                    }}
                  >
                    Currently being witnessed
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 800,
                      color: "#FF6FA3",
                    }}
                  >
                    {systemHealth.witnessing}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    padding: 12,
                    background: "rgba(255,240,245,0.9)",
                    borderRadius: 12,
                    fontSize: "0.8rem",
                    color: "#8B4513",
                    lineHeight: 1.6,
                  }}
                >
                  每一条被治愈的缺陷，对应社区在一次「偏离」后主动回到价值底线。
                </div>

                {/* Healing rate bar */}
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#A0522D",
                      marginBottom: 6,
                    }}
                  >
                    Healing rate
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 8,
                      background: "rgba(255,192,203,0.3)",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width:
                          flaws.length > 0
                            ? `${
                                (systemHealth.healed / flaws.length) * 100
                              }%`
                            : "0%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, #FF6FA3, #FFB6C1)",
                        borderRadius: 999,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#A0522D",
                      marginTop: 4,
                    }}
                  >
                    {flaws.length > 0
                      ? `${Math.round(
                          (systemHealth.healed / flaws.length) * 100
                        )}%`
                      : "0%"}{" "}
                    of system flaws have been healed
                  </div>
                </div>
              </div>
            </section>

            {/* My Awakening Journey */}
            <section
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,240,245,0.95))",
                borderRadius: 24,
                border: "2px solid #FFD1DC",
                padding: 24,
                boxShadow: "0 8px 32px rgba(255,182,193,0.2)",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 16,
                  fontSize: "1.3rem",
                  color: "#C71585",
                  fontWeight: 700,
                }}
              >
                🌟 My Awakening Journey
              </h3>

              {/* AWARE balance */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,182,193,0.25), rgba(255,228,235,0.95))",
                  padding: 16,
                  borderRadius: 16,
                  marginBottom: 16,
                  border: "1px solid #FF9BB3",
                }}
              >
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#A0522D",
                    marginBottom: 4,
                  }}
                >
                  AWARE balance
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#FF69B4",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {awareBalance !== null
                    ? parseFloat(awareBalance).toFixed(2)
                    : "—"}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#A0522D",
                    marginTop: 4,
                  }}
                >
                  Your emotional & cognitive labor is recognized here as
                  community value.
                </div>
              </div>

              {/* Participation stats */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,240,245,0.95)",
                    padding: 12,
                    borderRadius: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #FFD1DC",
                  }}
                >
                  <span style={{ fontSize: "0.9rem", color: "#8B4513" }}>
                    🔮 As Awakener
                  </span>
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#FF69B4",
                    }}
                  >
                    {myStats.awakened}
                  </span>
                </div>
                <div
                  style={{
                    background: "rgba(255,240,245,0.95)",
                    padding: 12,
                    borderRadius: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #FFD1DC",
                  }}
                >
                  <span style={{ fontSize: "0.9rem", color: "#8B4513" }}>
                    👁️ As Witness
                  </span>
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#FF69B4",
                    }}
                  >
                    {myStats.witnessed}
                  </span>
                </div>
                <div
                  style={{
                    background: "rgba(255,240,245,0.95)",
                    padding: 12,
                    borderRadius: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #FFD1DC",
                  }}
                >
                  <span style={{ fontSize: "0.9rem", color: "#8B4513" }}>
                    🛠️ As Repairer
                  </span>
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#FF69B4",
                    }}
                  >
                    {myStats.repaired}
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px dashed #FFD1DC",
                }}
              >
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#A0522D",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  🏆 Badges
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {myStats.awakened > 0 && (
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        background:
                          "linear-gradient(45deg, #FF9BB3, #FFC1D9)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#8B4513",
                      }}
                    >
                      Awakening Pioneer
                    </span>
                  )}
                  {myStats.witnessed >= 5 && (
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        background:
                          "linear-gradient(45deg, #FF69B4, #FFB6C1)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "white",
                      }}
                    >
                      Collective Witness
                    </span>
                  )}
                  {myStats.repaired > 0 && (
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        background:
                          "linear-gradient(45deg, #FFC0CB, #FFE4E9)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#8B4513",
                      }}
                    >
                      Logic Rewriter
                    </span>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Flaw Detail Modal */}
        {selectedFlaw && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 20,
            }}
            onClick={() => setSelectedFlaw(null)}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #FFFFFF, #FFF0F5)",
                borderRadius: 24,
                maxWidth: 800,
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: 32,
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setSelectedFlaw(null)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid #FFD1DC",
                  background: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8B4513",
                }}
              >
                ×
              </button>

              {/* Title */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>
                    {LAYER_EMOJI[selectedFlaw.layer]}
                  </span>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "1.6rem",
                      color: "#C71585",
                      fontWeight: 700,
                    }}
                  >
                    {LAYER_LABEL[selectedFlaw.layer]} #{selectedFlaw.id}
                  </h2>
                  {selectedFlaw.isHealed && (
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 999,
                        background:
                          "linear-gradient(45deg, #FF9BB3, #FFC1D9)",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#8B4513",
                      }}
                    >
                      ✨ Healed
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#A0522D",
                  }}
                >
                  First awakener: {shortAddr(selectedFlaw.firstWitness)} ·{" "}
                  {formatDateTime(selectedFlaw.witnessedAt)}
                </div>
              </div>

              {/* Flaw description */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    background: "rgba(255,240,245,0.9)",
                    padding: 16,
                    borderRadius: 12,
                    borderLeft: "3px solid #FF69B4",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#C71585",
                      marginBottom: 8,
                    }}
                  >
                    📍 Flaw Description
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      color: "#8B4513",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedFlaw.flawDescription}
                  </div>
                </div>
              </div>

              {/* Current vs desired logic */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    background: "rgba(255,105,180,0.12)",
                    padding: 14,
                    borderRadius: 12,
                    border: "1px solid #FF6FA3",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#C2185B",
                      marginBottom: 6,
                    }}
                  >
                    ❌ Current Logic
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#8B4513",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedFlaw.currentLogic}
                  </div>
                </div>
                {selectedFlaw.desiredLogic && (
                  <div
                    style={{
                      background: "rgba(255,228,235,0.9)",
                      padding: 14,
                      borderRadius: 12,
                      border: "1px solid #FFB6C1",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#C2185B",
                        marginBottom: 6,
                      }}
                    >
                      ✅ Desired Direction
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#8B4513",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {selectedFlaw.desiredLogic}
                    </div>
                  </div>
                )}
              </div>

              {/* Witness list */}
              <div style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    color: "#C71585",
                    marginBottom: 12,
                    fontWeight: 700,
                  }}
                >
                  👁️ Collective Witnesses ({selectedFlaw.collectiveWitness})
                </h3>

                {!selectedFlaw.isHealed && (
                  <div
                    style={{
                      background: "rgba(255,240,245,0.8)",
                      padding: 14,
                      borderRadius: 12,
                      marginBottom: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <textarea
                      value={witnessInput}
                      onChange={(e) => setWitnessInput(e.target.value)}
                      rows={2}
                      placeholder="Write your testimony: what do you see here?"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #FFD1DC",
                        fontSize: "0.9rem",
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                    <button
                      onClick={handleWitness}
                      disabled={submittingAction === "witness"}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 16,
                        border: "none",
                        background:
                          submittingAction === "witness"
                            ? "linear-gradient(45deg, #F2A1C7, #F8C6DD)"
                            : "linear-gradient(45deg, #FF69B4, #FFB6C1)",
                        color: "white",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor:
                          submittingAction === "witness"
                            ? "wait"
                            : "pointer",
                        alignSelf: "flex-start",
                      }}
                    >
                      {submittingAction === "witness"
                        ? "Recording..."
                        : "✍️ Add Testimony"}
                    </button>
                  </div>
                )}

                {witnessLists[selectedFlaw.id] &&
                witnessLists[selectedFlaw.id].length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {witnessLists[selectedFlaw.id].map((w, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "rgba(255,255,255,0.9)",
                          padding: 12,
                          borderRadius: 10,
                          border: "1px solid #FFD1DC",
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
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              color: "#C71585",
                            }}
                          >
                            {shortAddr(w.witness)}
                          </span>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#A0522D",
                            }}
                          >
                            {formatDateTime(w.witnessedAt)}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#8B4513",
                            lineHeight: 1.6,
                          }}
                        >
                          {w.testimony}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#A0522D",
                      fontSize: "0.85rem",
                      background: "rgba(255,240,245,0.7)",
                      borderRadius: 10,
                    }}
                  >
                    No other testimonies yet.
                  </div>
                )}
              </div>

              {/* Repair proposals */}
              <div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    color: "#C71585",
                    marginBottom: 12,
                    fontWeight: 700,
                  }}
                >
                  🛠️ Repair Proposals ({selectedFlaw.repairAttempts})
                </h3>

                {!selectedFlaw.isHealed && (
                  <div
                    style={{
                      background: "rgba(255,240,245,0.8)",
                      padding: 14,
                      borderRadius: 12,
                      marginBottom: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <textarea
                      value={repairNewLogic}
                      onChange={(e) => setRepairNewLogic(e.target.value)}
                      rows={2}
                      placeholder="Write the new logic you think is more just..."
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #FFD1DC",
                        fontSize: "0.9rem",
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                    <textarea
                      value={repairMetaphor}
                      onChange={(e) => setRepairMetaphor(e.target.value)}
                      rows={2}
                      placeholder="Use a metaphor to explain the social meaning of this new rule (optional)"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #FFD1DC",
                        fontSize: "0.9rem",
                        resize: "vertical",
                        outline: "none",
                        fontFamily: "inherit",
                      }}
                    />
                    <button
                      onClick={handleRepair}
                      disabled={submittingAction === "repair"}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 16,
                        border: "none",
                        background:
                          submittingAction === "repair"
                            ? "linear-gradient(45deg, #F2A1C7, #F8C6DD)"
                            : "linear-gradient(45deg, #FF8DAA, #FFB6C1)",
                        color: "white",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor:
                          submittingAction === "repair"
                            ? "wait"
                            : "pointer",
                        alignSelf: "flex-start",
                      }}
                    >
                      {submittingAction === "repair"
                        ? "Submitting..."
                        : "🛠️ Submit Repair Proposal"}
                    </button>
                  </div>
                )}

                {proposals.filter((p) => p.flawId === selectedFlaw.id)
                  .length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {proposals
                      .filter((p) => p.flawId === selectedFlaw.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          style={{
                            background: p.isIntegrated
                              ? "linear-gradient(135deg, rgba(255,182,193,0.3), rgba(255,255,255,0.95))"
                              : "rgba(255,255,255,0.9)",
                            padding: 16,
                            borderRadius: 12,
                            border: p.isIntegrated
                              ? "2px solid #FF9BB3"
                              : "1px solid #FFD1DC",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 8,
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  fontWeight: 600,
                                  color: "#C71585",
                                }}
                              >
                                Proposal #{p.id}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#A0522D",
                                  marginLeft: 8,
                                }}
                              >
                                by {shortAddr(p.rewriter)}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                padding: "3px 10px",
                                borderRadius: 999,
                                background: p.isIntegrated
                                  ? "linear-gradient(45deg, #FF9BB3, #FFC1D9)"
                                  : "rgba(255,192,203,0.4)",
                                border:
                                  "1px solid " +
                                  (p.isIntegrated
                                    ? "#FF9BB3"
                                    : "#FFB6C1"),
                                fontWeight: 600,
                              }}
                            >
                              {p.isIntegrated ? "✨ Integrated" : "Awaiting Consensus"}
                            </span>
                          </div>

                          <div
                            style={{
                              background: "rgba(255,192,203,0.25)",
                              padding: 12,
                              borderRadius: 10,
                              marginBottom: 8,
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#C2185B",
                                marginBottom: 4,
                              }}
                            >
                              New Logic
                            </div>
                            <div
                              style={{
                                fontSize: "0.85rem",
                                color: "#8B4513",
                                lineHeight: 1.6,
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {p.newLogic}
                            </div>
                          </div>

                          {p.metaphor && (
                            <div
                              style={{
                                background: "rgba(255,240,245,0.9)",
                                padding: 12,
                                borderRadius: 10,
                                marginBottom: 8,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  color: "#C71585",
                                  marginBottom: 4,
                                }}
                              >
                                Metaphor
                              </div>
                              <div
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#8B4513",
                                  lineHeight: 1.6,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {p.metaphor}
                              </div>
                            </div>
                          )}

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginTop: 10,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "#A0522D",
                              }}
                            >
                              💗 {p.collectiveAgreement} agreements
                            </span>
                            {!p.isIntegrated && (
                              <button
                                onClick={() => handleAgree(p.id)}
                                disabled={
                                  submittingAction === "agreement"
                                }
                                style={{
                                  padding: "6px 14px",
                                  borderRadius: 999,
                                  border: "none",
                                  background:
                                    submittingAction === "agreement"
                                      ? "linear-gradient(45deg, #F2A1C7, #F8C6DD)"
                                      : "linear-gradient(45deg, #FF9BB3, #FFC1D9)",
                                  color: "#8B1A3F",
                                  fontSize: "0.8rem",
                                  fontWeight: 600,
                                  cursor:
                                    submittingAction === "agreement"
                                      ? "wait"
                                      : "pointer",
                                }}
                              >
                                {submittingAction === "agreement"
                                  ? "Recording..."
                                  : "💗 I agree with this repair"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#A0522D",
                      fontSize: "0.85rem",
                      background: "rgba(255,240,245,0.7)",
                      borderRadius: 10,
                    }}
                  >
                    No repair proposals yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
        因为被看见，才有修复的可能；因为能修复，我们才更自由。
      </footer>
    </div>
  );
}
