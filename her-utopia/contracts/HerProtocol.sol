// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IHerTerritory {
    function addressToMemberId(address) external view returns (uint256);
}

/**
 * @title HerProtocol
 * @dev 去中心化亲密 / 合作关系协议：
 * - 关系建立前必须有双边同意（ConsentContract）
 * - 支持多类型关系（情感 / 协作 / 导师 / 团结 / 浪漫）
 * - 每段关系必须声明 boundaries，可随时更新（形成链上边界记录）
 * - 冷却期（Cooldown）必须经双方在冷却结束后共同确认才可恢复
 * - 任何一方可单方面终止关系，记录终止时间与原因
 */
contract HerProtocol {
    IHerTerritory public territory;
    
    /// @notice 关系类型：情感 / 协作 / 导师 / 团结 / 浪漫
    enum RelationshipType { Emotional, Collaborative, Mentorship, Solidarity, Romantic }

    /// @notice 关系状态：活跃 / 冷却中 / 已终止
    enum RelationshipStatus { Active, Cooldown, Terminated }

    /// @notice 一段已建立的链上关系
    struct Relationship {
        address partyA;
        address partyB;
        RelationshipType relationshipType;
        string boundaries;          // 当前边界描述（文本 / CID）
        uint256 cooldownEnd;        // 冷却期结束时间（若为 0 则无冷却中）
        RelationshipStatus status;
        uint256 createdAt;
        uint256 terminatedAt;
        string terminationReason;   // 结束说明
    }

    /// @notice 关系同意合约（用于在建立关系前记录双边同意）
    struct ConsentContract {
        address initiator;
        address counterparty;
        bool initiatedConsent;      // 发起方是否已签署（创建即为 true）
        bool counterpartyConsent;   // 对方是否同意
        uint256 proposedAt;
        uint256 consentedAt;
        RelationshipType relationshipType; // 拟定关系类型
        string relationshipTerms;          // 初始边界 / 关系条款（文本 / CID）
    }
    
    /// @notice 关系ID -> Relationship
    mapping(bytes32 => Relationship) public relationships;

    /// @notice 同意合约ID -> ConsentContract
    mapping(bytes32 => ConsentContract) public consentContracts;

    /// @notice 某地址参与的所有关系 ID 列表
    mapping(address => bytes32[]) public userRelationships;

    /// @notice 某地址参与的所有同意合约 ID 列表（无论是 initiator 还是 counterparty）
    mapping(address => bytes32[]) public userConsentContracts;

    /// @notice 冷却期双方确认：relationshipId -> (user -> 是否已确认冷却结束)
    mapping(bytes32 => mapping(address => bool)) public cooldownConfirmations;
    
    event RelationshipProposed(
        bytes32 indexed consentId,
        address indexed initiator,
        address indexed counterparty,
        RelationshipType relationshipType
    );

    event RelationshipConsented(
        bytes32 indexed consentId,
        address indexed initiator,
        address indexed counterparty
    );

    event RelationshipEstablished(
        bytes32 indexed relationshipId,
        address indexed partyA,
        address indexed partyB,
        RelationshipType relationshipType
    );

    event CooldownInitiated(
        bytes32 indexed relationshipId,
        uint256 cooldownEnd
    );

    event CooldownConfirmRecorded(
        bytes32 indexed relationshipId,
        address indexed confirmer
    );

    event RelationshipTerminated(
        bytes32 indexed relationshipId,
        string reason
    );

    event BoundariesUpdated(
        bytes32 indexed relationshipId,
        string newBoundaries
    );
    
    modifier onlyMember() {
        require(territory.addressToMemberId(msg.sender) > 0, "Not a community member");
        _;
    }
    
    modifier onlyRelationshipParty(bytes32 _relationshipId) {
        Relationship storage rel = relationships[_relationshipId];
        require(
            rel.partyA == msg.sender || 
            rel.partyB == msg.sender,
            "Not a party in this relationship"
        );
        _;
    }
    
    constructor(address _territory) {
        require(_territory != address(0), "Territory address required");
        territory = IHerTerritory(_territory);
    }
    
    // ------------------------------------------------------------------------
    //                            关系同意合约（Consent）
    // ------------------------------------------------------------------------

    /**
     * @notice 发起一段关系提案（不会立刻建立关系，只创建同意合约）
     * @param _counterparty 关系另一方
     * @param _relationshipType 拟定关系类型
     * @param _relationshipTerms 初始关系条款 / 边界描述（文本 / CID）
     */
    function proposeRelationship(
        address _counterparty,
        RelationshipType _relationshipType,
        string memory _relationshipTerms
    ) external onlyMember {
        require(_counterparty != msg.sender, "Cannot propose relationship with yourself");
        require(territory.addressToMemberId(_counterparty) > 0, "Counterparty not a member");
        
        bytes32 consentId = keccak256(
            abi.encodePacked(msg.sender, _counterparty, block.timestamp, _relationshipType)
        );
        
        consentContracts[consentId] = ConsentContract({
            initiator: msg.sender,
            counterparty: _counterparty,
            initiatedConsent: true,
            counterpartyConsent: false,
            proposedAt: block.timestamp,
            consentedAt: 0,
            relationshipType: _relationshipType,
            relationshipTerms: _relationshipTerms
        });
        
        userConsentContracts[msg.sender].push(consentId);
        userConsentContracts[_counterparty].push(consentId);
        
        emit RelationshipProposed(consentId, msg.sender, _counterparty, _relationshipType);
    }
    
    /**
     * @notice 对一份关系同意合约给出“同意”，并据此建立正式关系
     * @param _consentId 关系同意合约ID
     */
    function consentToRelationship(bytes32 _consentId) external onlyMember {
        ConsentContract storage contract_ = consentContracts[_consentId];
        require(contract_.counterparty == msg.sender, "Not the intended counterparty");
        require(contract_.initiatedConsent, "Invalid consent");
        require(!contract_.counterpartyConsent, "Already consented");
        
        contract_.counterpartyConsent = true;
        contract_.consentedAt = block.timestamp;
        
        // 根据双方同意内容正式建立关系
        _establishRelationship(
            contract_.initiator,
            contract_.counterparty,
            contract_.relationshipType,
            contract_.relationshipTerms
        );
        
        emit RelationshipConsented(_consentId, contract_.initiator, contract_.counterparty);
    }
    
    // ------------------------------------------------------------------------
    //                            关系建立 & 查询
    // ------------------------------------------------------------------------

    function _establishRelationship(
        address _partyA,
        address _partyB,
        RelationshipType _relationshipType,
        string memory _boundaries
    ) internal {
        bytes32 relationshipId = keccak256(
            abi.encodePacked(_partyA, _partyB, _relationshipType, block.timestamp)
        );
        
        relationships[relationshipId] = Relationship({
            partyA: _partyA,
            partyB: _partyB,
            relationshipType: _relationshipType,
            boundaries: _boundaries,
            cooldownEnd: 0,
            status: RelationshipStatus.Active,
            createdAt: block.timestamp,
            terminatedAt: 0,
            terminationReason: ""
        });
        
        userRelationships[_partyA].push(relationshipId);
        userRelationships[_partyB].push(relationshipId);
        
        emit RelationshipEstablished(relationshipId, _partyA, _partyB, _relationshipType);
    }

    // ------------------------------------------------------------------------
    //                             边界（Boundaries）
    // ------------------------------------------------------------------------

    /**
     * @notice 更新当前关系的边界（无需对方同意即可声明自己的边界）
     * @dev 不做内容判断，仅记录声明 & 时间
     */
    function updateBoundaries(
        bytes32 _relationshipId,
        string memory _newBoundaries
    )
        external
        onlyRelationshipParty(_relationshipId)
    {
        Relationship storage relationship = relationships[_relationshipId];
        require(relationship.status == RelationshipStatus.Active, "Relationship not active");
        
        relationship.boundaries = _newBoundaries;
        emit BoundariesUpdated(_relationshipId, _newBoundaries);
    }

    // ------------------------------------------------------------------------
    //                         冷却期（Cooldown）机制
    // ------------------------------------------------------------------------

    /**
     * @notice 发起冷却期：任意一方可触发，关系进入 Cooldown 状态
     * @dev 冷却期间双方无法终止“冷却本身”，但仍可选择 Terminate 结束关系
     */
    function initiateCooldown(bytes32 _relationshipId)
        external
        onlyRelationshipParty(_relationshipId)
    {
        Relationship storage relationship = relationships[_relationshipId];
        require(relationship.status == RelationshipStatus.Active, "Relationship not active");
        
        // 默认冷却 7 天，可根据需要后续在协议层调整
        relationship.cooldownEnd = block.timestamp + 7 days;
        relationship.status = RelationshipStatus.Cooldown;

        // 重置双方的冷却确认状态
        cooldownConfirmations[_relationshipId][relationship.partyA] = false;
        cooldownConfirmations[_relationshipId][relationship.partyB] = false;
        
        emit CooldownInitiated(_relationshipId, relationship.cooldownEnd);
    }

    /**
     * @notice 冷却结束后，由双方各自调用本函数进行“确认”
     * @dev 当双方都确认，且时间 >= cooldownEnd，关系恢复为 Active
     */
    function confirmCooldownEnd(bytes32 _relationshipId)
        external
        onlyRelationshipParty(_relationshipId)
    {
        Relationship storage relationship = relationships[_relationshipId];
        require(relationship.status == RelationshipStatus.Cooldown, "Not in cooldown");
        require(block.timestamp >= relationship.cooldownEnd, "Cooldown period not ended");

        // 记录当前调用者已确认冷却结束
        cooldownConfirmations[_relationshipId][msg.sender] = true;
        emit CooldownConfirmRecorded(_relationshipId, msg.sender);

        // 检查另一方是否也已确认
        address other = (msg.sender == relationship.partyA)
            ? relationship.partyB
            : relationship.partyA;

        if (cooldownConfirmations[_relationshipId][other]) {
            // 双方均在冷却结束后确认 => 恢复为 Active
            relationship.status = RelationshipStatus.Active;
            relationship.cooldownEnd = 0;

            // 可选择清空确认状态，防止未来逻辑混淆（非必须）
            cooldownConfirmations[_relationshipId][relationship.partyA] = false;
            cooldownConfirmations[_relationshipId][relationship.partyB] = false;
        }
    }

    // ------------------------------------------------------------------------
    //                             关系终止（Terminate）
    // ------------------------------------------------------------------------

    /**
     * @notice 任意一方可随时终止关系，并写入终止原因（链上“离场声明”）
     */
    function terminateRelationship(
        bytes32 _relationshipId,
        string memory _reason
    )
        external
        onlyRelationshipParty(_relationshipId)
    {
        Relationship storage relationship = relationships[_relationshipId];
        require(relationship.status != RelationshipStatus.Terminated, "Already terminated");
        
        relationship.status = RelationshipStatus.Terminated;
        relationship.terminatedAt = block.timestamp;
        relationship.terminationReason = _reason;
        
        emit RelationshipTerminated(_relationshipId, _reason);
    }

    // ------------------------------------------------------------------------
    //                               View 方法
    // ------------------------------------------------------------------------
    
    function getUserRelationships(address _user)
        external
        view
        returns (bytes32[] memory)
    {
        return userRelationships[_user];
    }
    
    function getUserConsentContracts(address _user)
        external
        view
        returns (bytes32[] memory)
    {
        return userConsentContracts[_user];
    }
    
    function getRelationship(bytes32 _relationshipId)
        external
        view
        returns (
            address partyA,
            address partyB,
            RelationshipType relationshipType,
            string memory boundaries,
            uint256 cooldownEnd,
            RelationshipStatus status,
            uint256 createdAt,
            uint256 terminatedAt,
            string memory terminationReason
        )
    {
        Relationship storage r = relationships[_relationshipId];
        return (
            r.partyA,
            r.partyB,
            r.relationshipType,
            r.boundaries,
            r.cooldownEnd,
            r.status,
            r.createdAt,
            r.terminatedAt,
            r.terminationReason
        );
    }
    
    function getConsentContract(bytes32 _consentId)
        external
        view
        returns (
            address initiator,
            address counterparty,
            bool initiatedConsent,
            bool counterpartyConsent,
            uint256 proposedAt,
            uint256 consentedAt,
            RelationshipType relationshipType,
            string memory relationshipTerms
        )
    {
        ConsentContract storage c = consentContracts[_consentId];
        return (
            c.initiator,
            c.counterparty,
            c.initiatedConsent,
            c.counterpartyConsent,
            c.proposedAt,
            c.consentedAt,
            c.relationshipType,
            c.relationshipTerms
        );
    }
    
    /**
     * @notice 查询两人之间是否存在“至少一段”仍处于 Active 的关系
     */
    function hasActiveRelationship(address _userA, address _userB)
        external
        view
        returns (bool)
    {
        bytes32[] memory relationshipsA = userRelationships[_userA];
        for (uint256 i = 0; i < relationshipsA.length; i++) {
            Relationship storage rel = relationships[relationshipsA[i]];
            if (
                (rel.partyA == _userA && rel.partyB == _userB) ||
                (rel.partyA == _userB && rel.partyB == _userA)
            ) {
                if (rel.status == RelationshipStatus.Active) {
                    return true;
                }
            }
        }
        return false;
    }
}
