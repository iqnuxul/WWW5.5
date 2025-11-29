'use client';

import { useState, useEffect, useMemo } from "react"; 
import Navbar from "@/components/Navbar";
import CommissionCard from "@/components/CommissionCard"; // <-- Using the consistent Marketplace card
import { ethers } from "ethers"; 
import NewCommissionForm from "@/components/NewCommissionForm"; 

// --- 1. CONTRACT CONSTANTS (Unchanged) ---
const MURALX_CONTRACT_ADDRESS = '0xB6fcBDc5b13C42bEeaCA680D1dff5276B5076788'; 
const MURALX_ABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_commissionId",
                "type": "uint256"
            }
        ],
        "name": "acceptCommission",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_commissionId",
                "type": "uint256"
            }
        ],
        "name": "approveCommission",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_commissionId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_artist",
                "type": "address"
            }
        ],
        "name": "assignArtist",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_commissionId",
                "type": "uint256"
            }
        ],
        "name": "cancelCommission",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_commissionId",
                "type": "uint256"
            }
        ],
        "name": "clientFinalizeNegotiation",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_commissionId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_newValue",
                "type": "uint256"
            }
        ],
        "name": "counterPropose",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_client",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "createArtistProposal",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_artist",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_finishDate",
                "type": "uint256"
            }
        ],
        "name": "createClientCommission",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_commissionId",
                "type": "uint256"
            }
        ],
        "name": "deliverWork",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "artistCommissions",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "clientCommissions",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "commissionIdCounter",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "commissions",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "client",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "artist",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "enum MuralX.CommissionStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "bool",
                "name": "clientAgreed",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "artistAgreed",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "finishDate",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isProposal",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getArtistCommissionIds",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getClientCommissionIds",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_commissionId",
                "type": "uint256"
            }
        ],
        "name": "getCommission",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "client",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "artist",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "enum MuralX.CommissionStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "bool",
                "name": "clientAgreed",
                "type": "bool"
            },
            {
                "internalType": "bool",
                "name": "artistAgreed",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "finishDate",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isProposal",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Helper functions (Unchanged)
const getStatusText = (statusIndex: number): string => {
    switch (statusIndex) {
      case 0: return 'Open';
      case 1: return 'In Progress';
      case 2: return 'Review Pending';
      case 3: return 'Disputed';
      case 4: return 'Closed';
      default: return 'Unknown';
    }
};

const formatDeadline = (timestamp: number): string => {
    if (timestamp === 0) return 'N/A'; // For proposals that don't set a deadline initially
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
};


// --- MAIN DASHBOARD COMPONENT (UPDATED) ---
export default function DashboardPage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Renamed state to allCommissions for clarity in filtering logic
  const [allCommissions, setAllCommissions] = useState<any[]>([]);

  // NEW STATE: Filter to control which status is visible. Default is 'Open'.
  const [selectedStatus, setSelectedStatus] = useState<string>('Open');

  // List of all possible statuses for the filter buttons
  const STATUS_FILTERS = ['Open', 'In Progress', 'Review Pending', 'Disputed', 'Closed'];

  // --- Ethers.js READ Logic (Kept Unchanged) ---
  const fetchCommissions = async () => {
      if (typeof window.ethereum === 'undefined') {
          console.error("MetaMask or other wallet not detected.");
          return;
      }
      setLoading(true);

      try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();
          
          const contract = new ethers.Contract(MURALX_CONTRACT_ADDRESS, MURALX_ABI, provider);

          // Using the original working call format
          const clientIds = await contract.getClientCommissionIds({ from: userAddress });
          const artistIds = await contract.getArtistCommissionIds({ from: userAddress });

          const combinedIdSet = new Set();
          [...clientIds, ...artistIds].forEach((id) => {
              combinedIdSet.add(id.toString());
          });
          const uniqueIds = Array.from(combinedIdSet).map(id => Number(id));
          
          const fetchedCommissions = [];

          for (const id of uniqueIds) {
              const commissionData = await contract.getCommission(id); 

              const commission = {
                  id: id, 
                  patron: commissionData[1], 
                  artist: commissionData[2], 
                  budget: ethers.formatEther(commissionData[3]), 
                  title: commissionData[4],
                  description: commissionData[5],
                  statusIndex: Number(commissionData[6]),
                  statusText: getStatusText(Number(commissionData[6])),
                  clientAgreed: commissionData[7], 
                  artistAgreed: commissionData[8], 
                  finishDate: formatDeadline(Number(commissionData[9])), 
                  isProposal: commissionData[10], 
              };
              
              fetchedCommissions.push(commission);
          }

          // Store all commissions for filtering
          setAllCommissions(fetchedCommissions);
      } catch (err) {
          console.error("Error fetching commissions:", err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        fetchCommissions();
      }
  }, []);

  const handleCommissionCreated = () => {
      fetchCommissions();
  }

  // --- FILTERED COMMISSIONS LOGIC ---
  const filteredCommissions = useMemo(() => {
    if (selectedStatus === 'All') {
        return allCommissions;
    }
    // Filter commissions based on the selected statusText
    return allCommissions.filter(commission => commission.statusText === selectedStatus);
  }, [allCommissions, selectedStatus]);


  // --- Filter Button Component ---
  const FilterButton = ({ status }: { status: string }) => (
    <button
        onClick={() => setSelectedStatus(status)}
        style={{
            padding: '0.5rem 1rem',
            marginRight: '0.75rem',
            fontSize: '0.9rem',
            borderRadius: '20px',
            border: '1px solid',
            cursor: 'pointer',
            fontWeight: 'bold',
            // Active/Inactive styling
            backgroundColor: selectedStatus === status ? '#FFD700' : 'transparent',
            color: selectedStatus === status ? 'black' : 'white',
            borderColor: selectedStatus === status ? '#FFD700' : '#444',
            transition: 'all 0.2s',
        }}
    >
        {status} ({allCommissions.filter(c => c.statusText === status).length})
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "black", color: "white" }}>
      <Navbar />

      <div style={{ padding: "2rem" }}>
        
        {/* --- STATUS FILTER BAR --- */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {STATUS_FILTERS.map(status => (
                    <FilterButton key={status} status={status} />
                ))}
            </div>
        </div>
        {/* ------------------------- */}

        {loading ? (
             <div style={{ color: '#aaa' }}>Loading commissions...</div>
        ) : (
             <div 
                style={{ 
                    display: 'grid', 
                    // FIX: Implemented fixed 3-column layout (1fr 1fr 1fr)
                    gridTemplateColumns: '1fr 1fr 1fr', 
                    gap: '2rem' 
                }}
             >
                {/* RENDER filteredCommissions instead of allCommissions */}
                {filteredCommissions.length === 0 ? (
                    <div style={{ color: '#aaa', gridColumn: '1 / -1' }}>
                        No items found with status: "{selectedStatus}".
                    </div>
                ) : (
                    // RENDER THE FILTERED COMMISSIONS
                    filteredCommissions.map((commission) => (
                        <CommissionCard 
                            key={commission.id}
                            item={commission} // CommissionCard expects the data as 'item' prop
                        />
                    ))
                )}
            </div>
        )}
        
        {/* + New Commission/Proposal Button (Kept EXACTLY as original) */}
        <button
            onClick={() => setShowForm(true)}
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              padding: "1rem 1.5rem",
              fontSize: "1rem",
              backgroundColor: "#fff",
              color: "#000",
              borderRadius: "50px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            disabled={loading}
          >
            {loading ? "Processing..." : "+ New Commission/Proposal"}
        </button>

        {showForm && (
            <NewCommissionForm 
                onClose={() => setShowForm(false)}
                onCommissionCreated={handleCommissionCreated}
            />
        )}
      </div>
    </div>
  );
}