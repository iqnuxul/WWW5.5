### CoCreate – Web3 Collaborative Work Canvas

## Overview

CoCreate is a Web3-native collaboration platform designed for hackathons, DAOs, and small project teams.  

It introduces stake-based commitment, on-chain contribution tracking, and automated settlement to make online collaboration more accountable and transparent.

Team members stake funds to join a project, complete tasks and upload verifiable proofs, then receive their stake back once the work is approved—creating strong incentives to follow through and reducing the chance that anyone drops out.
---

## Key Features

- **Stake-Based Commitment**  
  Members must stake funds to join a project, aligning incentives and reducing drop‑outs.

- **Task & Proof System**  
  Project owners create tasks; contributors submit proofs (e.g., IPFS links) as evidence of work.

- **Automated Settlement**  
  When tasks are approved, staked funds are released and rewards are distributed; if rejected, stakes can be slashed.

- **Transparent Coordination**  
  All key actions (joins, tasks, approvals, slashes) are recorded on-chain for full auditability.

---

## Architecture

- **Smart Contracts (Foundry / Solidity)**  
  - Core business logic for projects, stakes, tasks, and contributions.
  - Designed for security (reentrancy protection, access control) and gas efficiency.

- **Backend (Node.js / TypeScript)**  
  - Listens to contract events and syncs them into a database.
  - Provides REST APIs for frontend (projects, tasks, members, IPFS integration).

- **Frontend (React + Vite + TypeScript)**  
  - DApp UI for creating/joining projects, managing tasks, and viewing contributions.
  - Wallet connection via wagmi / viem / RainbowKit.

---

## Smart Contracts

- **`ProjectFactory`**  
  - Creates and manages projects.  
  - Handles project configuration (stake amount, metadata).  
  - Manages membership (join/leave) and overall project lifecycle.

- **`StakeVault`**  
  - Holds and manages all stake funds.  
  - Handles deposits, releases, and slashing of stakes.  
  - Ensures funds are only moved according to project rules.

- **`TaskManager`**  
  - Creates tasks and assigns them to contributors.  
  - Accepts proof submissions (e.g., IPFS hashes).  
  - Allows project owners to approve or reject tasks, triggering settlement.

- **`ContributionNFT`**  
  - Mints non-transferable tokens as proof of contribution.  
  - Each token references task/project metadata.  
  - Builds a verifiable on-chain reputation for contributors.

---

## How It Works (High-Level Flow)

1. **Create Project** – Owner creates a project with a required stake amount.  
2. **Join Project** – Contributors stake funds to join.  
3. **Create Tasks** – Owner defines tasks and assigns them to members.  
4. **Submit Proof** – Contributors complete work and submit proofs (e.g., IPFS CID).  
5. **Review & Settle**  
   - If approved: stake is released and SBT is minted.  
   - If rejected: stake can be partially or fully slashed.  

---
