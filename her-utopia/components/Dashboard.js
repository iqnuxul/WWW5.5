import React from "react";
import DebugBoard from "./DebugBoard";
import CommonsBoard from "./CommonsBoard";

export default function Dashboard() {
  return (
    <div style={{
      padding: "20px",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      color: "white",
      minHeight: "100vh"
    }}>
      <h1 style={{ color: "#8a4fff", textAlign: "center" }}>Her Utopia — 系统仪表盘</h1>
      
      <section style={{ marginTop: "30px" }}>
        <h2 style={{ color: "#ff6b8b" }}>🩸 Debug / 共感调试层</h2>
        <DebugBoard />
      </section>

      <section style={{ marginTop: "40px" }}>
        <h2 style={{ color: "#4ecdc4" }}>💬 Commons / 社区共识</h2>
        <CommonsBoard />
      </section>

      <section style={{ marginTop: "40px", padding: "20px", background: "rgba(255,255,255,0.1)", borderRadius: "10px" }}>
        <h3>🚀 下一步开发计划</h3>
        <ul>
          <li>🔗 连接真实合约地址</li>
          <li>📄 导入合约 ABI 文件</li>
          <li>🌐 添加 IPFS 上传功能</li>
          <li>🎨 完善用户界面</li>
          <li>📱 响应式设计优化</li>
        </ul>
      </section>
    </div>
  );
}