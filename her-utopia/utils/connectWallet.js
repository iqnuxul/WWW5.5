import { ethers } from "ethers";

export async function connectWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected wallet found (MetaMask / WalletConnect).");
  }

  // 请求账户
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const address = accounts[0];

  // provider & signer - 使用新版本的API
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return { provider, signer, address };
}

export async function getReadonlyProvider() {
  // fallback read-only provider (MetaMask if available)
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // you can replace with Infura/Alchemy if you want
  return ethers.getDefaultProvider();
}