# 🌱 Chain Garden

Source repository:
https://github.com/chenqing0106/Chain-Garden

## 1. Product Vision

"Let a moment of inspiration grow into eternal beauty"

Chain Garden explores the intersection of Generative Art, AI, and Web3. Our vision is to transform invisible "sound" and abstract "emotion" into visual digital plants.

Each plant is unique: its DNA is derived from AI-interpreted textual imagery, and its growth is shaped by user-uploaded audio or microphone input. Using blockchain, these digital lives are permanently recorded on-chain, building a community-created, decentralized botanical garden.

---

## 2. Core Features

### 1. 🎵 Multimodal-Driven Generation (Audio & AI Driven)

- **Audio Spectrum Analysis**: Use Tone.js to capture live microphone audio or uploaded files, extract low/mid/high frequency features, and map them to plant growth parameters (e.g., branching density, growth speed).

- **AI Semantic Conversion**: Integrate Google Gemini API. Users provide a text prompt (e.g., "cyberpunk forest" or "a quiet afternoon") and AI converts it into plant DNA parameters (color, leaf shape, growth architecture).

### 2. 🌿 Procedural Plant Growth Engine

Based on fractal algorithms and mathematical models, supporting multiple growth architectures:

- Fractal Tree: classic recursive branching structure.
- Organic Vine: winding, curling curves for extended vine-like shapes.
- Radial Succulent: symmetric radial diffusion from a center point.
- Fern: self-similar pinnate patterns.
- Weeping Willow: long drooping branches with hanging feel.
- Alien Shrub: abstract sci-fi shrub forms with unconventional parameters.
- Crystal Cactus: geometric/crystalline branching for angular structures.
- Data Blossom: petals or radiating shapes directly mapped from numerical/audio data.

### 3. ⛓️ NFT Minting & Provenance

- **ERC-721 Standard**: Each plant can be minted as an NFT on Ethereum (Sepolia testnet).
- **Decentralized Storage**: Metadata (attributes, DNA) and images are stored on IPFS (Pinata/Web3.Storage) for permanence and censorship-resistance.

---

## 3. Key Innovations

### 0. User Story: How Invisible "Emotion" Can Be Healed

Pain point: In fast life, moments of self-healing are fleeting and intangible. Recordings capture raw audio data but not the life within it; many NFTs are just tradable code lacking emotional warmth.

What Chain Garden offers: Record into the microphone privately, a seed sprouts, leaves respond to your breath rhythm, and a unique digital life is born. Minting it on-chain becomes a permanent certificate of that healing moment.

### 1. 🎵 Cross-Modal "Synesthesia" Algorithm: Mapping Sound to Life

Unlike projects that rely on random seeds, Chain Garden builds a "sound-to-biomorph mapping engine." The user's voice directly determines plant appearance, making the minting process a reflection of the user's inner state rather than just randomness.

### 2. 🌿 Web3 "Digital Sound Therapy"

- **Visual Biofeedback**: As a user controls plant growth through voice, calming animations guide the user to regulate breathing, creating a therapeutic visual feedback loop.
- **Emotional Assetization**: Each minted plant records a meditation session—an asset that preserves the memory of a calming moment. We shift from "Play-to-Earn" to "Play-to-Heal." The blockchain guarantees permanence of these emotional records.

### 3. 💾 On-Chain Permanence: Code Is Life

Traditional Web2 assets risk link rot or server shutdown. Chain Garden stores not just a static image but the mathematical parameters (DNA) and seed on-chain. Anyone with that on-chain data can reproduce the plant exactly, ensuring reproducibility and independence from the project operator.

---

## 4. Technical Architecture

```
chain-garden/

├── contracts/                # Smart contract code
│   └── ChainGardenNFT.sol    # ERC-721 NFT contract

├── scripts/                  # Deployment scripts
│   └── deploy.js             # Contract deployment script

├── front/                    # React frontend
│   ├── components/           # React components
│   │   ├── MintModal.tsx
│   │   ├── PlantCanvas.tsx
│   │   └── SpecimenDetailModal.tsx
│   ├── services/             # Service layer
│   │   ├── audioService.ts   # Audio analysis
│   │   ├── geminiService.ts  # Gemini AI service
│   │   ├── plantMusicService.ts
│   │   ├── ipfsService.ts    # IPFS handling
│   │   └── web3Service.ts    # Web3 interactions
│   ├── App.tsx
│   ├── index.tsx
│   └── types.ts

├── hardhat.config.js         # Hardhat config
├── package.json              # Dependencies (Hardhat)
└── README.md                 # Project doc
```

Project stack:

- Frontend: React 19 + TypeScript + Vite
- UI: TailwindCSS
- Rendering: HTML5 Canvas (custom renderer)
- AI: Google Gemini Pro Vision
- Audio: Tone.js
- Web3: Ethers.js v6
- Wallet: MetaMask
- Contracts: Solidity 0.8.20 (OpenZeppelin)
- Dev: Hardhat, Sepolia testnet
- Storage: IPFS (Web3.Storage / Pinata)

---

## 5. User Guide

### 1. Environment Setup

- Install the MetaMask browser extension.
- Switch MetaMask to the Sepolia testnet.
- Have a small amount of Sepolia ETH (use a faucet) to pay gas.

### 2. Generating a Plant

DNA generation methods:

1) AI-Generated: Click "Generate from Vibe", enter a description (e.g., "Jazz music visual") and AI will produce a DNA.
2) Manual Parameters: Use sliders to tweak leaf shape, color palette, branching factors, etc.

Plant growth: Upload audio or enable the microphone—plants will grow and animate according to the sound.

### 3. Minting an NFT

1. Save your plant and click "CONNECT TO MINT" on the detail page.
2. Optionally upload the plant image (required), DNA, music, and recording to IPFS, then click "INITIATE MINT." 
3. MetaMask will prompt you to confirm the transaction (pay small test gas fees).
4. Wait for chain confirmation; your plant becomes a permanent on-chain asset.

---

## 6. Demo / Deployment

Live site:
https://chain-garden.vercel.app/

See the original repository README and demo video for details.

---

## 7. Roadmap

### 1. Product Expansion: From "Potted Plant" to "Life Companion"

- Mobile First: Build PWA or native mobile apps so users can record emotions anytime.
- Desktop Dynamic Wallpaper: Provide macOS/Windows desktop companion to render dynamic plants as wallpapers that respond to background music.

### 2. Deep On-Chain Interaction: Wallet as Soil, Actions as Growth Rings

- Wallet-as-Soil: On-chain activity can influence plant phenotype (e.g., heavy DeFi wallets produce metallic spikes).
- Growth Rings: Introduce "biological rings" that record user actions—each on-chain interaction or new recording leaves a unique ring texture on the trunk.

### 3. Social & Ecosystem: Build an "Emotion Forest"

- Multi-plant Garden: View all plants you've grown as a forest to visualize emotional trends.
- Co-Cultivation: Dual-mode where two users feed different audio into one plant; the plant blends both inputs and becomes a shared artifact.
- Social Hollow: Public garden for sharing and private "tree-hole" for confidential entries. Support an anonymous "message in a bottle" mode.

### 4. Targeted Promotions

- Independent Musicians / Podcasters: Use generated plants as unique cover art.
- Meditation & Yoga Communities: Plants as graduation mementos for sessions.
- Sound Gifts: Plants as replayable, emotional gifts containing the original recording.

### 5. Value Flow: Decentralized Plant Marketplace

- Adoption-first marketplace: Browse and adopt plants that resonate emotionally rather than purely trade.
- Royalties: Integrate EIP-2981 so original creators receive royalties on secondary sales.

**Chain Garden Team**
