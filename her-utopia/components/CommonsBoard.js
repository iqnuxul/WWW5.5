import React, { useState } from "react";
import { connectWallet } from "../utils/connectWallet";
import { getContractInstance } from "../utils/getContract";

export default function CommonsBoard() {
  const [account, setAccount] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadProposals() {
    setLoading(true);
    try {
      const provider = (await connectWallet()).provider;
      const read = getContractInstance("HerCommons", provider);
      
      // 模拟提案数据
      const mockProposals = [
        { id: "1", title: "改善社区沟通机制", description: "建议每周举行线上共识会议" },
        { id: "2", title: "资金分配透明化", description: "建立公开的资金使用追踪系统" },
        { id: "3", title: "新人引导计划", description: "为新成员创建完整的学习路径" }
      ];
      
      setProposals(mockProposals);
      
    } catch (e) {
      console.error("加载提案错误:", e);
      alert("加载提案失败: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      border: "1px solid #4ecdc4",
      padding: "20px",
      borderRadius: "12px",
      background: "rgba(78, 205, 196, 0.1)"
    }}>
      <button 
        onClick={loadProposals}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: loading ? "#666" : "#4ecdc4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: "16px"
        }}
      >
        {loading ? "⏳ 加载中..." : "📋 加载社区提案"}
      </button>
      
      <div>
        <h4 style={{ color: "#4ecdc4" }}>社区共识提案</h4>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {proposals.length === 0 && (
            <li style={{ color: "#aaa", padding: "10px" }}>
              暂无提案数据，点击上方按钮加载模拟数据
            </li>
          )}
          {proposals.map((proposal, i) => (
            <li key={i} style={{
              padding: "16px",
              margin: "10px 0",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              <strong style={{ color: "#8a4fff" }}>#{proposal.id} {proposal.title}</strong>
              <br />
              <span style={{ color: "#ccc" }}>{proposal.description}</span>
              <div style={{ marginTop: "8px" }}>
                <button style={{
                  padding: "4px 8px",
                  marginRight: "8px",
                  background: "transparent",
                  color: "#4ecdc4",
                  border: "1px solid #4ecdc4",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}>
                  支持
                </button>
                <button style={{
                  padding: "4px 8px",
                  background: "transparent",
                  color: "#ff6b8b",
                  border: "1px solid #ff6b8b",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}>
                  讨论
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}