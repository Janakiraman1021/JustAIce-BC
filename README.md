# Evidence Blockchain (EVID-BC)

A blockchain-based evidence management system deployed on Avalanche C-Chain.

## Overview

This application allows users to securely file complaints and store evidence on the blockchain. It uses:

- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Blockchain**: Avalanche C-Chain
- **Storage**: IPFS via Pinata

## Features

- User authentication and authorization
- Secure complaint filing
- Evidence storage on IPFS
- Blockchain verification using Avalanche C-Chain
- Immutable record keeping

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Avalanche C-Chain wallet with AVAX
- Pinata API keys for IPFS storage

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd evid-bc
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a `.env` file in the root directory with the following variables:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
```

## Avalanche Deployment

This project is configured for deployment on the Avalanche C-Chain. For detailed deployment instructions, see [AVALANCHE_DEPLOYMENT.md](./AVALANCHE_DEPLOYMENT.md).

### Quick Deployment

To deploy the smart contract to Avalanche:

```bash
npm run deploy:avalanche
```

This will:
1. Compile and deploy the ComplaintRegistry contract
2. Update your .env file with the new contract address

## Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on http://localhost:3000 (or the port specified in your environment).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Complaints
- `POST /api/complaints` - File a new complaint
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/:id` - Get a specific complaint

## Smart Contract

The ComplaintRegistry smart contract is deployed on the Avalanche C-Chain and provides the following functions:

- `addComplaint(string _id, string _user, string _hash)` - Add a new complaint
- `getComplaint(uint index)` - Get complaint details by index
- `totalComplaints()` - Get the total number of complaints

## Blockchain Utilities

The application includes utilities for interacting with the Avalanche blockchain:

- `executeTransaction()` - Handles transaction execution with fallback mechanisms
- `getSafeGasPrice()` - Gets optimal gas prices for Avalanche

## License

ISC