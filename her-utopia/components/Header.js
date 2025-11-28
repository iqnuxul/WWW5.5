import React, { useState, useEffect } from "react";
import { connectWallet } from "../utils/connectWallet";

export default function Header() {
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAddress(accounts[0] || null);
      });
    }
  }, []);

  async function onConnect() {
    try {
      const res = await connectWallet();
      setAddress(res.address);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  function short(addr) {
    if (!addr) return "";
    return addr.slice(0,6) + "..." + addr.slice(-4);
  }

  return (
    <header style={{
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      padding: "15px 20px", 
      background: "linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 100%)",
      color: "#8B4513",
      borderBottom: "2px solid #FFB6C1"
    }}>
      <div style={{ 
        fontWeight: "600", 
        fontSize: "1.1em",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: "#FF69B4"
      }}>
        Desire without Domination. Love without Ownership. Governance without Hierarchy.
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {address ? (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "15px",
            background: "rgba(255, 255, 255, 0.5)",
            padding: "8px 15px",
            borderRadius: "25px",
            border: "1px solid #FFB6C1"
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#32CD32",
              animation: "pulse 2s infinite"
            }}></div>
            <span style={{ fontWeight: "600", fontSize: "0.9em" }}>Connected: {short(address)}</span>
            <button 
              onClick={() => { setAddress(null); window.location.reload(); }}
              style={{
                padding: "6px 12px",
                background: "#FF69B4",
                color: "white",
                border: "none",
                borderRadius: "15px",
                cursor: "pointer",
                fontSize: "0.8em",
                fontWeight: "600",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#FF1493";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#FF69B4";
                e.target.style.transform = "scale(1)";
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            onClick={onConnect}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(45deg, #FF69B4, #FFB6C1)",
              color: "white",
              border: "none",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9em",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(255, 105, 180, 0.3)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(255, 105, 180, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(255, 105, 180, 0.3)";
            }}
          >
            🔗 Connect Wallet
          </button>
        )}
        {error && (
          <div style={{ 
            color: "#FF4500", 
            marginTop: 8, 
            fontSize: "0.8em",
            background: "rgba(255, 69, 0, 0.1)",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #FF4500"
          }}>
            {error}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </header>
  );
}