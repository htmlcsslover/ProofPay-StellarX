# ProofPay: Verifiable Income on Stellar

ProofPay is a decentralized platform designed to provide **verifiable income history** for freelancers and gig workers using the Stellar network. By leveraging structured on-chain metadata and advanced history analysis, ProofPay enables workers to build a portable, immutable credit profile that doesn't rely on traditional banking records.

Built for the **StellarX PH Workshop @ PUP QC**.

## 🚀 The Problem
Freelancers often struggle to prove their income for loans, rentals, or visas because their earnings are fragmented across multiple platforms and currencies. ProofPay solves this by creating a "Proof of Payment" standard on Stellar.

## ✨ Key Features

- **Identity-First Experience:** Switch between **Freelancer** and **Employer** modes with a single Stellar wallet.
- **Verifiable Income Reports:** Automatically analyze on-chain history to generate credit-like metrics:
  - **Stability Score:** Based on income volatility and consistency.
  - **Reliability Score:** Based on recurring clients and verified payroll records.
  - **Fraud Detection:** Built-in detection for self-transfers and wash trading.
- **Structured Payroll:** Employers can pay freelancers using the **ProofPay Memo Standard** (`PPAY:S:`, `PPAY:C:`, etc.) to automatically categorize income for the recipient.
- **Soroban Integration:** Includes a "Savings Goal" smart contract to help users set and track financial milestones directly on-chain.

## 🛠️ Tech Stack

- **Frontend:** Next.js + TypeScript + Tailwind CSS v4
- **Blockchain:** Stellar (XLM) & Soroban (Rust)
- **Wallet:** Freighter Extension
- **SDKs:** `@stellar/stellar-sdk` v15+, `@stellar/freighter-api` v6

## 📂 Project Structure

```text
.
└── ProofPay/
    ├── web/                # Next.js 15+ Frontend application
    ├── contracts/          # Soroban smart contracts (Rust)
    │   └── savings-goal/   # On-chain savings milestone tracker
    ├── scripts/            # Deployment and setup scripts
    └── Cargo.toml          # Rust workspace configuration
```

## 🚦 Getting Started

### Prerequisites
- **Node.js 20+**
- **Freighter Wallet** (Set to **Test Net**)
- **Rust & Stellar CLI** (Only required for contract development)

### 1. Setup the Web App
```bash
cd ProofPay/web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

### 2. Deploy the Contract (Optional)
To enable the Savings Goal feature, deploy the contract to Testnet:
```bash
cd ProofPay
# Windows
.\scripts\deploy.ps1
# macOS/Linux
./scripts/deploy.sh
```
The script will update your `web/.env.local` with the new `NEXT_PUBLIC_CONTRACT_ID`.

## 📝 The ProofPay Standard
ProofPay uses the Stellar transaction **Memo** field to categorize payments without requiring complex smart contracts for every transfer:

| Prefix | Type | Description |
|---|---|---|
| `PPAY:S:` | Salary | Regular, recurring payroll payments. |
| `PPAY:C:` | Contract | One-time or milestone-based project fees. |
| `PPAY:B:` | Bonus | Performance-based incentives. |
| `PPAY:R:` | Reimburse | Expense reimbursements. |

## ⚖️ License
This project is licensed under the MIT License - see the [LICENSE](ProofPay/LICENSE) file for details.

---
**ProofPay** · Empowering the global workforce with verifiable financial history on Stellar.
