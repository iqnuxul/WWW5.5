'use client';

import { useState, useEffect } from "react"; 
import Navbar from "@/components/Navbar";
import { ethers } from "ethers"; 
import { useRouter, useParams } from 'next/navigation'; 

// --- 1. CONTRACT CONSTANTS (LATEST CONTRACT) ---
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


// Helper functions
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
    if (timestamp === 0) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
};

const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Define the structure of the commission data
interface Commission {
    id: number;
    client: string;
    artist: string;
    value: string;
    title: string;
    description: string;
    statusIndex: number;
    statusText: string;
    clientAgreed: boolean;
    artistAgreed: boolean;
    finishDate: string;
    isProposal: boolean;
}

export default function CommissionDetailPage() {
    const router = useRouter();
    const params = useParams();
    const commissionId = params.id; 
    
    const [commission, setCommission] = useState<Commission | null>(null);
    const [loading, setLoading] = useState(true);
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [transactionStatus, setTransactionStatus] = useState<string | null>(null); // New state for transaction feedback

    // --- Ethers.js READ Logic ---
    const fetchCommissionDetails = async (id: number) => {
        if (typeof window.ethereum === 'undefined') {
            console.error("Wallet not detected.");
            setLoading(false);
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setUserAddress(address.toLowerCase());
            
            const contract = new ethers.Contract(MURALX_CONTRACT_ADDRESS, MURALX_ABI, provider);

            const commissionData = await contract.getCommission(id); 

            setCommission({
                id: id,
                client: commissionData[1].toLowerCase(),
                artist: commissionData[2].toLowerCase(),
                value: ethers.formatEther(commissionData[3]),
                title: commissionData[4],
                description: commissionData[5],
                statusIndex: Number(commissionData[6]),
                statusText: getStatusText(Number(commissionData[6])),
                clientAgreed: commissionData[7],
                artistAgreed: commissionData[8],
                finishDate: formatDeadline(Number(commissionData[9])),
                isProposal: commissionData[10],
            });

        } catch (err) {
            console.error("Error fetching commission details:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- Ethers.js WRITE Logic: CANCEL COMMISSION ---
    const handleCancelCommission = async () => {
        if (!commission || typeof window.ethereum === 'undefined') return;

        setTransactionStatus("Cancelling commission...");
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(MURALX_CONTRACT_ADDRESS, MURALX_ABI, signer);

            const tx = await contract.cancelCommission(commission.id);
            setTransactionStatus("Transaction submitted. Waiting for confirmation...");
            
            await tx.wait();
            setTransactionStatus("Commission cancelled successfully! Funds refunded.");
            
            // Re-fetch data to update the status to 'Closed'
            fetchCommissionDetails(commission.id); 

        } catch (error: any) {
            console.error("Cancellation Error:", error);
            // Attempt to extract a user-friendly error message
            const reason = error.reason || error.message.includes('revert') ? "Transaction reverted. Ensure it's 'Open' and you are the client." : "Failed to cancel transaction.";
            setTransactionStatus(`Error: ${reason}`);
        }
    };


    useEffect(() => {
        const idParam = Array.isArray(commissionId) ? commissionId[0] : commissionId;
        
        if (idParam) {
            const id = Number(idParam);
            if (!isNaN(id)) {
                fetchCommissionDetails(id);
            } else {
                setLoading(false);
            }
        }
    }, [commissionId]);

    if (loading) {
        return (
             <div style={{ minHeight: "100vh", background: "black", color: "white", padding: "2rem" }}>
                <Navbar />
                <h1 style={{ color: '#aaa' }}>Loading Commission #{commissionId}...</h1>
            </div>
        );
    }

    if (!commission) {
        return (
             <div style={{ minHeight: "100vh", background: "black", color: "white", padding: "2rem" }}>
                <Navbar />
                <h1 style={{ color: 'red' }}>Commission Not Found</h1>
            </div>
        );
    }
    
    // Determine the user's role
    const isClient = userAddress && commission.client === userAddress;
    const isArtist = userAddress && commission.artist === userAddress;
    const isAssigned = commission.artist !== ethers.ZeroAddress.toLowerCase();

    // --- Action Button Logic Placeholder (UPDATED) ---
    const renderActionButtons = () => {
        const buttons = [];

        if (commission.statusText === 'Closed' || commission.statusText === 'Disputed') {
            return <p style={{ color: commission.statusText === 'Closed' ? '#32cd32' : 'orange', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {commission.statusText === 'Closed' ? 'Transaction Complete ✅' : commission.statusText.toUpperCase()}
            </p>;
        }

        if (commission.statusText === 'Open') {
            // --- 1. Negotiation/Acceptance Buttons ---
            if (commission.isProposal) {
                if (isClient && !commission.clientAgreed) {
                    buttons.push(<button key="accept" style={{ backgroundColor: '#32cd32' }}>Accept Proposal (Pay Value)</button>);
                    buttons.push(<button key="counter" style={{ backgroundColor: '#ffc300' }}>Counter-Propose Value</button>);
                }
            } else {
                if (!isAssigned) {
                     buttons.push(<button key="propose" style={{ backgroundColor: '#007FFF' }}>Propose to Take Commission</button>);
                }
                
                if (isArtist && !commission.artistAgreed) {
                    buttons.push(<button key="accept" style={{ backgroundColor: '#32cd32' }}>Accept Commission</button>);
                    buttons.push(<button key="counter" style={{ backgroundColor: '#ffc300' }}>Counter-Propose Value</button>);
                }
            }
            
            // Finalize Negotiation button
            if (commission.clientAgreed && commission.artistAgreed && isClient) {
                buttons.push(<button key="finalize" style={{ backgroundColor: '#FF7F50' }}>Finalize Negotiation (Deposit Funds)</button>);
            }
            
            // --- 2. CANCEL BUTTON ---
            // The client can cancel any OPEN commission (Client or Proposal)
            if (isClient) {
                buttons.push(
                    <button 
                        key="cancel" 
                        onClick={handleCancelCommission} 
                        style={{ 
                            backgroundColor: '#dc3545', // Red color for cancellation
                            marginTop: '1rem',
                            fontWeight: 'bold', 
                        }}>
                        ❌ Cancel Commission & Get Refund
                    </button>
                );
            }

        } else if (commission.statusText === 'In Progress' && isArtist) {
             buttons.push(<button key="deliver" style={{ backgroundColor: '#007FFF' }}>Deliver Work</button>);
        }
        
        else if (commission.statusText === 'Review Pending' && isClient) {
            buttons.push(<button key="approve" style={{ backgroundColor: '#32cd32' }}>Approve & Release Funds</button>);
        }

        if (buttons.length === 0) {
            return <p style={{ color: '#aaa' }}>Awaiting action from the other party...</p>;
        }
        
        return buttons;
    };

    // --- Component JSX (Original Layout and Styling with requested updates) ---
    return (
        <div style={{ minHeight: "100vh", background: "black", color: "white", fontFamily: 'sans-serif' }}>
            <Navbar />
            
            <main style={{
                padding: '2rem 4rem',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '3rem',
                    alignItems: 'flex-start',
                }}>
                    
                    {/* LEFT COLUMN: Procedurally Generated Art Preview (Original Styling) */}
                    <div style={{
                        flex: 1,
                        backgroundColor: '#222',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        aspectRatio: '4/3',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Visual placeholder: EXACT ORIGINAL CIRCLE PATTERN CODE */}
                        {[...Array(10)].map((_, i) => {
                            const seed = (commission.id * 1000) + i; 
                            const random = (seed) => {
                                const x = Math.sin(seed) * 10000;
                                return x - Math.floor(x);
                            };
                            
                            const size = Math.floor(random(seed + 1) * 50) + 20;
                            const top = random(seed + 2) * 100;
                            const left = random(seed + 3) * 100;
                            const hue = random(seed + 4) * 360;
                            const color = `hsl(${hue}, 70%, 60%)`;
                            
                            return (
                                <div key={i} style={{
                                    position: 'absolute',
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    borderRadius: '50%',
                                    backgroundColor: color,
                                    opacity: 0.6, 
                                    top: `${top}%`,
                                    left: `${left}%`,
                                    transform: 'translate(-50%, -50%)',
                                }} />
                            )
                        })}
                        <span style={{ fontSize: '1.5rem', opacity: 0.3, position: 'absolute' }}>[ART PREVIEW]</span>
                    </div>
                    
                    {/* RIGHT COLUMN: Detail Display */}
                    <div style={{ 
                        flex: 1, 
                        marginTop: '-15px', 
                    }}>
                        
                        {/* Title and ID Header */}
                        <div style={{ 
                            borderBottom: '1px solid #333',
                            paddingBottom: '0.5rem', 
                            marginBottom: '0.75rem' 
                        }}>
                            <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.25rem 0' }}>
                                {commission.title}
                            </h1>
                            <p style={{ margin: '0', color: '#aaa', fontSize: '1rem' }}> 
                                Commission #{commission.id}
                            </p>
                            <span style={{ 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '5px',
                                fontSize: '0.8rem', 
                                fontWeight: 'bold',
                                marginTop: '0.5rem',
                                display: 'inline-block',
                                backgroundColor: commission.isProposal ? '#007FFF' : '#FFD700', 
                                color: commission.isProposal ? 'white' : 'black'
                            }}>
                                {commission.isProposal ? 'ARTIST PROPOSAL' : 'CLIENT COMMISSION'}
                            </span>
                        </div>

                        {/* Description */}
                        <p style={{ 
                            fontSize: '1rem', 
                            marginBottom: '1rem', 
                            color: '#ccc' 
                        }}>
                            {commission.description}
                        </p>
                        
                        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #333', marginBottom: '1rem' }}>
                            {/* NEW: Value and Deadline in the SAME ROW */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                {/* Value (Budget) */}
                                <div style={{ flex: 1, marginBottom: '0.25rem' }}> 
                                    <h3 style={{ fontSize: '1rem', color: '#aaa', margin: '0 0 0.05rem 0', textTransform: 'uppercase' }}>Value</h3> 
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}> 
                                        {commission.value} ETH
                                    </p>
                                </div>

                                {/* Deadline */}
                                <div style={{ flex: 1, marginBottom: '0.25rem' }}> 
                                    <h3 style={{ fontSize: '1rem', color: '#aaa', margin: '0 0 0.05rem 0', textTransform: 'uppercase' }}>{commission.isProposal ? 'EST. DATE' : 'DEADLINE'}</h3> 
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}> 
                                        {commission.finishDate}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Negotiation Status (UPDATED Styling and Content) */}
                        {commission.statusText === 'Open' && (
                            <div style={{ 
                                paddingBottom: '1rem', 
                                borderBottom: '1px solid #333', 
                                marginBottom: '1rem'
                            }}>
                                <h3 style={{ 
                                    margin: '0 0 0.75rem 0', 
                                    fontSize: '1.1rem', 
                                    color: 'white', 
                                    textTransform: 'uppercase' 
                                }}>
                                    NEGOTIATION STATUS
                                </h3>
                                {/* NEW: Combined agreement status */}
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem', color: '#ccc' }}>
                                    Client: {commission.clientAgreed ? '✅' : '❌'} &nbsp;&nbsp; Artist: {commission.artistAgreed ? '✅' : '❌'}
                                </p>
                            </div>
                        )}

                        {/* Addresses */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ marginBottom: '0.25rem' }}>
                                <h3 style={{ fontSize: '1rem', color: '#aaa', margin: '0 0 0.05rem 0', textTransform: 'uppercase' }}>Client Address</h3> 
                                <a 
                                    href={`https://sepolia.etherscan.io/address/${commission.client}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#00aaff', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem' }} 
                                >
                                    {shortenAddress(commission.client)} {isClient ? '(You) ↗' : '↗'}
                                </a>
                            </div>

                            <div style={{ marginBottom: '0.25rem' }}>
                                <h3 style={{ fontSize: '1rem', color: '#aaa', margin: '0 0 0.05rem 0', textTransform: 'uppercase' }}>Artist Address</h3> 
                                <a 
                                    href={`https://sepolia.etherscan.io/address/${commission.artist}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: isAssigned ? '#00aaff' : '#fff', textDecoration: isAssigned ? 'none' : 'none', fontWeight: 'bold', fontSize: '1rem' }} 
                                >
                                    {isAssigned ? `${shortenAddress(commission.artist)}` : '**PENDING**'} {isArtist ? '(You) ↗' : isAssigned ? '↗' : ''}
                                </a>
                            </div>
                        </div>


                        {/* Action Buttons and Transaction Status */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {renderActionButtons()}
                            {transactionStatus && (
                                <p style={{ margin: 0, color: transactionStatus.includes('Error') ? 'red' : 'yellow', fontWeight: 'bold' }}>
                                    {transactionStatus}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Reusable Info Row Component is no longer used for Negotiation Status, but kept for future use if needed.
const InfoRow = ({ label, value, color, isYou }: { label: string, value: string, color?: string, isYou?: boolean }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dotted #333' }}>
        <span style={{ color: '#bbb', fontSize: '1rem' }}>{label}:</span>
        <span style={{ color: color || 'white', fontWeight: 'bold', fontSize: '1rem' }}>
            {value} {isYou ? '(You)' : ''}
        </span>
    </div>
);