'use client'; 

import React, { useState, useEffect } from 'react';
// NOTE: Replaced 'next/link' with a functional component and standard '<a>' tags
// Replaced 'lucide-react' imports with inline SVG components to resolve build errors.

// =========================================================================
// INLINE SVG ICONS (Dependency-free replacement)
// =========================================================================

const IconWrapper = ({ children, className = "w-4 h-4", ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        {children}
    </svg>
);

const LogOut = (props: { className?: string }) => (
    <IconWrapper {...props}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
    </IconWrapper>
);

const LinkIcon = (props: { className?: string }) => (
    <IconWrapper {...props}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </IconWrapper>
);

const AlertTriangle = (props: { className?: string }) => (
    <IconWrapper {...props}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </IconWrapper>
);

// --- Utility function for addresses ---
const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// --- Custom Link Component (To replace next/link and maintain styling) ---
const CustomLink = ({ href, children, style = {} }: { href: string, children: React.ReactNode, style?: React.CSSProperties }) => (
    <a href={href} style={{ color: "#fff", textDecoration: "none", ...style }}>
        {children}
    </a>
);

// --- Wallet Connection Component Logic ---
const ConnectButton = () => {
    const [currentAccount, setCurrentAccount] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // Core Connection Logic
    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            setError("MetaMask or compatible wallet is not installed.");
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            const accounts = await (window.ethereum as any).request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                setCurrentAccount(accounts[0]);
            }
        } catch (err) {
            console.error("Connection error:", err);
            setError("Could not connect to wallet.");
            setCurrentAccount(null);
        } finally {
            setIsConnecting(false);
        }
    };

    // Disconnect (Clears local state)
    const disconnectWallet = () => {
        setCurrentAccount(null);
        setError(null);
    };
    
    // Check/Handle Persistence on Load and Account Changes
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window.ethereum === 'undefined') return;
            try {
                const accounts = await (window.ethereum as any).request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setCurrentAccount(accounts[0]);
                } else {
                    setCurrentAccount(null);
                }
            } catch (err) {
                console.error("Error checking connection:", err);
            }
        };

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                setCurrentAccount(null);
            } else {
                setCurrentAccount(accounts[0]);
            }
        };

        checkConnection();

        if (typeof window.ethereum !== 'undefined') {
            (window.ethereum as any).on('accountsChanged', handleAccountsChanged);
        }

        return () => {
            if (typeof window.ethereum !== 'undefined') {
                (window.ethereum as any).removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    // UI Rendering
    if (error) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '9999px',
                fontSize: '14px',
                color: '#f87171', // Tailwind red-400 equivalent
                backgroundColor: 'rgba(50, 0, 0, 0.5)' // Dark red/black background
            }}>
                <AlertTriangle style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                <span>Error: {error.split('.')[0]}</span>
            </div>
        );
    }
    
    if (currentAccount) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#333', // Dark gray background
                padding: '4px',
                paddingLeft: '12px',
                borderRadius: '9999px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#4ade80', display: 'flex', alignItems: 'center' }}>
                    <LinkIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    {shortenAddress(currentAccount)}
                </span>
                <button
                    onClick={disconnectWallet}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        borderRadius: '9999px',
                        backgroundColor: '#dc2626', // Tailwind red-600 equivalent
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')} // Hover effect
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')} // Reset
                    title="Clear wallet connection"
                >
                    <LogOut className="w-4 h-4 text-white" />
                </button>
            </div>
        );
    }

    // Connect button styled for the dark theme
    return (
        <button
            onClick={connectWallet}
            disabled={isConnecting}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                backgroundColor: '#fff', // White button
                color: '#111', // Dark text
                fontWeight: '600',
                borderRadius: '9999px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                fontSize: '14px'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e5e5e5')} // Hover effect
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#fff')} // Reset
        >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
    );
};


// --- Main Navbar Component ---
export default function Navbar() {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center", // Ensure vertical alignment
      padding: "1rem 2rem",
      backgroundColor: "#111", // Your original background color
      color: "#fff" // Your original text color
    }}>
      <CustomLink href="/" style={{ fontWeight: "bold" }}>
        muralX
      </CustomLink>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <CustomLink href="/dashboard">
          Dashboard
        </CustomLink>
        {/* Wallet Connection Added Here */}
        <ConnectButton />
      </div>
    </nav>
  );
}