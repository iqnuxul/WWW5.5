// utils/getContract.js
import { ethers } from "ethers";


const HerManagerABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_territory",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_economy",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_commons",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_story",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_protocol",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_debug",
				"type": "address"
			}
		],
		"name": "initializeSystem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lockSystem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "moduleName",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldAddress",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "by",
				"type": "address"
			}
		],
		"name": "ModuleUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_territory",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_economy",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_commons",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_story",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_protocol",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_debug",
				"type": "address"
			}
		],
		"name": "replaceAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "territory",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "economy",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "commons",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "story",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "protocol",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "debug",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "by",
				"type": "address"
			}
		],
		"name": "SystemDeployed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "by",
				"type": "address"
			}
		],
		"name": "SystemLocked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_commons",
				"type": "address"
			}
		],
		"name": "updateCommons",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_debug",
				"type": "address"
			}
		],
		"name": "updateDebug",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_economy",
				"type": "address"
			}
		],
		"name": "updateEconomy",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_protocol",
				"type": "address"
			}
		],
		"name": "updateProtocol",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_story",
				"type": "address"
			}
		],
		"name": "updateStory",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_territory",
				"type": "address"
			}
		],
		"name": "updateTerritory",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "commons",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "debug",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "economy",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getSystemStatus",
		"outputs": [
			{
				"internalType": "address",
				"name": "territoryAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "economyAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "commonsAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "storyAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "protocolAddress",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "debugAddress",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "initialized",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "locked",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isInitialized",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "protocol",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "story",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "systemInitialized",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "systemLocked",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "territory",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const HerDebugABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_territory",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_multisig",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "length",
          "type": "uint256"
        }
      ],
      "name": "StringsInsufficientHexLength",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "flawId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "witness",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "testimony",
          "type": "string"
        }
      ],
      "name": "CollectiveWitnessAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "member",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "awakeningStatement",
          "type": "string"
        }
      ],
      "name": "ConsciousnessAwakened",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "rewriter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "newLogic",
          "type": "string"
        }
      ],
      "name": "LogicRewritten",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previous",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "current",
          "type": "address"
        }
      ],
      "name": "MultisigUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "awakening",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "witness",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "repair",
          "type": "uint256"
        }
      ],
      "name": "RewardsUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "flawId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "witness",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum HerDebug.SystemLayer",
          "name": "layer",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "currentLogic",
          "type": "string"
        }
      ],
      "name": "SystemFlawWitnessed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "flawId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "healingManifesto",
          "type": "string"
        }
      ],
      "name": "SystemHealed",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "AWAKENING_REWARD",
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
      "inputs": [],
      "name": "REPAIR_REWARD",
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
      "inputs": [],
      "name": "WITNESS_REWARD",
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
          "name": "flawId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "personalTestimony",
          "type": "string"
        }
      ],
      "name": "addCollectiveWitness",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "awakeningManifestos",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "awareToken",
      "outputs": [
        {
          "internalType": "contract ConsciousnessToken",
          "name": "",
          "type": "address"
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
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "flawWitnesses",
      "outputs": [
        {
          "internalType": "address",
          "name": "witness",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "testimony",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "witnessedAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAwakeningHistory",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "getConsciousnessBalance",
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
          "name": "flawId",
          "type": "uint256"
        }
      ],
      "name": "getFlawWitnesses",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "witness",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "testimony",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "witnessedAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct HerDebug.AwakeningWitness[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSystemHealth",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "healed",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "witnessing",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalFlaws",
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
      "inputs": [],
      "name": "getTotalProposals",
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
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasRepaired",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
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
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasWitnessed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "multisig",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }
      ],
      "name": "reachCollectiveAgreement",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "repairProposals",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "flawId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "rewriter",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "newLogic",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "metaphorExplanation",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "proposedAt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "collectiveAgreement",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isIntegrated",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "flawId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "newLogic",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "metaphorExplanation",
          "type": "string"
        }
      ],
      "name": "rewriteSystemLogic",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_multisig",
          "type": "address"
        }
      ],
      "name": "setMultisig",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "systemFlaws",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "witness",
          "type": "address"
        },
        {
          "internalType": "enum HerDebug.SystemLayer",
          "name": "layer",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "flawDescription",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "currentLogic",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "desiredLogic",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "witnessedAt",
          "type": "uint256"
        },
        {
          "internalType": "enum HerDebug.ConsciousnessStage",
          "name": "stage",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "collectiveWitness",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "repairAttempts",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isHealed",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "territory",
      "outputs": [
        {
          "internalType": "contract IHerTerritory",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "awakening",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "witness",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "repair",
          "type": "uint256"
        }
      ],
      "name": "updateRewards",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum HerDebug.SystemLayer",
          "name": "layer",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "flawDescription",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "currentLogic",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "desiredLogic",
          "type": "string"
        }
      ],
      "name": "witnessSystemFlaw",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
const HerCommonsABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_territory",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "concernCount",
          "type": "uint256"
        }
      ],
      "name": "ConsensusBlocked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "FundsTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "proposer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum HerCommons.ProposalType",
          "name": "proposalType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        }
      ],
      "name": "ProposalCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum HerCommons.ProposalStatus",
          "name": "finalStatus",
          "type": "uint8"
        }
      ],
      "name": "ProposalExecuted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "responder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "comment",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "raisesCoreConcern",
          "type": "bool"
        }
      ],
      "name": "RespondedToProposal",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "support",
          "type": "bool"
        }
      ],
      "name": "Voted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "votingEnd",
          "type": "uint256"
        }
      ],
      "name": "VotingOpened",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "CORE_CONCERN_THRESHOLD",
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
      "inputs": [],
      "name": "MIN_QUORUM",
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
      "inputs": [],
      "name": "SUPERMAJORITY_PERCENT",
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
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_debugTarget",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_listeningDays",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_votingDays",
          "type": "uint256"
        }
      ],
      "name": "createDebugProposal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_listeningDays",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_votingDays",
          "type": "uint256"
        }
      ],
      "name": "createFundingProposal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_proposalId",
          "type": "uint256"
        }
      ],
      "name": "executeProposal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getActiveProposals",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_proposalId",
          "type": "uint256"
        }
      ],
      "name": "getProposalBasic",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "proposer",
          "type": "address"
        },
        {
          "internalType": "enum HerCommons.ProposalType",
          "name": "proposalType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "listeningEnd",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "votingEnd",
          "type": "uint256"
        },
        {
          "internalType": "enum HerCommons.ProposalStatus",
          "name": "status",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_proposalId",
          "type": "uint256"
        }
      ],
      "name": "getProposalDetail",
      "outputs": [
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "recipient",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "forVotes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "againstVotes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalVotes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "coreValueConcerns",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "debugTarget",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalProposals",
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
          "name": "_proposalId",
          "type": "uint256"
        }
      ],
      "name": "getVotingStatus",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "forVotes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "againstVotes",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalVotes",
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
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasRaisedConcern",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
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
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasResponded",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
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
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasVoted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_proposalId",
          "type": "uint256"
        }
      ],
      "name": "openVoting",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_proposalId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_comment",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "_raisesCoreConcern",
          "type": "bool"
        }
      ],
      "name": "respondToProposal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "territory",
      "outputs": [
        {
          "internalType": "contract IHerTerritory",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_proposalId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "support",
          "type": "bool"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ];
const HerEconomyABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_territory",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "recordId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum HerEconomy.LaborType",
          "name": "laborType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "cid",
          "type": "string"
        }
      ],
      "name": "LaborRecorded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokensTransferred",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "getHerBalance",
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
          "name": "id",
          "type": "uint256"
        }
      ],
      "name": "getLaborRecord",
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
              "name": "provider",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "receiver",
              "type": "address"
            },
            {
              "internalType": "enum HerEconomy.LaborType",
              "name": "laborType",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "duration",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "cid",
              "type": "string"
            }
          ],
          "internalType": "struct HerEconomy.LaborRecord",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum HerEconomy.LaborType",
          "name": "laborType",
          "type": "uint8"
        }
      ],
      "name": "getLaborUnitValue",
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
          "internalType": "address",
          "name": "provider",
          "type": "address"
        }
      ],
      "name": "getProviderRecords",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "provider",
          "type": "address"
        }
      ],
      "name": "getProviderTotalValue",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "herBalance",
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
      "name": "laborRecords",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "provider",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "internalType": "enum HerEconomy.LaborType",
          "name": "laborType",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "duration",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "cid",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum HerEconomy.LaborType",
          "name": "",
          "type": "uint8"
        }
      ],
      "name": "laborValue",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "providerRecords",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "providerTotalValue",
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
          "internalType": "enum HerEconomy.LaborType",
          "name": "_laborType",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "_duration",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_receiver",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_cid",
          "type": "string"
        }
      ],
      "name": "recordLabor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "territory",
      "outputs": [
        {
          "internalType": "contract IHerTerritory",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalLaborRecords",
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
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "transferTokens",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
const HerTerritoryABI = [
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
          "name": "memberId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        }
      ],
      "name": "MemberJoined",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "addressToMemberId",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "pure",
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
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getMember",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "joinTime",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "memberId",
          "type": "uint256"
        }
      ],
      "name": "getMemberById",
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
              "name": "wallet",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "joinTime",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            }
          ],
          "internalType": "struct HerTerritory.Member",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "isMember",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "joinCommunity",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "members",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "joinTime",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalMembers",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "pure",
      "type": "function"
    }
  ];
const HerStoryABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_territory",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "narrativeId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "attester",
          "type": "address"
        }
      ],
      "name": "NarrativeAttested",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "narrativeId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "grantee",
          "type": "address"
        }
      ],
      "name": "NarrativeDecryptionGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "narrativeId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "author",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "contentHash",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isEncrypted",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "narrativeType",
          "type": "string"
        }
      ],
      "name": "NarrativeRecorded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "narrativeId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "resonator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum HerStory.ResonanceType",
          "name": "resonanceType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newScore",
          "type": "uint256"
        }
      ],
      "name": "NarrativeResonated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "narrativeId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum HerStory.NarrativeStatus",
          "name": "newStatus",
          "type": "uint8"
        }
      ],
      "name": "NarrativeStatusChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_narrativeId",
          "type": "uint256"
        }
      ],
      "name": "attestNarrative",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "authorNarratives",
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
          "internalType": "address",
          "name": "owner_",
          "type": "address"
        }
      ],
      "name": "balanceOf",
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
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_minScore",
          "type": "uint256"
        }
      ],
      "name": "getHighResonanceNarratives",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_narrativeId",
          "type": "uint256"
        }
      ],
      "name": "getNarrativeInfo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "author",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "contentHash",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isEncrypted",
          "type": "bool"
        },
        {
          "internalType": "enum HerStory.NarrativeStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "attestationCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "resonanceScore",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "narrativeType",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getNarrativeStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "totalCreated",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalAttested",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalResonated",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalResonanceReceived",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_author",
          "type": "address"
        }
      ],
      "name": "getNarrativesByAuthor",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_count",
          "type": "uint256"
        }
      ],
      "name": "getRecentNarratives",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_narrativeId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserResonance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "has",
          "type": "bool"
        },
        {
          "internalType": "enum HerStory.ResonanceType",
          "name": "rType",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_narrativeId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_grantee",
          "type": "address"
        }
      ],
      "name": "grantDecryptionAccess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_narrativeId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "hasAttested",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
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
      "name": "narratives",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "contentHash",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isEncrypted",
          "type": "bool"
        },
        {
          "internalType": "enum HerStory.NarrativeStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "attestationCount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "resonanceScore",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "narrativeType",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_contentHash",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "_isEncrypted",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_narrativeType",
          "type": "string"
        }
      ],
      "name": "recordNarrative",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum HerStory.ResonanceType",
          "name": "",
          "type": "uint8"
        }
      ],
      "name": "resonanceWeights",
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
          "name": "_narrativeId",
          "type": "uint256"
        },
        {
          "internalType": "enum HerStory.ResonanceType",
          "name": "_resonanceType",
          "type": "uint8"
        }
      ],
      "name": "resonateWithNarrative",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_narrativeId",
          "type": "uint256"
        }
      ],
      "name": "sealNarrative",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "enum HerStory.ResonanceType",
          "name": "_type",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "_weight",
          "type": "uint256"
        }
      ],
      "name": "setResonanceWeight",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "territory",
      "outputs": [
        {
          "internalType": "contract IHerTerritory",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalNarratives",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_narrativeId",
          "type": "uint256"
        },
        {
          "internalType": "enum HerStory.NarrativeStatus",
          "name": "_newStatus",
          "type": "uint8"
        }
      ],
      "name": "updateNarrativeStatus",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "userTotalResonance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
const HerProtocolABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_territory",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "relationshipId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "newBoundaries",
          "type": "string"
        }
      ],
      "name": "BoundariesUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "relationshipId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "confirmer",
          "type": "address"
        }
      ],
      "name": "CooldownConfirmRecorded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "relationshipId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "cooldownEnd",
          "type": "uint256"
        }
      ],
      "name": "CooldownInitiated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "consentId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "initiator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "counterparty",
          "type": "address"
        }
      ],
      "name": "RelationshipConsented",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "relationshipId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "partyA",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "partyB",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum HerProtocol.RelationshipType",
          "name": "relationshipType",
          "type": "uint8"
        }
      ],
      "name": "RelationshipEstablished",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "consentId",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "initiator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "counterparty",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum HerProtocol.RelationshipType",
          "name": "relationshipType",
          "type": "uint8"
        }
      ],
      "name": "RelationshipProposed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "bytes32",
          "name": "relationshipId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "RelationshipTerminated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_relationshipId",
          "type": "bytes32"
        }
      ],
      "name": "confirmCooldownEnd",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "consentContracts",
      "outputs": [
        {
          "internalType": "address",
          "name": "initiator",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "counterparty",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "initiatedConsent",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "counterpartyConsent",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "proposedAt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "consentedAt",
          "type": "uint256"
        },
        {
          "internalType": "enum HerProtocol.RelationshipType",
          "name": "relationshipType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "relationshipTerms",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_consentId",
          "type": "bytes32"
        }
      ],
      "name": "consentToRelationship",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "cooldownConfirmations",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_consentId",
          "type": "bytes32"
        }
      ],
      "name": "getConsentContract",
      "outputs": [
        {
          "internalType": "address",
          "name": "initiator",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "counterparty",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "initiatedConsent",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "counterpartyConsent",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "proposedAt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "consentedAt",
          "type": "uint256"
        },
        {
          "internalType": "enum HerProtocol.RelationshipType",
          "name": "relationshipType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "relationshipTerms",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_relationshipId",
          "type": "bytes32"
        }
      ],
      "name": "getRelationship",
      "outputs": [
        {
          "internalType": "address",
          "name": "partyA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "partyB",
          "type": "address"
        },
        {
          "internalType": "enum HerProtocol.RelationshipType",
          "name": "relationshipType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "boundaries",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "cooldownEnd",
          "type": "uint256"
        },
        {
          "internalType": "enum HerProtocol.RelationshipStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "terminatedAt",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "terminationReason",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserConsentContracts",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserRelationships",
      "outputs": [
        {
          "internalType": "bytes32[]",
          "name": "",
          "type": "bytes32[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_userA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_userB",
          "type": "address"
        }
      ],
      "name": "hasActiveRelationship",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_relationshipId",
          "type": "bytes32"
        }
      ],
      "name": "initiateCooldown",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_counterparty",
          "type": "address"
        },
        {
          "internalType": "enum HerProtocol.RelationshipType",
          "name": "_relationshipType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "_relationshipTerms",
          "type": "string"
        }
      ],
      "name": "proposeRelationship",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "relationships",
      "outputs": [
        {
          "internalType": "address",
          "name": "partyA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "partyB",
          "type": "address"
        },
        {
          "internalType": "enum HerProtocol.RelationshipType",
          "name": "relationshipType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "boundaries",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "cooldownEnd",
          "type": "uint256"
        },
        {
          "internalType": "enum HerProtocol.RelationshipStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "createdAt",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "terminatedAt",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "terminationReason",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_relationshipId",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "_reason",
          "type": "string"
        }
      ],
      "name": "terminateRelationship",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "territory",
      "outputs": [
        {
          "internalType": "contract IHerTerritory",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_relationshipId",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "_newBoundaries",
          "type": "string"
        }
      ],
      "name": "updateBoundaries",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userConsentContracts",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userRelationships",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];


// 合约地址，从 .env.local 读取（NEXT_PUBLIC_ 前缀）
const ADDRS = {
  HerManager: process.env.NEXT_PUBLIC_HER_MANAGER_ADDRESS,
  HerDebug: process.env.NEXT_PUBLIC_HER_DEBUG_ADDRESS,
  HerCommons: process.env.NEXT_PUBLIC_HER_COMMONS_ADDRESS,
  HerEconomy: process.env.NEXT_PUBLIC_HER_ECONOMY_ADDRESS,
  HerTerritory: process.env.NEXT_PUBLIC_HER_TERRITORY_ADDRESS,
  HerStory: process.env.NEXT_PUBLIC_HER_STORY_ADDRESS,
  HerProtocol: process.env.NEXT_PUBLIC_HER_PROTOCOL_ADDRESS,
};

// 兼容两种 ABI 存放形式：直接 array，或 { abi: [...] }
function normalizeAbi(maybe) {
  if (!maybe) return [];
  if (Array.isArray(maybe)) return maybe;
  if (maybe.abi && Array.isArray(maybe.abi)) return maybe.abi;
  return [];
}

function _getAbiByName(name) {
  if (name === "HerManager") return normalizeAbi(HerManagerABI);
  if (name === "HerDebug") return normalizeAbi(HerDebugABI);
  if (name === "HerCommons") return normalizeAbi(HerCommonsABI);
  if (name === "HerEconomy") return normalizeAbi(HerEconomyABI);
  if (name === "HerTerritory") return normalizeAbi(HerTerritoryABI);
  if (name === "HerStory") return normalizeAbi(HerStoryABI);
  if (name === "HerProtocol") return normalizeAbi(HerProtocolABI);
  return [];
}

const EMPTY_ABI = [];

/**
 * 创建并返回合约实例（可用于 read 或 write）
 * @param {string} name - 合约名，必须为 ADDRS 中的键之一（HerManager/HerDebug/...）
 * @param {Signer|Provider} signerOrProvider
 * @returns ethers.Contract
 */
export function getContractInstance(name, signerOrProvider) {
  if (!ADDRS[name]) {
    throw new Error(`${name} address not set in .env - 请检查环境变量配置`);
  }

  if (ADDRS[name] === "0x0000000000000000000000000000000000000000") {
    console.warn(`⚠️ ${name} 合约地址为零地址，请先部署合约并更新 .env.local`);
  }

  let abi = _getAbiByName(name);
  if (!abi || abi.length === 0) {
    console.warn(`⚠️ 未找到 ${name} 的 ABI（请在 utils/getContract.js 顶部粘入 ABI），将使用空 ABI（部分调用会失败）`);
    abi = EMPTY_ABI;
  }

  try {
    const contract = new ethers.Contract(ADDRS[name], abi, signerOrProvider);
    console.log(`✅ 创建 ${name} 合约实例，地址: ${ADDRS[name]}`);
    return contract;
  } catch (err) {
    console.error(`❌ 创建 ${name} 合约实例失败:`, err);
    throw err;
  }
}

/* ========== 专用工具函数 ========== */

/**
 * 获取 HerManager.getSystemStatus() 的封装返回（友好格式）
 */
export async function getSystemStatus(signerOrProvider) {
  try {
    const manager = getContractInstance("HerManager", signerOrProvider);
    const status = await manager.getSystemStatus();
    return {
      territory: status[0],
      economy: status[1],
      commons: status[2],
      story: status[3],
      protocol: status[4],
      debug: status[5],
      initialized: status[6],
      locked: status[7]
    };
  } catch (err) {
    console.error("获取系统状态失败:", err);
    return {
      territory: ADDRS.HerTerritory,
      economy: ADDRS.HerEconomy,
      commons: ADDRS.HerCommons,
      story: ADDRS.HerStory,
      protocol: ADDRS.HerProtocol,
      debug: ADDRS.HerDebug,
      initialized: false,
      locked: false,
      _isFallback: true
    };
  }
}

/**
 * 检查某个合约在 provider 对应的链上是否已部署（检查字节码）
 */
export async function checkContractDeployment(contractName, provider) {
  try {
    if (!provider || !ADDRS[contractName]) {
      return { deployed: false, message: "provider 或 address 缺失" };
    }
    const code = await provider.getCode(ADDRS[contractName]);
    if (!code || code === "0x") {
      return { deployed: false, message: `❌ ${contractName} 合约未部署或地址错误` };
    }
    return { deployed: true, message: `✅ ${contractName} 合约已部署` };
  } catch (err) {
    return { deployed: false, message: `❌ 检查 ${contractName} 失败: ${err.message}` };
  }
}

/**
 * 批量检查所有模块合约部署状态（返回对象）
 */
export async function checkAllContractsDeployment(provider) {
  const names = ["HerManager","HerDebug","HerCommons","HerEconomy","HerTerritory","HerStory","HerProtocol"];
  const res = {};
  for (const n of names) {
    res[n] = await checkContractDeployment(n, provider);
  }
  return res;
}

export function formatAddress(address, start = 6, end = 4) {
  if (!address) return "未设置";
  if (address === "0x0000000000000000000000000000000000000000") return "未设置";
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function getAllContractAddresses() {
  return { ...ADDRS };
}

/**
 * 简化版本：直接通过合约名获取合约实例
 * 自动使用浏览器钱包的 provider
 */
export async function getContract(contractName) {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      console.warn("没有检测到钱包");
      return null;
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    return getContractInstance(contractName, signer);
  } catch (error) {
    console.error(`获取 ${contractName} 合约失败:`, error);
    return null;
  }
}