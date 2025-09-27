import { ethers } from 'ethers';

/**
 * Utility function to execute blockchain transactions with better error handling
 * Optimized for Avalanche C-Chain
 * @param {Function} contractMethod - The contract method to call
 * @param {Array} params - Parameters to pass to the contract method
 * @param {Object} options - Transaction options
 * @returns {Promise} - Transaction receipt
 */
export const executeTransaction = async (contractMethod, params, options = {}) => {
  // Default options optimized for Avalanche C-Chain
  // Using legacy transactions by default as Avalanche may have issues with EIP-1559
  const defaultOptions = {
    gasLimit: 2000000, // Lower for Avalanche
    gasPrice: ethers.parseUnits('25', 'gwei'), // Use gasPrice for legacy transactions
    type: 0 // Legacy transaction type
  };

  const txOptions = { ...defaultOptions, ...options };
  
  try {
    // Execute transaction with legacy transaction type for Avalanche
    const tx = await contractMethod(...params, txOptions);
    console.log(`Transaction sent: ${tx.hash}`);
    
    const receipt = await tx.wait(1);
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    return receipt;
  } catch (error) {
    console.error('Transaction failed:', error);
    
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
    
    throw new Error(`Blockchain transaction failed: ${error.message}`);
  }
};

/**
 * Get the current gas price from the network with fallback
 * Optimized for Avalanche C-Chain
 * @param {ethers.Provider} provider - Ethers provider
 * @returns {Promise<BigNumber>} - Current gas price
 */
export const getSafeGasPrice = async (provider) => {
  try {
    const feeData = await provider.getFeeData();
    return feeData.maxFeePerGas || feeData.gasPrice || ethers.parseUnits('25', 'gwei');
  } catch (error) {
    console.error('Error getting gas price:', error);
    return ethers.parseUnits('25', 'gwei'); // Fallback gas price for Avalanche
  }
};