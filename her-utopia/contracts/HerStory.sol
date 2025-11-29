// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice 仅用于成员资格校验的 Territory 接口
interface IHerTerritory {
    function addressToMemberId(address) external view returns (uint256);
    function members(uint256) external view returns (
        uint256 id,
        address wallet,
        uint256 joinTime,
        uint256 reputation, // 保持兼容，但本合约不使用
        bool isActive
    );
}

/**
 * @title Minimal Soulbound ERC721-like base
 * @dev 提供最小化的 ERC721 接⼝，但完全不可转移（SBT）
 *      - 仅支持 mint，不支持 transfer / approve / burn
 *      - 主要为了让「每个叙事 = 唯一 tokenId」的 NFT 叙事逻辑成立
 */
abstract contract SoulboundERC721 {
    // ERC721 事件与基本状态
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    string private _name;
    string private _symbol;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    // --------- ERC721 基本只读接口 ---------

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner_ = _owners[tokenId];
        require(owner_ != address(0), "SBT: non-existent token");
        return owner_;
    }

    function balanceOf(address owner_) public view returns (uint256) {
        require(owner_ != address(0), "SBT: zero address");
        return _balances[owner_];
    }

    function getApproved(uint256) public pure returns (address) {
        return address(0);
    }

    function isApprovedForAll(address, address) public pure returns (bool) {
        return false;
    }

    // --------- 禁用所有转移 / 授权操作 ---------

    function approve(address, uint256) public pure {
        revert("SBT: approvals disabled");
    }

    function setApprovalForAll(address, bool) public pure {
        revert("SBT: approvals disabled");
    }

    function transferFrom(address, address, uint256) public pure {
        revert("SBT: non-transferable");
    }

    function safeTransferFrom(address, address, uint256) public pure {
        revert("SBT: non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) public pure {
        revert("SBT: non-transferable");
    }

    // --------- 内部 mint 工具 ---------

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "SBT: mint to zero");
        require(!_exists(tokenId), "SBT: token exists");

        _owners[tokenId] = to;
        _balances[to] += 1;

        emit Transfer(address(0), to, tokenId);
    }
}

/**
 * @title HerStory
 * @notice 叙事 = Soulbound NFT (SBF)，不可转让，只能由作者铸造与管理状态
 *         支持：认证（attest）、情感共鸣（5 类型）、封存 / 归档 / 加密访问、统计与筛选
 */
contract HerStory is SoulboundERC721 {
    IHerTerritory public territory;

    /// @notice 叙事状态
    /// Active   可被访问、认证、共鸣
    /// Sealed   封存 / 加密，仅哈希公开（由作者线下控制解密权限）
    /// Archived 归档，不再参与新的认证 / 共鸣，但历史数据保留
    enum NarrativeStatus { Active, Sealed, Archived }

    /// @notice 共鸣类型：将情绪反应当作一种知识与价值
    enum ResonanceType { Support, Empathy, Solidarity, Recognition, Healing }

    /// @notice 单条叙事元数据（对应一个 soulbound NFT）
    struct Narrative {
        uint256 id;              // = tokenId
        string contentHash;      // 只存哈希 / CID，不存明文
        bool isEncrypted;        // 是否加密
        NarrativeStatus status;  // 当前状态
        uint256 timestamp;       // 铸造时间
        uint256 attestationCount;// 认证次数
        uint256 resonanceScore;  // 共鸣总分（按不同情感权重累积）
        string title;            // 标题（可选）
        string narrativeType;    // 类型/标签，如 "diary", "poem", "voice", etc.
    }

    /// @notice tokenId => Narrative
    mapping(uint256 => Narrative) public narratives;

    /// @notice 作者地址 => 其全部叙事 tokenId 列表
    mapping(address => uint256[]) public authorNarratives;

    /// @notice tokenId => (user => 是否已认证)
    mapping(uint256 => mapping(address => bool)) private narrativeAttestations;

    /// @notice tokenId => (user => 共鸣类型)
    mapping(uint256 => mapping(address => ResonanceType)) private narrativeResonances;

    /// @notice tokenId => (user => 是否已共鸣，用于防止重复共鸣)
    mapping(uint256 => mapping(address => bool)) private hasResonated;

    /// @notice 作者地址 => 其收到的总共鸣分数
    mapping(address => uint256) public userTotalResonance;

    /// @notice 不同共鸣类型的权重（可由成员调整）
    mapping(ResonanceType => uint256) public resonanceWeights;

    /// @notice 自增的下一个叙事 tokenId
    uint256 private _nextNarrativeId;

    // ---------------- Events ----------------

    event NarrativeRecorded(
        uint256 indexed narrativeId,
        address indexed author,
        string contentHash,
        bool isEncrypted,
        string narrativeType
    );

    event NarrativeAttested(
        uint256 indexed narrativeId,
        address indexed attester
    );

    event NarrativeResonated(
        uint256 indexed narrativeId,
        address indexed resonator,
        ResonanceType resonanceType,
        uint256 newScore
    );

    event NarrativeStatusChanged(
        uint256 indexed narrativeId,
        NarrativeStatus newStatus
    );

    /// @dev 表示作者向某个成员授予解密/访问权限（具体密钥交换在线下完成）
    event NarrativeDecryptionGranted(
        uint256 indexed narrativeId,
        address indexed grantee
    );

    // ---------------- Modifiers ----------------

    modifier onlyMember() {
        require(territory.addressToMemberId(msg.sender) > 0, "Not a community member");
        _;
    }

    modifier onlyAuthor(uint256 _narrativeId) {
        require(_exists(_narrativeId), "Narrative does not exist");
        require(ownerOf(_narrativeId) == msg.sender, "Not the author");
        _;
    }

    constructor(address _territory)
        SoulboundERC721("Her Utopia Story SBF", "HER-STORY")
    {
        require(_territory != address(0), "Territory address required");
        territory = IHerTerritory(_territory);

        // 默认共鸣权重设定（可后续调整）
        resonanceWeights[ResonanceType.Support]     = 1;
        resonanceWeights[ResonanceType.Empathy]     = 2;
        resonanceWeights[ResonanceType.Solidarity]  = 3;
        resonanceWeights[ResonanceType.Recognition] = 4;
        resonanceWeights[ResonanceType.Healing]     = 5;
    }

    // ------------------------------------------------------------------------
    //                               铸造叙事（SBF）
    // ------------------------------------------------------------------------

    /**
     * @notice 铸造一条新的叙事 Soulbound NFT
     * @param _contentHash   明文内容的哈希 / IPFS CID / 加密 payload 的 CID
     * @param _isEncrypted   是否为加密内容（true 时代表需要额外的离线解密协商）
     * @param _title         叙事标题
     * @param _narrativeType 叙事类型标签，如 "diary", "poem", "voice", "essay" 等
     */
    function recordNarrative(
        string memory _contentHash,
        bool _isEncrypted,
        string memory _title,
        string memory _narrativeType
    ) external onlyMember {
        uint256 narrativeId = _nextNarrativeId;
        _nextNarrativeId += 1;

        // 1. 铸造 soulbound NFT：作者 = msg.sender
        _mint(msg.sender, narrativeId);

        // 2. 写入叙事元数据
        narratives[narrativeId] = Narrative({
            id: narrativeId,
            contentHash: _contentHash,
            isEncrypted: _isEncrypted,
            status: NarrativeStatus.Active,
            timestamp: block.timestamp,
            attestationCount: 0,
            resonanceScore: 0,
            title: _title,
            narrativeType: _narrativeType
        });

        // 3. 记录作者 → 其叙事 id 列表
        authorNarratives[msg.sender].push(narrativeId);

        emit NarrativeRecorded(
            narrativeId,
            msg.sender,
            _contentHash,
            _isEncrypted,
            _narrativeType
        );
    }

    // ------------------------------------------------------------------------
    //                             认证（Attest）
    // ------------------------------------------------------------------------

    /**
     * @notice 对某条叙事发起认证："我听见了"
     * - 不能认证自己的叙事
     * - 同一成员对同一叙事只能认证一次
     * - 仅在 Active 状态下可认证
     */
    function attestNarrative(uint256 _narrativeId) external onlyMember {
        require(_exists(_narrativeId), "Narrative does not exist");
        Narrative storage n = narratives[_narrativeId];

        require(n.status == NarrativeStatus.Active, "Narrative not active");
        require(ownerOf(_narrativeId) != msg.sender, "Cannot attest own narrative");
        require(!narrativeAttestations[_narrativeId][msg.sender], "Already attested");

        narrativeAttestations[_narrativeId][msg.sender] = true;
        n.attestationCount += 1;

        emit NarrativeAttested(_narrativeId, msg.sender);
    }

    function hasAttested(uint256 _narrativeId, address _user)
        external
        view
        returns (bool)
    {
        return narrativeAttestations[_narrativeId][_user];
    }

    // ------------------------------------------------------------------------
    //                         共鸣（Resonance）系统
    // ------------------------------------------------------------------------

    /**
     * @notice 对某条叙事进行共鸣（情绪反应）
     * @dev 限制：
     *  - 不能对自己的叙事共鸣
     *  - 每个成员对同一叙事只能选择一次共鸣类型
     *  - 共鸣会为该叙事作者累加对应的共鸣分数
     */
    function resonateWithNarrative(
        uint256 _narrativeId,
        ResonanceType _resonanceType
    ) external onlyMember {
        require(_exists(_narrativeId), "Narrative does not exist");
        Narrative storage n = narratives[_narrativeId];

        require(n.status == NarrativeStatus.Active, "Narrative not active");
        require(ownerOf(_narrativeId) != msg.sender, "Cannot resonate with own narrative");
        require(!hasResonated[_narrativeId][msg.sender], "Already resonated");

        uint256 weight = resonanceWeights[_resonanceType];
        require(weight > 0, "Invalid resonance weight");

        n.resonanceScore += weight;
        hasResonated[_narrativeId][msg.sender] = true;
        narrativeResonances[_narrativeId][msg.sender] = _resonanceType;

        address author = ownerOf(_narrativeId);
        userTotalResonance[author] += weight;

        emit NarrativeResonated(_narrativeId, msg.sender, _resonanceType, n.resonanceScore);
    }

    function getUserResonance(uint256 _narrativeId, address _user)
        external
        view
        returns (bool has, ResonanceType rType)
    {
        if (!hasResonated[_narrativeId][_user]) {
            return (false, ResonanceType.Support);
        }
        return (true, narrativeResonances[_narrativeId][_user]);
    }

    /**
     * @notice 设置某种共鸣类型的权重
     * @dev 简化版本：任何成员均可调整（更接近“共识开放实验”）
     *      如需更严格，可改由某治理层合约调用
     */
    function setResonanceWeight(
        ResonanceType _type,
        uint256 _weight
    ) external onlyMember {
        resonanceWeights[_type] = _weight;
    }

    // ------------------------------------------------------------------------
    //                           状态管理：封存 / 归档
    // ------------------------------------------------------------------------

    /**
     * @notice 作者变更叙事状态（Active / Sealed / Archived）
     */
    function updateNarrativeStatus(
        uint256 _narrativeId,
        NarrativeStatus _newStatus
    ) external onlyAuthor(_narrativeId) {
        narratives[_narrativeId].status = _newStatus;
        emit NarrativeStatusChanged(_narrativeId, _newStatus);
    }

    /**
     * @notice 快捷封存：标记为 Sealed 并 isEncrypted = true
     * @dev 对应白皮书中的「Sealed」逻辑：只存哈希，视为安全空间
     */
    function sealNarrative(uint256 _narrativeId)
        external
        onlyAuthor(_narrativeId)
    {
        Narrative storage n = narratives[_narrativeId];
        n.status = NarrativeStatus.Sealed;
        n.isEncrypted = true;
        emit NarrativeStatusChanged(_narrativeId, NarrativeStatus.Sealed);
    }

    /**
     * @notice 作者向指定成员授予解密访问权限（事件型）
     * @dev 具体密钥交换 / 解密数据传输在链下完成，本事件只作为可追溯的「访问授权」证据
     */
    function grantDecryptionAccess(
        uint256 _narrativeId,
        address _grantee
    ) external onlyAuthor(_narrativeId) onlyMember {
        require(narratives[_narrativeId].isEncrypted, "Narrative not encrypted");
        emit NarrativeDecryptionGranted(_narrativeId, _grantee);
    }

    // ------------------------------------------------------------------------
    //                             查询 & 统计
    // ------------------------------------------------------------------------

    function getNarrativeInfo(uint256 _narrativeId)
        external
        view
        returns (
            uint256 id,
            address author,
            string memory contentHash,
            bool isEncrypted,
            NarrativeStatus status,
            uint256 timestamp,
            uint256 attestationCount,
            uint256 resonanceScore,
            string memory title,
            string memory narrativeType
        )
    {
        require(_exists(_narrativeId), "Narrative does not exist");
        Narrative storage n = narratives[_narrativeId];

        return (
            n.id,
            ownerOf(_narrativeId),
            n.contentHash,
            n.isEncrypted,
            n.status,
            n.timestamp,
            n.attestationCount,
            n.resonanceScore,
            n.title,
            n.narrativeType
        );
    }

    function getNarrativesByAuthor(address _author)
        external
        view
        returns (uint256[] memory)
    {
        return authorNarratives[_author];
    }

    /// @notice 获取共鸣分数 ≥ _minScore 且仍为 Active 状态的叙事列表
    function getHighResonanceNarratives(uint256 _minScore)
        external
        view
        returns (uint256[] memory)
    {
        uint256 total = _nextNarrativeId;
        uint256 count = 0;

        for (uint256 i = 0; i < total; i++) {
            Narrative storage n = narratives[i];
            if (n.resonanceScore >= _minScore && n.status == NarrativeStatus.Active) {
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;

        for (uint256 i = 0; i < total; i++) {
            Narrative storage n = narratives[i];
            if (n.resonanceScore >= _minScore && n.status == NarrativeStatus.Active) {
                result[idx++] = i;
            }
        }

        return result;
    }

    /// @notice 获取最近 _count 条叙事（按创建顺序逆序）
    function getRecentNarratives(uint256 _count)
        external
        view
        returns (uint256[] memory)
    {
        uint256 total = _nextNarrativeId;
        uint256 resultCount = _count > total ? total : _count;
        uint256[] memory result = new uint256[](resultCount);

        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = total - 1 - i;
        }
        return result;
    }

    /// @notice 某成员的叙事参与统计
    function getNarrativeStats(address _user)
        external
        view
        returns (
            uint256 totalCreated,
            uint256 totalAttested,
            uint256 totalResonated,
            uint256 totalResonanceReceived
        )
    {
        totalCreated = authorNarratives[_user].length;
        totalAttested = 0;
        totalResonated = 0;

        uint256 total = _nextNarrativeId;
        for (uint256 i = 0; i < total; i++) {
            if (narrativeAttestations[i][_user]) {
                totalAttested += 1;
            }
            if (hasResonated[i][_user]) {
                totalResonated += 1;
            }
        }

        totalResonanceReceived = userTotalResonance[_user];
    }

    /// @notice 当前已铸造的叙事总数（= 最大 tokenId + 1）
    function totalNarratives() external view returns (uint256) {
        return _nextNarrativeId;
    }
}
