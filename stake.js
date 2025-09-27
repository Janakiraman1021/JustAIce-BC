// In browser console (with MetaMask connected)
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const stakingABI = ["function stake() payable"];
const contract = new ethers.Contract(
  "0x60A6ec872AAd3e4832832F951a9EfB3998EF73Df",
  stakingABI,
  signer
);

// Stake 0.001 ETH
const tx = await contract.stake({
  value: ethers.utils.parseEther("0.001")
});

await tx.wait();
console.log("Staking successful!");