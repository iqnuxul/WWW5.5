'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from "ethers";

// --- DATA STRUCTURE & HELPERS (Copied from page.tsx for local use) ---
interface Commission {
    id: number;
    title: string;
    description: string;
    value: string; // Use string for formatted ETH
    statusText: string;
    isProposal: boolean;
    finishDate: string;
    budget: string; // Use the property name from your fetch
    // Add the custom color property from homepage.tsx
    titleColor: string; 
}

// Function to generate a consistent random number based on a seed
const randomSeeder = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

// --- COMMISSION CARD COMPONENT ---

const CommissionCard: React.FC<{ item: Commission }> = ({ item }) => {
    const router = useRouter();

    const handleNavigate = () => {
        router.push(`/commission/${item.id}`);
    };

    const newMinHeight = '150px'; 

    return (
        <a 
            onClick={handleNavigate}
            style={{ textDecoration: 'none' }}
        >
            <div 
                style={{ 
                    // Card structure styling
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '2rem',
                    minHeight: newMinHeight, 
                    fontSize: '1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    paddingBottom: '3rem', 
                    
                    // Background styling
                    background: `
                        radial-gradient(circle at 10% 10%, rgba(255, 215, 0, 0.05) 0%, transparent 40%),
                        radial-gradient(circle at 90% 80%, rgba(167, 165, 255, 0.05) 0%, transparent 40%),
                        ${item.isProposal ? '#0f0f1c' : '#000'}
                    `,
                    
                    color: 'white',
                    cursor: 'pointer',
                    borderColor: item.isProposal ? '#5a528e' : '#333', 
                }}
            >
                
                {/* // --- TITLE (CRITICAL FIX APPLIED HERE) ---
                */}
                <h3 style={{ 
                    // 1. **REDUCED FONT SIZE**
                    fontSize: '1.2rem', 
                    
                    marginBottom: '1rem', 
                    color: item.titleColor || '#FFD700', // Use custom color from data

                    // 2. **PREVENT WRAPPING**
                    whiteSpace: 'nowrap',
                    
                    // 3. **HIDE OVERFLOW**
                    overflow: 'hidden',
                    
                    // 4. **ADD ELLIPSIS (...)**
                    textOverflow: 'ellipsis', 
                }}>
                    {item.title}
                </h3>
                
                {/* --- PROCEDURAL ART CANVAS (UNCHANGED) --- */}
                <div 
                    style={{ 
                        position: 'relative', 
                        width: '100%', 
                        height: '200px', 
                        backgroundColor: '#222', 
                        borderRadius: '8px', 
                        marginBottom: '1rem',
                        border: '1px solid #444',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }} 
                >
                    {[...Array(10)].map((_, i) => {
                        const seed = (item.id * 1000) + i; 
                        
                        const size = Math.floor(randomSeeder(seed + 1) * 70) + 30; 
                        const top = randomSeeder(seed + 2) * 100;
                        const left = randomSeeder(seed + 3) * 100;
                        const hue = randomSeeder(seed + 4) * 360;
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
                        );
                    })}
                    <span style={{ fontSize: '1.5rem', opacity: 0.3, position: 'absolute' }}>[ART PREVIEW]</span>
                </div>
                {/* ----------------------------- */}
                
                {/* FOOTER (Value and Deadline) (Unchanged) */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    borderTop: '1px solid #333', 
                    paddingTop: '1rem',
                    marginTop: 'auto' 
                }}>
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1rem', color: '#fff' }}>
                            {item.budget} ETH
                        </p>
                        <p style={{ margin: '0', fontSize: '0.75rem', color: '#888' }}>
                            Value
                        </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1rem', color: item.finishDate === 'N/A' ? '#888' : '#fff' }}>
                            {item.finishDate}
                        </p>
                        <p style={{ margin: '0', fontSize: '0.75rem', color: '#888' }}>
                            {item.isProposal ? 'Est. Date' : 'Deadline'}
                        </p>
                    </div>
                </div>
            </div>
        </a>
    );
};

export default CommissionCard;