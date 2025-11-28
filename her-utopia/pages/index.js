import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Link from "next/link";
import { connectWallet } from "../utils/connectWallet";
import { getContract } from "../utils/getContract";

// Flip Book Component
function FlipBook() {
  const [currentPage, setCurrentPage] = useState(0);
  
  const pages = [
    {
      title: "",
      content: "Her Utopia 是一项基于区块链的去中心化女性主义社会实验，它旨在通过智能合约重写社会分工、价值流向、信任与关系的逻辑，构建一个由女性共识驱动、非依附式的链上微型社会。这不仅是一次技术协议的构建，更是一场让女性成为生产与治理核心节点的全新社会契约的编写。在这个系统中，女性不再被排除在价值定义与资源配置之外，而是共治与再分配机制的主体。它的目标不是建立一个完美社会，而是通过代码与共识，让女性主义中的关键理念——平等、共鸣、包容、主体性——在链上获得一次可验证、可持续的实验。",
      isTitle: true
    },
    {
      number: 1,
      title: "归属与信任先于交易",
      subtitle: "Belonging and Trust Before Transactions",
      content: "Her Territory 以身份自决与去权力构建归属，使信任关系成为所有行为的前提，而非交易的附属品。"
    },
    {
      number: 2,
      title: "价值在关系中流动",
      subtitle: "Value Flows Through Relationships",
      content: "Her Economy 将女性被忽视的多种劳动制度化为价值，使代币成为互助关系的能量流动而非资本积累的工具。"
    },
    {
      number: 3,
      title: "共识优先于表决",
      subtitle: "Consensus Before Voting",
      content: "Her Commons 通过倾听期与协作式讨论生成决策，让理解先于投票，拒绝以数字形成结构性压制。"
    },
    {
      number: 4,
      title: "叙事主权归于主体",
      subtitle: "Narrative Sovereignty Belongs to the Self",
      content: "HerStory 让每位成员以自己的方式书写与封存经验，使叙事不再被审视或扭曲，而被共鸣与见证存续。"
    },
    {
      number: 5,
      title: "边界定义自由",
      subtitle: "Boundaries Define Freedom",
      content: "Her Protocol 将同意与边界写入逻辑，使关系成为可协商的、非占有式的共存，而非占有或默许。"
    },
    {
      number: 6,
      title: "以调试修复世界逻辑",
      subtitle: "Debugging Rewrites the Logic of the World",
      content: "Her Debug 将结构性不公视为可修复的系统缺陷，以见证—分析—调试的流程共同重写更公平的运行逻辑。"
    }
  ];

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const page = pages[currentPage];

  return (
    <div style={{
      background: "white",
      borderRadius: "20px",
      padding: "45px 35px",
      boxShadow: "0 20px 60px rgba(255, 105, 180, 0.2), inset 0 0 0 1px rgba(255, 182, 193, 0.3)",
      minHeight: "650px",
      maxWidth: "650px",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }}>
      {/* Book decoration lines */}
      <div style={{
        position: "absolute",
        left: "30px",
        top: 0,
        bottom: 0,
        width: "2px",
        background: "linear-gradient(to bottom, transparent, #FFB6C1, transparent)"
      }} />

      {/* Content */}
      <div style={{ flex: 1 }}>
        {page.isTitle ? (
          <div style={{ textAlign: "center", paddingTop: "60px" }}>
            <div style={{
              fontSize: "3.5rem",
              marginBottom: "30px"
            }}>📖</div>
            <p style={{
              fontSize: "1.2rem",
              color: "#FF69B4",
              lineHeight: "1.8",
              maxWidth: "500px",
              margin: "0 auto",
              fontWeight: "600"
            }}>
              {page.content}
            </p>
          </div>
        ) : (
          <div>
            <h3 style={{  
              fontSize: "2rem",
              color: "#8B4513",
              marginBottom: "16px",
              fontWeight: "800",
              lineHeight: "1.4"
            }}>
              {page.title}
            </h3>

            <p style={{
              fontSize: "1.6rem",
              color: "#FF69B4",
              marginBottom: "100px",
              fontStyle: "italic",
              fontWeight: "600"
            }}>
              {page.subtitle}
            </p>

            <p style={{
              maxWidth: "540px",  
              margin: "0 auto", 
              fontSize: "1.2rem",
              color: "#A0522D",
              lineHeight: "1.9",
              textAlign: "justify",
              textIndent: "2em",
            }}>
              {page.content}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "30px",
        paddingTop: "20px",
        borderTop: "2px solid rgba(255, 182, 193, 0.2)"
      }}>
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          style={{
            width: "40px",
            height: "40px",
            background: currentPage === 0 ? "#f0f0f0" : "linear-gradient(135deg, #FF69B4, #FFB6C1)",
            color: currentPage === 0 ? "#ccc" : "white",
            border: "none",
            borderRadius: "50%",
            cursor: currentPage === 0 ? "not-allowed" : "pointer",
            fontSize: "1.2rem",
            fontWeight: "700",
            transition: "all 0.3s ease",
            boxShadow: currentPage === 0 ? "none" : "0 4px 15px rgba(255, 105, 180, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseEnter={(e) => {
            if (currentPage !== 0) {
              e.target.style.transform = "translateX(-3px) scale(1.1)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateX(0) scale(1)";
          }}
        >
          ←
        </button>

        <div style={{
          fontSize: "0.85rem",
          color: "#A0522D",
          fontWeight: "600"
        }}>
          {currentPage + 1} / {pages.length}
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          style={{
            width: "40px",
            height: "40px",
            background: currentPage === pages.length - 1 ? "#f0f0f0" : "linear-gradient(135deg, #FF69B4, #FFB6C1)",
            color: currentPage === pages.length - 1 ? "#ccc" : "white",
            border: "none",
            borderRadius: "50%",
            cursor: currentPage === pages.length - 1 ? "not-allowed" : "pointer",
            fontSize: "1.2rem",
            fontWeight: "700",
            transition: "all 0.3s ease",
            boxShadow: currentPage === pages.length - 1 ? "none" : "0 4px 15px rgba(255, 105, 180, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseEnter={(e) => {
            if (currentPage !== pages.length - 1) {
              e.target.style.transform = "translateX(3px) scale(1.1)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateX(0) scale(1)";
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  // 状态管理
  const [account, setAccount] = useState("");
  const [networkStatus, setNetworkStatus] = useState("Checking...");
  const [contractStatus, setContractStatus] = useState("Checking...");
  const [memberCount, setMemberCount] = useState(0);

  // 检查系统状态
  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // 检查钱包连接
      const walletAccount = await connectWallet();
      if (walletAccount) {
        setAccount(walletAccount);
        setNetworkStatus("Connected");
      } else {
        setNetworkStatus("Disconnected");
      }

      // 检查合约状态
      try {
        const contract = await getContract("HerTerritory");
        if (contract) {
          setContractStatus("Running");
          
          // 获取成员数量
          const count = await contract.totalMembers();
          setMemberCount(Number(count));
        } else {
          setContractStatus("Error");
        }
      } catch (error) {
        console.error("Contract check failed:", error);
        setContractStatus("Error");
      }
    } catch (error) {
      console.error("System status check failed:", error);
      setNetworkStatus("Error");
      setContractStatus("Error");
    }
  };

  const modules = [
    {
      id: "territory",
      name: "🌏 HerTerritory",
      gradient: "linear-gradient(135deg, #FF69B4 0%, #FFB6C1 100%)",
      path: "/herterritory",
      glowColor: "255, 105, 180"
    },
    {
      id: "economy", 
      name: "💰 HerEconomy",
      gradient: "linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)",
      path: "/hereconomy",
      glowColor: "255, 192, 203"
    },
    {
      id: "commons",
      name: "💬 HerCommons", 
      gradient: "linear-gradient(135deg, #FFC0CB 0%, #FFD1DC 100%)",
      path: "/hercommons",
      glowColor: "255, 209, 220"
    },
    {
      id: "story",
      name: "🪶 HerStory",
      gradient: "linear-gradient(135deg, #FFD1DC 0%, #FFE4E9 100%)",
      path: "/herstory",
      glowColor: "255, 228, 233"
    },
    {
      id: "protocol",
      name: "📜 HerProtocol",
      gradient: "linear-gradient(135deg, #FFE4E9 0%, #FFF0F5 100%)",
      path: "/herprotocol",
      glowColor: "255, 240, 245"
    },
    {
      id: "debug",
      name: "🩸 HerDebug",
      gradient: "linear-gradient(135deg, #FFF0F5 0%, #FDEDF0 100%)",
      path: "/herdebug",
      glowColor: "253, 237, 240"
    }
  ];

  // 状态颜色和文本映射
  const getStatusColor = (status) => {
    switch(status) {
      case "Connected":
      case "Running":
        return "#32CD32";
      case "Checking...":
        return "#FFA500";
      case "Disconnected":
      case "Error":
        return "#FF6B6B";
      default:
        return "#999";
    }
  };

  const systemStatus = networkStatus === "Connected" && contractStatus === "Running" ? "LIVE" : "OFFLINE";

  return (
    <>
      <style jsx global>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animated-bg {
          background: linear-gradient(135deg, #FFF0F5 0%, #FFE4E9 100%);
          background-size: 400% 400%;
        }

        .module-card {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .module-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.5s;
        }

        .module-card:hover::before {
          left: 100%;
        }

        .glow-effect {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          borderRadius: 22px;
          opacity: 0;
          transition: opacity 0.4s;
          z-index: -1;
        }

        .module-card:hover .glow-effect {
          opacity: 1;
          animation: pulse-glow 2s infinite;
        }

        .status-indicator {
          animation: pulse-glow 3s infinite;
        }
      `}</style>

      <div className="animated-bg" style={{
        minHeight: "100vh",
        color: "#8B4513"
      }}>
        {/* Hero Section */}
        <div style={{
          background: "linear-gradient(135deg, #FFB6C1 0%, #FFD1DC 50%, #FFE4E9 100%)",
          padding: "60px 20px 50px 20px",
          textAlign: "center",
          borderBottom: "2px solid #FFB6C1",
          boxShadow: "0 4px 20px rgba(255, 105, 180, 0.25)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Decorative circles */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            animation: "float 6s ease-in-out infinite"
          }} />
          <div style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.08)",
            animation: "float 8s ease-in-out infinite"
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ 
              fontSize: "5.5rem",
              fontWeight: "900",
              color: "white",
              margin: "0 0 20px 0",
              textShadow: "2px 2px 4px rgba(139, 69, 19, 0.35)",
              letterSpacing: "3px",
              lineHeight: "1.2"
            }}>
              HER UTOPIA
            </h1>

            <p style={{ 
              fontSize: "1.3rem", 
              color: "rgba(255, 255, 255, 0.95)",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: "1.6",
              fontWeight: "400",
              textShadow: "2px 2px 4px rgba(139, 69, 19, 0.2)"
            }}>
              A self-sovereign feminist economy —<br />
              Rewriting power, labor, intimacy, and memory on-chain.
            </p>
          </div>
        </div>

        <Header />
        
        <main style={{ 
          maxWidth: 1250, 
          margin: "0 auto", 
          padding: "40px 15px" 
        }}>
          {/* Two Column Layout: Book on Left, Modules on Right */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "700px 450px",
            gap: "30px",
            alignItems: "start"
          }}>
            {/* Left: Flip Book */}
            <div style={{
              position: "sticky",
              top: "20px"
            }}>
              <FlipBook />
            </div>

            {/* Right: Vertical Module List */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px"
            }}>
              {modules.map((module, index) => (
                <Link key={module.id} href={module.path} style={{ textDecoration: "none" }}>
                  <div 
                    className="module-card"
                    style={{
                      background: "white",
                      border: "2px solid transparent",
                      borderRadius: "16px",
                      padding: "23px 25px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      position: "relative",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(10px)";
                      e.currentTarget.style.boxShadow = `0 15px 35px rgba(${module.glowColor}, 0.35)`;
                      e.currentTarget.style.borderColor = `rgba(${module.glowColor}, 0.5)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08)";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    {/* Glow Effect */}
                    <div 
                      className="glow-effect"
                      style={{
                        background: module.gradient,
                        filter: "blur(20px)"
                      }}
                    />

                    {/* Icon Circle */}
                    <div style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: module.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                      flexShrink: 0,
                      boxShadow: `0 6px 15px rgba(${module.glowColor}, 0.3)`
                    }}>
                      {module.name.split(' ')[0]}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: "1.1rem",
                        color: "#8B4513",
                        margin: "0",
                        fontWeight: "700"
                      }}>
                        {module.name.split(' ').slice(1).join(' ')}
                      </h3>
                    </div>
                    
                    {/* Arrow Button */}
                    <div style={{
                      width: "35px",
                      height: "35px",
                      borderRadius: "50%",
                      background: module.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "1rem",
                      fontWeight: "700",
                      flexShrink: 0,
                      boxShadow: `0 4px 12px rgba(${module.glowColor}, 0.4)`,
                      transition: "transform 0.3s ease"
                    }}>
                      →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* System Status Card - 动态版本 */}
          <div style={{
            marginTop: "50px",
            textAlign: "center",
            padding: "30px",
            background: "white",
            borderRadius: "16px",
            border: "2px solid #FFB6C1",
            boxShadow: "0 10px 30px rgba(255, 105, 180, 0.12)",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Animated background pattern */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(45deg, transparent 30%, rgba(255, 182, 193, 0.05) 30%, rgba(255, 182, 193, 0.05) 70%, transparent 70%)",
              backgroundSize: "20px 20px",
              opacity: 0.5,
              zIndex: 0
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "15px"
              }}>
                <div className="status-indicator" style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: getStatusColor(systemStatus === "LIVE" ? "Connected" : "Error"),
                  boxShadow: `0 0 15px ${getStatusColor(systemStatus === "LIVE" ? "Connected" : "Error")}`
                }} />
                <h3 style={{ 
                  color: "#FF69B4", 
                  margin: 0,
                  fontSize: "1.4rem",
                  fontWeight: "700"
                }}>
                  🚀 System Status: {systemStatus}
                </h3>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                flexWrap: "wrap",
                marginTop: "20px"
              }}>
                {[
                  { icon: "⛓️", text: "Blockchain Network", status: networkStatus },
                  { icon: "📜", text: "Smart Contracts", status: contractStatus },
                  { icon: "🤝", text: "Community Members", status: `${memberCount} Members` }
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255, 182, 193, 0.1)",
                    padding: "10px 16px",
                    borderRadius: "25px",
                    border: "1px solid rgba(255, 182, 193, 0.3)"
                  }}>
                    <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ 
                        fontSize: "0.8rem", 
                        color: "#A0522D",
                        fontWeight: "600"
                      }}>
                        {item.text}
                      </div>
                      <div style={{ 
                        fontSize: "0.7rem", 
                        color: getStatusColor(item.status),
                        fontWeight: "700"
                      }}>
                        {item.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 刷新按钮 */}
              <button
                onClick={checkSystemStatus}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, #FF69B4, #FFB6C1)",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  boxShadow: "0 4px 15px rgba(255, 105, 180, 0.3)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow = "0 6px 20px rgba(255, 105, 180, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "0 4px 15px rgba(255, 105, 180, 0.3)";
                }}
              >
                🔄 Refresh Status
              </button>
            </div>
          </div>

          {/* Footer Quote */}
          <div style={{
            marginTop: "50px",
            textAlign: "center",
            padding: "25px",
            borderTop: "2px solid rgba(255, 182, 193, 0.3)",
            borderBottom: "2px solid rgba(255, 182, 193, 0.3)"
          }}>
            <p style={{
              fontSize: "1.1rem",
              fontStyle: "italic",
              color: "#C71585",
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: "1.7"
            }}>
              把爱与自由写进制度，把关系与照护写入价值，<br />
              把叙事与主体写到链上，把不平等写成可以被修复的代码。
            </p>
          </div>
        </main>
      </div>
    </>
  );
}