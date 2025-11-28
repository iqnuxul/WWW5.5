// components/ModuleTemplate.js
import React from "react";

export default function ModuleTemplate({ title, description, submodules, color }) {
  return (
    <div style={{ padding: "60px", minHeight: "100vh", background: "linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 100%)", color: "#8B4513" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>{title}</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "40px", lineHeight: "1.6" }}>{description}</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "25px"
      }}>
        {submodules.map((sub) => (
          <div
            key={sub.id}
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}50 100%)`,
              border: `2px solid ${color}`,
              borderRadius: "20px",
              padding: "25px",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.4s ease",
              display: "flex",
              flexDirection: "column",
              gap: "15px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-10px)";
              e.currentTarget.style.boxShadow = `0 20px 40px ${color}80, 0 0 60px ${color}50 inset`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Icon & Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "2rem" }}>{sub.icon}</div>
              {sub.status && (
                <span style={{
                  fontSize: "0.8rem",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  background: sub.statusColor || "#FFC0CB",
                  color: "white",
                  fontWeight: "600"
                }}>
                  {sub.status}
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "1.3rem" }}>{sub.name}</h3>
              <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.4", color: "#A0522D" }}>{sub.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
