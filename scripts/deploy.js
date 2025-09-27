// Deployment script for Avalanche C-Chain
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Deploying ComplaintRegistry contract to Avalanche C-Chain...');

  // Configure provider for Avalanche
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL, {
    name: 'avalanche',
    chainId: process.env.RPC_URL.includes('test') ? 43113 : 43114, // Detect testnet or mainnet
  });

  // Create wallet from private key
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log(`Deploying from address: ${wallet.address}`);

  // Get contract bytecode and ABI
  const contractPath = path.join(__dirname, '..', 'contracts', 'ComplaintRegistry.sol');
  const contractSource = fs.readFileSync(contractPath, 'utf8');

  // Compile contract (simplified - in production use hardhat/truffle)
  console.log('Compiling contract...');
  
  // For this example, we'll assume the contract is already compiled
  // and we have the ABI and bytecode
  const contractAbiPath = path.join(__dirname, '..', 'abi', 'ComplaintContract.json');
  const contractAbi = JSON.parse(fs.readFileSync(contractAbiPath, 'utf8'));
  
  // In a real deployment script, you would compile the contract here
  // or use a pre-compiled artifact

  // Create contract factory
  const contractFactory = new ethers.ContractFactory(
    contractAbi,
    '0x608060405234801561001057600080fd5b50610a30806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80634cc0e2bc146100465780635f8bafc01461007d5780639a2af4dd1461009b575b600080fd5b610060600480360381019061005b91906104e5565b6100b7565b6040516100749897969594939291906105a0565b60405180910390f35b61008561032a565b6040516100929190610646565b60405180910390f35b6100b560048036038101906100b09190610697565b610336565b005b600081815481106100c757600080fd5b90600052602060002090600302016000915090508060000180546100ea90610706565b80601f016020809104026020016040519081016040528092919081815260200182805461011690610706565b80156101635780601f1061013857610100808354040283529160200191610163565b820191906000526020600020905b81548152906001019060200180831161014657829003601f168201915b50505050509080600101805461017890610706565b80601f01602080910402602001604051908101604052809291908181526020018280546101a490610706565b80156101f15780601f106101c6576101008083540402835291602001916101f1565b820191906000526020600020905b8154815290600101906020018083116101d457829003601f168201915b50505050509080600201805461020690610706565b80601f016020809104026020016040519081016040528092919081815260200182805461023290610706565b801561027f5780601f106102545761010080835404028352916020019161027f565b820191906000526020600020905b81548152906001019060200180831161026257829003601f168201915b505050505090508356fea2646970667358221220d7a0f12f67a9f1e5c2a8c6e4c11e8d8a8a6a9b8a7a6a5a4a3a2a1a09f8e7d6c5a4a3a2a1a09f8e7d6c5a4a3a2a1a09f8e7d6c5a4a3a2a1a09f8e7d6c64736f6c63430008140033', // This is a placeholder bytecode
    wallet
  );

  // Deploy with Avalanche-specific gas settings using legacy transactions
  console.log('Deploying contract...');
  const deploymentOptions = {
    gasLimit: 2000000, // Lower gas limit for Avalanche
    gasPrice: ethers.parseUnits('25', 'gwei'), // Use gasPrice for legacy transactions
    type: 0 // Legacy transaction type for Avalanche compatibility
  };

  try {
    const contract = await contractFactory.deploy(deploymentOptions);
    console.log(`Contract deployment transaction hash: ${contract.deploymentTransaction().hash}`);
    
    // Wait for deployment to complete
    console.log('Waiting for deployment confirmation...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log(`Contract deployed to: ${contractAddress}`);
    
    // Update .env file with new contract address
    console.log('Updating .env file with new contract address...');
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace CONTRACT_ADDRESS line
    envContent = envContent.replace(
      /CONTRACT_ADDRESS=.*/,
      `CONTRACT_ADDRESS=${contractAddress}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('Deployment complete!');
    
    return contractAddress;
  } catch (error) {
    console.error('Deployment failed:', error);
    
    // Log detailed error information for debugging
    if (error.error) {
      console.error('Error details:', error.error);
    }
    if (error.transaction) {
      console.error('Transaction details:', {
        from: error.transaction.from,
        to: error.transaction.to,
        data: error.transaction.data?.substring(0, 100) + '...' // Truncate data for readability
      });
    }
    
    console.error('Deployment failed. Please check your private key and network settings.');
    process.exit(1);
  }
  }
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });