# Deployment Scripts

## Overview
This directory contains scripts for deploying the Evidence Blockchain application to the Avalanche C-Chain network.

## Available Scripts

### deploy.js
Deploys the ComplaintRegistry smart contract to the Avalanche C-Chain network.

#### Usage
```
node scripts/deploy.js
```

#### Features
- Automatically detects testnet vs mainnet based on RPC URL
- Uses optimized gas settings for Avalanche
- Includes fallback to legacy transaction type if EIP-1559 fails
- Automatically updates .env file with new contract address

## Requirements
- Node.js v14 or higher
- Environment variables configured in .env file:
  - RPC_URL: Avalanche C-Chain RPC endpoint
  - PRIVATE_KEY: Ethereum private key for deployment