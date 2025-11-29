import { ethers } from "ethers";

// Paste your contract ABI and address here
const contractABI = [
       {
           "inputs": [],
           "stateMutability": "nonpayable",
           "type": "constructor"
       },
       {
           "anonymous": false,
           "inputs": [
               {
                   "indexed": false,
                   "internalType": "uint256",
                   "name": "id",
                   "type": "uint256"
               },
               {
                   "indexed": false,
                   "internalType": "address",
                   "name": "patron",
                   "type": "address"
               },
               {
                   "indexed": false,
                   "internalType": "string",
                   "name": "description",
                   "type": "string"
               },
               {
                   "indexed": false,
                   "internalType": "string",
                   "name": "finishDate",
                   "type": "string"
               },
               {
                   "indexed": false,
                   "internalType": "uint256",
                   "name": "price",
                   "type": "uint256"
               },
               {
                   "indexed": false,
                   "internalType": "string",
                   "name": "status",
                   "type": "string"
               }
           ],
           "name": "CommissionCreated",
           "type": "event"
       },
       {
           "inputs": [],
           "name": "commissionCount",
           "outputs": [
               {
                   "internalType": "uint256",
                   "name": "",
                   "type": "uint256"
               }
           ],
           "stateMutability": "view",
           "type": "function"
       },
       {
           "inputs": [
               {
                   "internalType": "uint256",
                   "name": "",
                   "type": "uint256"
               }
           ],
           "name": "commissions",
           "outputs": [
               {
                   "internalType": "uint256",
                   "name": "id",
                   "type": "uint256"
               },
               {
                   "internalType": "address",
                   "name": "patron",
                   "type": "address"
               },
               {
                   "internalType": "string",
                   "name": "description",
                   "type": "string"
               },
               {
                   "internalType": "string",
                   "name": "finishDate",
                   "type": "string"
               },
               {
                   "internalType": "uint256",
                   "name": "price",
                   "type": "uint256"
               },
               {
                   "internalType": "string",
                   "name": "status",
                   "type": "string"
               }
           ],
           "stateMutability": "view",
           "type": "function"
       },
       {
           "inputs": [
               {
                   "internalType": "string",
                   "name": "_description",
                   "type": "string"
               },
               {
                   "internalType": "string",
                   "name": "_finishDate",
                   "type": "string"
               },
               {
                   "internalType": "uint256",
                   "name": "_price",
                   "type": "uint256"
               }
           ],
           "name": "createCommission",
           "outputs": [],
           "stateMutability": "nonpayable",
           "type": "function"
       },
       {
           "inputs": [
               {
                   "internalType": "uint256",
                   "name": "_id",
                   "type": "uint256"
               }
           ],
           "name": "getCommission",
           "outputs": [
               {
                   "components": [
                       {
                           "internalType": "uint256",
                           "name": "id",
                           "type": "uint256"
                       },
                       {
                           "internalType": "address",
                           "name": "patron",
                           "type": "address"
                       },
                       {
                           "internalType": "string",
                           "name": "description",
                           "type": "string"
                       },
                       {
                           "internalType": "string",
                           "name": "finishDate",
                           "type": "string"
                       },
                       {
                           "internalType": "uint256",
                           "name": "price",
                           "type": "uint256"
                       },
                       {
                           "internalType": "string",
                           "name": "status",
                           "type": "string"
                       }
                   ],
                   "internalType": "struct CommissionManager.Commission",
                   "name": "",
                   "type": "tuple"
               }
           ],
           "stateMutability": "view",
           "type": "function"
       }
   ];
const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";


// Quick provider for demo (Remix VM or local node)
export const getContract = () => {
  try {
    // Connect to a local JSON-RPC endpoint (Remix VM endpoint)
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-url-of-your-node");

    // For demo, use the first signer (no wallet needed)
    const signer = provider.getSigner(0);

    return new ethers.Contract(contractAddress, contractABI, signer);
  } catch (err) {
    console.error("Error creating contract:", err);
    return null;
  }
};
