'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';

// --- CONTRACT CONSTANTS (Updated) ---
const MURALX_CONTRACT_ADDRESS = '0xB6fcBDc5b13C42bEeaCA680D1dff5276B5076788'; 
// NOTE: Use the complete ABI provided by the user for reliability.
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

// Placeholder address for unassigned artist in client commissions
const PLACEHOLDER_ARTIST_ADDRESS = '0x0000000000000000000000000000000000000000'; // Using address(0) now that contract allows it

// --- Component Props ---
interface NewCommissionFormProps {
    onClose: () => void;
    onCommissionCreated: () => void; // Function to refresh dashboard data
}

export default function NewCommissionForm({ onClose, onCommissionCreated }: NewCommissionFormProps) {
    const [mode, setMode] = useState<'commission' | 'proposal'>('commission');
    
    const [formData, setFormData] = useState({
        description: "",
        price: "",
        deadlineDate: "", 
        // For Proposal Mode:
        targetClientAddress: "", 
    });
    const [loading, setLoading] = useState(false);

    // --- Ethers.js WRITE Logic ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (typeof window.ethereum === 'undefined') {
            alert("Please install MetaMask.");
            return;
        }
        
        setLoading(true);

        try {
            await (window.ethereum as any).request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], 
            });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            const titleForContract = formData.description.substring(0, 30); 
            const budgetInWei = ethers.parseEther(formData.price); 

            const contract = new ethers.Contract(MURALX_CONTRACT_ADDRESS, MURALX_ABI, signer);
            let tx;

            if (mode === 'commission') {
                // *** CLIENT COMMISSION LOGIC ***
                const deadlineTimestamp = Math.floor(new Date(formData.deadlineDate).getTime() / 1000);
                
                if (!formData.deadlineDate || deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
                    alert("Please select a future deadline date.");
                    setLoading(false);
                    return;
                }
                
                // Calls createClientCommission(address _artist, string _title, string _description, uint256 _finishDate) payable
                tx = await contract.createClientCommission(
                    PLACEHOLDER_ARTIST_ADDRESS, // artist (unassigned)
                    titleForContract, 
                    formData.description,
                    deadlineTimestamp, 
                    { value: budgetInWei } // Sent as payment (locked in contract)
                );

            } else {
                // *** ARTIST PROPOSAL LOGIC ***
                const targetClient = formData.targetClientAddress || PLACEHOLDER_ARTIST_ADDRESS; // Use address(0) if no specific client
                
                if (targetClient !== PLACEHOLDER_ARTIST_ADDRESS && !ethers.isAddress(targetClient)) {
                    alert("Please enter a valid target client address or leave blank for a general offer.");
                    setLoading(false);
                    return;
                }

                // Calls createArtistProposal(address _client, string _title, string _description, uint256 _value) payable
                tx = await contract.createArtistProposal(
                    targetClient, 
                    titleForContract, 
                    formData.description,
                    budgetInWei, // Value is specified but not sent (msg.value=0 required)
                    { value: 0 } 
                );
            }
            
            alert(`Transaction sent! Waiting for confirmation (Hash: ${tx.hash.substring(0, 10)}...).`);
            await tx.wait(); 
            alert(`${mode === 'commission' ? 'Commission' : 'Proposal'} created successfully!`);
            
            // Reset state and close modal
            setFormData({ description: "", price: "", deadlineDate: "", targetClientAddress: "" }); 
            onCommissionCreated(); 
            onClose(); 
            
        } catch (err: any) {
            console.error("Error creating item:", err);
            alert(`Transaction failed: ${err.reason || err.message || 'Check console.'}`);
        } finally {
            setLoading(false);
        }
    };

    const isCommissionMode = mode === 'commission';
    const submitText = isCommissionMode ? 'Submit Commission (Lock Funds)' : 'Submit Proposal (No Funds)';

    return (
        <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !loading) {
                    onClose();
                }
            }}
          >
            <div
              style={{
                background: "#111",
                padding: "2rem",
                borderRadius: "12px",
                width: "600px",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                border: "1px solid #333",
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                 <h2 style={{ margin: 0 }}>New {isCommissionMode ? 'Client Commission' : 'Artist Proposal'}</h2>
                 <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: '0', lineHeight: '1', }}
                    disabled={loading}
                 >
                    &times;
                 </button>
              </div>
              
              {/* MODE TOGGLE */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <button
                        onClick={() => setMode('commission')}
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            backgroundColor: isCommissionMode ? '#4ade80' : '#222',
                            color: isCommissionMode ? '#000' : '#fff',
                            borderRadius: '5px 0 0 5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                        disabled={loading}
                    >
                        Client Commission
                    </button>
                    <button
                        onClick={() => setMode('proposal')}
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            backgroundColor: !isCommissionMode ? '#4ade80' : '#222',
                            color: !isCommissionMode ? '#000' : '#fff',
                            borderRadius: '0 5px 5px 0',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                        disabled={loading}
                    >
                        Artist Proposal
                    </button>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
              >
                {/* Proposal Mode Specific Input */}
                {!isCommissionMode && (
                    <input
                        type="text"
                        placeholder="Target Client Address (Leave blank for general offer)"
                        value={formData.targetClientAddress}
                        onChange={(e) =>
                            setFormData({ ...formData, targetClientAddress: e.target.value })
                        }
                        style={{
                            padding: "0.75rem",
                            borderRadius: "6px",
                            background: "#222",
                            color: "white",
                            border: "1px solid #444",
                        }}
                        disabled={loading}
                    />
                )}
                
                <textarea
                  placeholder={isCommissionMode ? "Describe your project and requirements." : "Describe your service, style, and what you offer."}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  style={{
                    padding: "0.75rem",
                    borderRadius: "6px",
                    background: "#222",
                    color: "white",
                    border: "1px solid #444",
                    minHeight: "100px" 
                  }}
                  disabled={loading}
                  required
                />
                
                {/* Commission Mode Specific Input */}
                {isCommissionMode && (
                    <input
                        type="date"
                        placeholder="Deadline Date"
                        value={formData.deadlineDate}
                        onChange={(e) =>
                            setFormData({ ...formData, deadlineDate: e.target.value })
                        }
                        style={{
                            padding: "0.75rem",
                            borderRadius: "6px",
                            background: "#222",
                            color: "white",
                            border: "1px solid #444",
                        }}
                        disabled={loading}
                        required
                    />
                )}

                <input
                  type="number"
                  placeholder="Price (ETH)"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  style={{
                    padding: "0.75rem",
                    borderRadius: "6px",
                    background: "#222",
                    color: "white",
                    border: "1px solid #444",
                  }}
                  disabled={loading}
                  required
                />
                <button
                  type="submit"
                  style={{
                    padding: "0.75rem",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#000",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  disabled={loading}
                >
                  {loading ? "Sending Transaction..." : submitText}
                </button>
              </form>
            </div>
          </div>
    );
}