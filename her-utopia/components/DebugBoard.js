import React, { useState, useEffect } from "react";
import { connectWallet } from "../utils/connectWallet";
import { getContractInstance } from "../utils/getContract";
import { ethers } from "ethers";

export default function DebugBoard() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [bugTitle, setBugTitle] = useState("");
  const [descCID, setDescCID] = useState("");
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 新添加的状态
  const [isMember, setIsMember] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [patchTitle, setPatchTitle] = useState("");
  const [patchDescription, setPatchDescription] = useState("");
  const [selectedBugId, setSelectedBugId] = useState("");
  const [proposing, setProposing] = useState(false);
  const [empathyAmount, setEmpathyAmount] = useState("");
  const [selectedPatchId, setSelectedPatchId] = useState("");
  const [voting, setVoting] = useState(false);

  // 自动在 mount 时读取问题列表（如果可用）
  useEffect(() => {
    fetchBugCount();
  }, []);

  // 静默连接（如果 MetaMask 已授权）
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum && window.ethereum.selectedAddress) {
      setAccount(window.ethereum.selectedAddress);
    }

    // 监听账户变化
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
        if (!accounts[0]) {
          setIsMember(false);
        }
      });
    }
  }, []);

  // 检查并注册成员资格
  useEffect(() => {
    if (account) {
      checkAndRegisterMembership();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  async function checkAndRegisterMembership() {
    if (!account) return;

    setMembershipLoading(true);
    try {
      console.log("🔍 检查成员资格...");
      const providerLocal = (await connectWallet()).provider;
      const territory = getContractInstance("HerTerritory", providerLocal);

      // territory.addressToMemberId 返回 uint
      const mid = await territory.addressToMemberId(account);
      // mid 可能是 BigNumber
      const midNum = mid && mid.toString ? mid.toString() : String(mid);
      console.log("成员ID:", midNum);

      if (midNum === "0") {
        // 不是成员 -> 注册
        console.log("🆕 注册成为社区成员...");
        const signerLocal = (await connectWallet()).signer;
        setSigner(signerLocal);
        const territoryWithSigner = getContractInstance("HerTerritory", signerLocal);

        if (typeof territoryWithSigner.joinCommunity !== "function") {
          throw new Error("joinCommunity 方法在合约 ABI 中未找到，检查 ABI/合约地址");
        }

        const tx = await territoryWithSigner.joinCommunity();
        console.log("⏳ 成员注册交易提交:", tx.hash);
        await tx.wait();
        console.log("✅ 成员注册成功");
        setIsMember(true);
        alert("🎉 欢迎加入 Her Utopia 社区！");
      } else {
        console.log("✅ 已是社区成员");
        setIsMember(true);
      }
    } catch (error) {
      console.error("❌ 成员资格检查失败:", error);
      const friendly = parseRpcError(error);
      alert("成员注册/检查失败: " + friendly);
    } finally {
      setMembershipLoading(false);
    }
  }

  async function handleConnect() {
    try {
      const res = await connectWallet();
      setAccount(res.address);
      setProvider(res.provider);
      setSigner(res.signer);
    } catch (e) {
      alert(e.message || e);
    }
  }

  async function reportBug() {
    if (!signer) {
      await handleConnect();
      return;
    }

    if (!bugTitle.trim()) {
      alert("请输入问题标题");
      return;
    }

    // 检查成员资格
    if (!isMember) {
      alert("请先完成社区成员注册");
      await checkAndRegisterMembership();
      if (!isMember) return;
    }

    setLoading(true);
    try {
      const contract = getContractInstance("HerDebug", signer);

      if (typeof contract.reportBug !== "function") {
        throw new Error("reportBug 方法在合约 ABI 中未找到，检查 ABI/合约地址");
      }

      console.log("📮 提交问题到区块链...");

      // selected issueType 从下拉取的示例，这里用 2（你可以把下拉的值传入）
      const issueType = 2;

      // 合约可能期望 uint 参数，确保 selectedBugId 等被转换成 number
      const tx = await contract.reportBug(
        issueType,
        bugTitle,
        descCID && descCID.trim() !== "" ? descCID : "QmDefaultCID",
        0,
        0,
        0,
        { value: 0 }
      );

      console.log("✅ 交易已提交，哈希:", tx.hash);
      const etherscanLink = chainEtherscanLink(tx.hash);
      alert(`⏳ 交易已提交！等待区块链确认...\n\n查看交易: ${etherscanLink}`);

      const receipt = await tx.wait();
      console.log("✅ 交易确认，区块:", receipt.blockNumber);
      alert(`🎉 问题报告成功！ 区块: ${receipt.blockNumber}`);

      // 清空表单并刷新
      setBugTitle("");
      setDescCID("");
      await fetchBugCount();
    } catch (err) {
      console.error("❌ 提交失败:", err);
      alert(parseRpcError(err));
    } finally {
      setLoading(false);
    }
  }

  async function proposePatch() {
    if (!signer) {
      await handleConnect();
      return;
    }

    if (!patchTitle.trim() || selectedBugId === "") {
      alert("请填写补丁标题并选择要修复的问题");
      return;
    }

    if (!isMember) {
      alert("请先完成社区成员注册");
      return;
    }

    setProposing(true);
    try {
      const contract = getContractInstance("HerDebug", signer);
      if (typeof contract.proposePatch !== "function") {
        throw new Error("proposePatch 方法在合约 ABI 中未找到，检查 ABI/合约地址");
      }

      console.log("🔧 提交补丁提案...");
      // 把 selectedBugId 转数
      const bugIdNum = Number(selectedBugId);

      const tx = await contract.proposePatch(
        bugIdNum,
        patchTitle,
        patchDescription || "No description provided",
        "QmPatchCID"
      );

      console.log("✅ 补丁提案交易提交:", tx.hash);
      alert(`⏳ 补丁提案已提交！查看交易: ${chainEtherscanLink(tx.hash)}`);

      const receipt = await tx.wait();
      console.log("✅ 补丁提案确认，区块:", receipt.blockNumber);
      alert(`🎉 补丁提案成功！ 区块: ${receipt.blockNumber}`);

      // 清空
      setPatchTitle("");
      setPatchDescription("");
      setSelectedBugId("");
      await fetchBugCount();
    } catch (err) {
      console.error("❌ 补丁提案失败:", err);
      alert(parseRpcError(err));
    } finally {
      setProposing(false);
    }
  }

  async function empathyVote() {
    if (!signer) {
      await handleConnect();
      return;
    }

    if (!selectedPatchId && selectedPatchId !== 0) {
      alert("请选择补丁");
      return;
    }
    if (!empathyAmount || Number(empathyAmount) <= 0) {
      alert("请输入有效的共感金额");
      return;
    }

    if (!isMember) {
      alert("请先完成社区成员注册");
      return;
    }

    setVoting(true);
    try {
      const contract = getContractInstance("HerDebug", signer);

      if (typeof contract.empathyVote !== "function") {
        throw new Error("empathyVote 方法在合约 ABI 中未找到，检查 ABI/合约地址");
      }

      // 把金额转成 token 最小单位（假设 MOOD 是 18 decimals）
      const amountWei = ethers.utils.parseUnits(String(empathyAmount), 18);
      const patchIdNum = Number(selectedPatchId);

      // NOTE: 如果合约在 empathyVote 中内部调用 IERC20.transferFrom(contract, ...)，必须先 approve
      // 这里我们只是发出交易，如果失败请先在前端做 approve 流程
      const tx = await contract.empathyVote(patchIdNum, amountWei);
      console.log("✅ 共感投票交易提交:", tx.hash);
      alert(`⏳ 共感投票已提交！查看交易: ${chainEtherscanLink(tx.hash)}`);

      const receipt = await tx.wait();
      console.log("✅ 共感投票确认，区块:", receipt.blockNumber);
      alert(`🎉 共感投票成功！ 区块: ${receipt.blockNumber}`);

      setEmpathyAmount("");
      setSelectedPatchId("");
    } catch (err) {
      console.error("❌ 共感投票失败:", err);
      // 如果是 allowance 问题，给出提示
      const msg = parseRpcError(err);
      if (msg.toLowerCase().includes("allowance") || msg.toLowerCase().includes("approve")) {
        alert(msg + "\n提示：请先对 MOOD 合约执行 approve(thisDebugContract, amount) 操作。");
      } else {
        alert(msg);
      }
    } finally {
      setVoting(false);
    }
  }

  async function fetchBugCount() {
    try {
      const providerLocal = (await connectWallet()).provider;
      const readContract = getContractInstance("HerDebug", providerLocal);

      console.log("🔍 从区块链读取问题数据...");
      if (typeof readContract.totalBugs !== "function") {
        console.warn("totalBugs 方法未找到，使用模拟数据");
        setMockBugs();
        return;
      }

      const totalBugsBn = await readContract.totalBugs();
      const totalBugs = totalBugsBn && totalBugsBn.toNumber ? totalBugsBn.toNumber() : Number(totalBugsBn);

      console.log("🐛 区块链上的总问题数:", totalBugs);

      if (totalBugs > 0) {
        const realBugs = [];
        for (let i = 0; i < totalBugs; i++) {
          try {
            const bug = await readContract.bugReports(i);
            realBugs.push({
              id: bug.id.toString ? bug.id.toString() : String(bug.id),
              title: bug.title || (bug[3] ? bug[3] : "Untitled"),
              reporter: bug.reporter || bug[1] || "0x0",
              issueType: bug.issueType ? bug.issueType.toString() : (bug[2] ? bug[2].toString() : "N/A")
            });
          } catch (e) {
            console.warn(`读取问题 ${i} 失败:`, e);
          }
        }
        setBugs(realBugs);
        console.log("✅ 加载真实区块链数据:", realBugs);
      } else {
        setMockBugs();
      }
    } catch (e) {
      console.error("❌ 数据读取完全失败:", e);
      alert("数据读取失败: " + parseRpcError(e));
      setMockBugs();
    }
  }

  function setMockBugs() {
    const mockBugs = [
      { id: "1", title: "治理流程不透明", reporter: "0x1234...5678", issueType: "Governance" },
      { id: "2", title: "社区沟通效率低", reporter: "0x8765...4321", issueType: "Communication" }
    ];
    setBugs(mockBugs);
  }

  /* ----------------- 辅助函数 ----------------- */

  function chainEtherscanLink(txHash) {
    // 你可以根据实际网替换 sepolia 或 mainnet
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }

  function parseRpcError(err) {
    try {
      if (!err) return "未知错误";
      if (err.reason) return err.reason;
      if (err.message) return err.message;
      // some provider errors embed message in data
      if (err.data && err.data.message) return err.data.message;
      if (err.error && err.error.message) return err.error.message;
      return JSON.stringify(err);
    } catch (e) {
      return "解析错误失败";
    }
  }

  /* ----------------- JSX（保留你原来漂亮的 UI） ----------------- */
  return (
    <div style={{
      padding: "20px",
      color: "#fff",
      background: "linear-gradient(135deg, #2d1b69 0%, #1a1a2e 100%)",
      minHeight: "100vh",
      borderRadius: "15px",
      border: "2px solid #8a4fff"
    }}>
      <h1 style={{ color: "#ff6b8b", textAlign: "center", marginBottom: "30px" }}>
        🩸 Her Utopia Debug Board
      </h1>
      <p style={{ textAlign: "center", color: "#adb5bd", marginBottom: "30px" }}>
        Report social bugs and build collective empathy through patches and voting
      </p>

      {/* 连接钱包和成员状态 */}
      <div style={{
        background: "rgba(255,255,255,0.1)",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "25px",
        border: "1px solid rgba(255,255,255,0.2)"
      }}>
        <div style={{ marginBottom: "16px" }}>
          {!account ? (
            <button
              onClick={handleConnect}
              style={{
                padding: "12px 24px",
                background: "#8a4fff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600"
              }}
            >
              🔗 Connect Wallet
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
              <div style={{ color: "#4ecdc4", fontSize: "16px" }}>
                🔗 Connected: {account.slice(0,8)}...{account.slice(-6)}
              </div>
              {membershipLoading ? (
                <div style={{
                  background: "#ffd166",
                  color: "#8B4513",
                  padding: "6px 12px",
                  borderRadius: "15px",
                  fontSize: "0.9em",
                  fontWeight: "600"
                }}>
                  ⏳ Checking Membership...
                </div>
              ) : isMember ? (
                <div style={{
                  background: "#4ecdc4",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "15px",
                  fontSize: "0.9em",
                  fontWeight: "600"
                }}>
                  ✅ Community Member
                </div>
              ) : (
                <div style={{
                  background: "#ff6b8b",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "15px",
                  fontSize: "0.9em",
                  fontWeight: "600"
                }}>
                  ❌ Not a Member
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 问题报告表单 */}
      <div style={{
        background: "rgba(255,255,255,0.1)",
        padding: "25px",
        borderRadius: "15px",
        marginBottom: "25px",
        border: "1px solid rgba(255,107,139,0.3)"
      }}>
        <h3 style={{ color: "#ff6b8b", marginBottom: "20px" }}>📝 Report a Social Bug</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#adb5bd" }}>
              Issue Type:
            </label>
            <select
              defaultValue="2"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#2a2a2a",
                color: "white",
                border: "1px solid #444",
                fontSize: "14px"
              }}
            >
              <option value="1">Technical Issue</option>
              <option value="2">Governance Issue</option>
              <option value="3">Communication Issue</option>
              <option value="4">Fairness Concern</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#adb5bd" }}>
              Title:
            </label>
            <input
              type="text"
              placeholder="Brief description of the issue"
              value={bugTitle}
              onChange={(e) => setBugTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#2a2a2a",
                color: "white",
                border: "1px solid #444",
                fontSize: "14px"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#adb5bd" }}>
              Description CID (IPFS):
            </label>
            <input
              type="text"
              placeholder="IPFS CID for detailed description (optional)"
              value={descCID}
              onChange={(e) => setDescCID(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#2a2a2a",
                color: "white",
                border: "1px solid #444",
                fontSize: "14px"
              }}
            />
          </div>
        </div>

        <button
          onClick={reportBug}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: loading ? "#666" : "#ff6b8b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease"
          }}
        >
          {loading ? "⏳ Submitting to Blockchain..." : "🚀 Submit Bug Report"}
        </button>
      </div>

      {/* 补丁提案表单 */}
      <div style={{
        background: "rgba(255,255,255,0.1)",
        padding: "25px",
        borderRadius: "15px",
        marginBottom: "25px",
        border: "1px solid rgba(78, 205, 196, 0.3)"
      }}>
        <h3 style={{ color: "#4ecdc4", marginBottom: "20px" }}>🔧 Submit Patch Proposal</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#adb5bd" }}>
              Select Bug to Fix:
            </label>
            <select
              value={selectedBugId}
              onChange={e => setSelectedBugId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#2a2a2a",
                color: "white",
                border: "1px solid #444",
                fontSize: "14px"
              }}
            >
              <option value="">Choose a bug to fix</option>
              {bugs.map(bug => (
                <option key={bug.id} value={bug.id}>
                  #{bug.id} - {bug.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#adb5bd" }}>
              Patch Title:
            </label>
            <input
              type="text"
              placeholder="Title of your proposed patch"
              value={patchTitle}
              onChange={e => setPatchTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#2a2a2a",
                color: "white",
                border: "1px solid #444",
                fontSize: "14px"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#adb5bd" }}>
              Patch Description:
            </label>
            <textarea
              placeholder="Detailed description of your patch solution"
              value={patchDescription}
              onChange={e => setPatchDescription(e.target.value)}
              rows="3"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#2a2a2a",
                color: "white",
                border: "1px solid #444",
                fontSize: "14px",
                resize: "vertical"
              }}
            />
          </div>
        </div>

        <button
          onClick={proposePatch}
          disabled={proposing}
          style={{
            width: "100%",
            padding: "14px",
            background: proposing ? "#666" : "#4ecdc4",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: proposing ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease"
          }}
        >
          {proposing ? "⏳ Submitting Proposal..." : "🔧 Submit Patch Proposal"}
        </button>
      </div>

      {/* 共感投票表单 */}
      <div style={{
        background: "rgba(255,255,255,0.1)",
        padding: "25px",
        borderRadius: "15px",
        marginBottom: "25px",
        border: "1px solid rgba(138, 79, 255, 0.3)"
      }}>
        <h3 style={{ color: "#8a4fff", marginBottom: "20px" }}>❤️ Empathy Voting</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#adb5bd" }}>
              Select Patch to Support:
            </label>
            <select
              value={selectedPatchId}
              onChange={e => setSelectedPatchId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#2a2a2a",
                color: "white",
                border: "1px solid #444",
                fontSize: "14px"
              }}
            >
              <option value="">Choose a patch to support</option>
              <option value="0">Patch #1 - Improve Governance Process</option>
              <option value="1">Patch #2 - Enhance Communication</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#adb5bd" }}>
              Empathy Amount (MOOD):
            </label>
            <input
              type="number"
              placeholder="Amount of MOOD tokens to stake"
              value={empathyAmount}
              onChange={e => setEmpathyAmount(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                background: "#2a2a2a",
                color: "white",
                border: "1px solid #444",
                fontSize: "14px"
              }}
            />
          </div>
        </div>

        <button
          onClick={empathyVote}
          disabled={voting}
          style={{
            width: "100%",
            padding: "14px",
            background: voting ? "#666" : "#8a4fff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: voting ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease"
          }}
        >
          {voting ? "⏳ Casting Vote..." : "❤️ Cast Empathy Vote"}
        </button>
      </div>

      {/* 问题列表 */}
      <div style={{
        background: "rgba(255,255,255,0.1)",
        padding: "25px",
        borderRadius: "15px",
        border: "1px solid rgba(255,255,255,0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ color: "#ffd166", margin: 0 }}>🐛 Community Bug Reports</h3>
          <button
            onClick={fetchBugCount}
            style={{
              padding: "10px 20px",
              background: "#ffd166",
              color: "#8B4513",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.3s ease"
            }}
          >
            🔄 Refresh List
          </button>
        </div>

        <div>
          {bugs.length === 0 ? (
            <div style={{
              textAlign: "center",
              color: "#adb5bd",
              padding: "40px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              border: "1px dashed #adb5bd"
            }}>
              <p>No bug reports yet.</p>
              <p>Be the first to report a social issue!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "15px" }}>
              {bugs.map((bug) => (
                <div key={bug.id} style={{
                  padding: "20px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <h4 style={{
                      color: "#ff6b8b",
                      margin: 0,
                      fontSize: "1.1em"
                    }}>
                      #{bug.id} - {bug.title}
                    </h4>
                    <span style={{
                      background: "rgba(255,107,139,0.2)",
                      color: "#ff6b8b",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      fontSize: "0.8em",
                      fontWeight: "600"
                    }}>
                      Type: {bug.issueType}
                    </span>
                  </div>
                  <div style={{ color: "#adb5bd", fontSize: "0.9em" }}>
                    Reported by: {bug.reporter}
                  </div>
                  <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <button onClick={() => setSelectedBugId(bug.id)} style={{
                      padding: "6px 12px",
                      background: "transparent",
                      color: "#4ecdc4",
                      border: "1px solid #4ecdc4",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.8em"
                    }}>
                      Propose Patch
                    </button>
                    <button style={{
                      padding: "6px 12px",
                      background: "transparent",
                      color: "#8a4fff",
                      border: "1px solid #8a4fff",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.8em"
                    }}>
                      Support
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
