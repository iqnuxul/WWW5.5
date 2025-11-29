'use client';

import { useState, useEffect } from "react"; 
import Navbar from "@/components/Navbar";
import CommissionCard from "@/components/CommissionCard";
import { ethers } from "ethers"; 

// --- 1. CONTRACT CONSTANTS (Kept for reference) ---
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


// --- 2. DATA STRUCTURE & HELPERS (UNCHANGED) ---
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// --- 3. PLACEHOLDER DATA GENERATOR (UPDATED with NEW COLORS) ---

// **COLOR CONSTANTS**
const COLOR_COMMISSION = '#FFD700'; // Light Gold/Yellow (UNCHANGED)
const COLOR_PROPOSAL = '#C3A5E5';  // Soft Lavender/Less Saturated Violet (NEW COLOR)

// Pool of shorter generic titles
const COMMISSION_TITLES = [
    'Family Portrait (Oil)',
    'Living Room Landscape',
    'Custom Digital Cat Art',
    'Sci-Fi Game Concept Art',
    'Watercolor Sunset Scene',
    'Kids Book Illustration',
    'Anime Character Design',
    'Corporate Logo Redesign',
    'Vector Icon Set',
    'Custom Tattoo Design',
    'Abstract Art Piece',
    'Startup Mascot Design',
    'Pet Portrait (Dog)',
    'Sketch of Historic Building',
    'Minimalist Album Cover',
];

// Helper to get a random title from the pool
const getRandomTitle = (titleArray: string[]): string => {
    const randomIndex = Math.floor(Math.random() * titleArray.length);
    return titleArray[randomIndex];
};


// Function to generate 50 dummy commissions that match the expected structure
const generateDummyCommissions = () => {
    const dummyItems = [];
    const baseTimestamp = Math.floor(Date.now() / 1000); 

    for (let i = 1; i <= 50; i++) {
        // Use a true randomized flag to decide content/color
        const isRandomProposal = Math.random() < 0.35; 
        const statusIndex = i % 5; 
        
        let titleText: string;
        let titleColor: string;
        
        // **UPDATED LOGIC: Less Saturated Violet Applied**
        if (isRandomProposal) {
            // Rule 2: Proposal - Use Less Saturated Violet
            titleText = getRandomTitle(COMMISSION_TITLES);
            titleColor = COLOR_PROPOSAL; // #C3A5E5
        } else {
            // Rule 1: Commission - Use Gold/Yellow
            titleText = getRandomTitle(COMMISSION_TITLES);
            titleColor = COLOR_COMMISSION; // #FFD700
        }
        
        dummyItems.push({
            id: i, 
            patron: `0x...${Math.random().toString(16).substring(2, 6)}`, 
            artist: isRandomProposal ? `0x...${Math.random().toString(16).substring(2, 6)}` : '0x0000000000000000000000000000000000000000',
            
            budget: (Math.floor(Math.random() * 5 + 1) * 0.5).toFixed(2), 
            
            // Applied Title Change
            title: titleText,
            description: `This is a sample description for item ${i}. It will be visible on the detail page.`,
            statusText: getStatusText(statusIndex),
            clientAgreed: !isRandomProposal,
            artistAgreed: isRandomProposal,
            
            finishDate: formatDeadline(baseTimestamp + (30 + i) * 86400), 
            
            // CRITICAL FIX: Force isProposal to FALSE to prevent unwanted card styling differences.
            isProposal: false, 
            
            // Applied Title Color Change
            titleColor: titleColor,
        });
    }
    return dummyItems;
};


// --- 4. MAIN HOMEPAGE COMPONENT (UNCHANGED) ---
export default function HomePage() {
    const [loading, setLoading] = useState(false);
    const [openItems, setOpenItems] = useState<any[]>([]);

    const loadPlaceholderItems = () => {
        setLoading(true);
        
        setTimeout(() => {
            const placeholderData = generateDummyCommissions();
            setOpenItems(placeholderData);
            setLoading(false);
        }, 500); 
    };

    useEffect(() => {
        loadPlaceholderItems();
    }, []);


    // --- RENDERING LOGIC (UNCHANGED) ---

    const renderContent = () => {
        if (loading) {
            return <div style={{ color: '#aaa' }}>Loading the decentralized gallery feed...</div>;
        }

        if (openItems.length === 0) {
            return (
                <div style={{ color: '#aaa', gridColumn: '1 / -1', padding: '2rem', textAlign: 'center' }}>
                    The marketplace is quiet right now. Check back later!
                </div>
            );
        }

        return (
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '2rem' 
            }}>
                {openItems.map((item) => (
                    <CommissionCard 
                        key={item.id} 
                        item={item} 
                    />
                ))}
            </div>
        );
    };


    return (
        <div style={{ minHeight: "100vh", background: "black", color: "white" }}>
            <Navbar />
            
            <div style={{ padding: "2rem" }}>
                {renderContent()}
            </div>
        </div>
    );
}