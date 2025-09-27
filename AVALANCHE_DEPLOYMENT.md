# Avalanche Deployment Guide

## Overview
This document provides instructions for deploying the Evidence Blockchain application to the Avalanche C-Chain network.

## Prerequisites
- Node.js and npm installed
- MetaMask or another Ethereum-compatible wallet with Avalanche C-Chain configured
- AVAX tokens for gas fees (testnet or mainnet depending on deployment)

## Avalanche Network Configuration

### Mainnet (C-Chain)
- **Network Name**: Avalanche C-Chain
- **RPC URL**: https://api.avax.network/ext/bc/C/rpc
- **Chain ID**: 43114
- **Symbol**: AVAX
- **Explorer**: https://snowtrace.io/

### Testnet (Fuji C-Chain)
- **Network Name**: Avalanche Fuji C-Chain
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Chain ID**: 43113
- **Symbol**: AVAX
- **Explorer**: https://testnet.snowtrace.io/

## Smart Contract Deployment

1. **Configure Environment Variables**
   - Update the `.env` file with the appropriate Avalanche RPC URL
   - Ensure your wallet's private key is securely stored in the `.env` file

2. **Deploy the Contract**
   - Use a deployment script or Hardhat/Truffle to deploy to Avalanche
   - Example deployment command:
     ```
     npx hardhat run scripts/deploy.js --network avalanche
     ```

3. **Update Contract Address**
   - After deployment, update the `CONTRACT_ADDRESS` in your `.env` file

## Application Configuration

1. **Gas Optimization**
   - Avalanche has different gas dynamics than Ethereum
   - The application is configured with appropriate gas settings for Avalanche in:
     - `utils/blockchainUtils.js` - Using legacy transactions (type 0) instead of EIP-1559
     - `config/blockchain.js` - Configured for Avalanche Fuji testnet (chainId 43113)
     - `controller/complaintController.js` - Using optimized gas parameters

2. **Network Specific Settings**
   - Transaction confirmation times are faster on Avalanche
   - Gas prices are typically lower
   - The application is configured to use these optimized settings

## Running the Application

1. **Install Dependencies**
   ```
   npm install
   ```

2. **Start the Application**
   ```
   npm start
   ```

## Troubleshooting

- **Invalid Sender Error**: If you encounter "invalid sender" errors, ensure your private key is in the correct format (without '0x' prefix for Avalanche)
- **Transaction Errors**: The application now uses legacy transactions (type 0) by default for better Avalanche compatibility
- **Gas Estimation Failures**: Fixed gas limits are used to avoid estimation issues
- **Network Connectivity**: Ensure your connection to the Avalanche RPC is stable
- **Chain ID Issues**: Verify you're using the correct chain ID (43113 for Fuji testnet, 43114 for mainnet)

## Resources

- [Avalanche Documentation](https://docs.avax.network/)
- [Avalanche C-Chain](https://docs.avax.network/apis/avalanchego/apis/c-chain)
- [Gas Fee Management on Avalanche](https://docs.avax.network/quickstart/adjusting-gas-price-during-high-network-activity)