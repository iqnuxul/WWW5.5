// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HerEconomy
 * @notice 记录情绪劳动、照护劳动等被忽视的劳动，并用内部记账的 HER 余额表示“关系中的回馈”。
 */

interface IHerTerritory {
    function addressToMemberId(address) external view returns (uint256);

    /// @dev 可选：由 Territory 记录该成员的总贡献值（如果对方未实现该函数，会被 try/catch 吃掉）
    function addContribution(address memberAddr, uint256 contribution) external;
}

contract HerEconomy {
    /// @notice 劳动类型
    enum LaborType { Emotional, Care, Education, Support, Creative }

    struct LaborRecord {
        uint256 id;          // 记录 ID（数组下标）
        address provider;    // 提供劳动的人
        address receiver;    // 接受劳动的人
        LaborType laborType; // 劳动类型
        uint256 duration;    // 劳动时长（由成员自报，比如分钟/小时，自行约定）
        uint256 value;       // 本次劳动折算得到的 HER 记账值
        uint256 timestamp;   // 记录时间
        string cid;          // 叙述 / 证明 / 描述的 IPFS CID（可选）
    }

    /// @notice 连接身份层 HerTerritory：仅成员可参与
    IHerTerritory public territory;

    /// @notice 各劳动类型的基础“价值系数”
    mapping(LaborType => uint256) public laborValue;

    /// @notice 成员地址 → 内部记账型 HER 余额（非 ERC20，仅此合约内流转）
    mapping(address => uint256) public herBalance;

    /// @notice 全部劳动记录
    LaborRecord[] public laborRecords;

    /// @notice 每个提供者地址 → ta 参与的劳动记录 ID 列表
    mapping(address => uint256[]) public providerRecords;

    /// @notice 每个提供者地址 → 累计贡献的总 HER 值（便于做统计/展示用）
    mapping(address => uint256) public providerTotalValue;

    // ------------------------------------------------------------------------
    //                                 EVENTS
    // ------------------------------------------------------------------------

    /// @notice 记录一次劳动及其折算值
    event LaborRecorded(
        uint256 indexed recordId,
        address indexed provider,
        address indexed receiver,
        LaborType laborType,
        uint256 value,
        string cid
    );

    /// @notice HER 记账值在成员之间转移（象征性回馈/感谢）
    event TokensTransferred(address indexed from, address indexed to, uint256 amount);

    // ------------------------------------------------------------------------
    //                               MODIFIERS
    // ------------------------------------------------------------------------

    modifier onlyMember() {
        require(territory.addressToMemberId(msg.sender) > 0, "HerEconomy: not a member");
        _;
    }

    // ------------------------------------------------------------------------
    //                               CONSTRUCTOR
    // ------------------------------------------------------------------------

    constructor(address _territory) {
        require(_territory != address(0), "HerEconomy: territory required");
        territory = IHerTerritory(_territory);

        // 不同劳动类型的基础价值系数
        // 白皮书语义：不同类型的照护 / 情绪 / 知识 / 创作劳动，都被视为有价值
        laborValue[LaborType.Emotional]  = 50;
        laborValue[LaborType.Care]       = 40;
        laborValue[LaborType.Education]  = 60;
        laborValue[LaborType.Support]    = 30;
        laborValue[LaborType.Creative]   = 70;
    }

    // ------------------------------------------------------------------------
    //                          CORE: 记录劳动 & 记账
    // ------------------------------------------------------------------------

    /**
     * @notice 记录一次劳动，并按 laborType × duration 生成 HER 记账值
     * @param _laborType  劳动类型（情绪 / 照护 / 教育 / 支持 / 创作）
     * @param _duration   劳动时长，具体单位由社区自我约定
     * @param _receiver   接收劳动的一方，必须也是成员
     * @param _cid        相关描述 / 叙述 / 证明的 IPFS CID，可为空字符串
     *
     * 逻辑：
     *  - 只有成员可以调用（onlyMember）
     *  - receiver 也必须是成员
     *  - value = laborValue[type] * duration
     *  - provider 的 herBalance 增加 value
     *  - 记录写入 laborRecords & providerRecords
     *  - 尝试调用 territory.addContribution(provider, value) 进行跨模块记录（若未实现则静默失败）
     */
    function recordLabor(
        LaborType _laborType,
        uint256 _duration,
        address _receiver,
        string calldata _cid
    ) external onlyMember {
        require(territory.addressToMemberId(_receiver) > 0, "HerEconomy: receiver not member");
        require(_duration > 0, "HerEconomy: invalid duration");

        uint256 unitValue = laborValue[_laborType];
        require(unitValue > 0, "HerEconomy: labor value not set");

        uint256 value = unitValue * _duration;

        uint256 recordId = laborRecords.length;

        laborRecords.push(
            LaborRecord({
                id: recordId,
                provider: msg.sender,
                receiver: _receiver,
                laborType: _laborType,
                duration: _duration,
                value: value,
                timestamp: block.timestamp,
                cid: _cid
            })
        );

        providerRecords[msg.sender].push(recordId);
        providerTotalValue[msg.sender] += value;

        // 给提供者记账：“获得 HER”
        herBalance[msg.sender] += value;

        emit LaborRecorded(recordId, msg.sender, _receiver, _laborType, value, _cid);

        // 可选：同步贡献到 Territory（比如用于 Debug / Reputation / 统计）
        // 如果 Territory 没实现 addContribution，不会 revert
        try territory.addContribution(msg.sender, value) {} catch {}
    }

    // ------------------------------------------------------------------------
    //                        CORE: HER 记账值的转移
    // ------------------------------------------------------------------------

    /**
     * @notice 在成员之间转移 HER 记账值，用于象征性的“感谢 / 回馈”
     * @dev 这不是 ERC20，仅在本合约内部映射中变化
     */
    function transferTokens(address _to, uint256 _amount) external onlyMember {
        require(_to != address(0), "HerEconomy: invalid receiver");
        require(territory.addressToMemberId(_to) > 0, "HerEconomy: receiver not member");
        require(herBalance[msg.sender] >= _amount, "HerEconomy: balance too low");

        herBalance[msg.sender] -= _amount;
        herBalance[_to] += _amount;

        emit TokensTransferred(msg.sender, _to, _amount);
    }

    // ------------------------------------------------------------------------
    //                                VIEWS
    // ------------------------------------------------------------------------

    /// @notice 返回劳动记录总数
    function totalLaborRecords() external view returns (uint256) {
        return laborRecords.length;
    }

    /// @notice 获取某条劳动记录的完整信息
    function getLaborRecord(uint256 id) external view returns (LaborRecord memory) {
        require(id < laborRecords.length, "HerEconomy: record not found");
        return laborRecords[id];
    }

    /// @notice 获取某个地址作为提供者参与的所有劳动记录 ID
    function getProviderRecords(address provider) external view returns (uint256[] memory) {
        return providerRecords[provider];
    }

    /// @notice 查询某个地址累计贡献的总 HER 值
    function getProviderTotalValue(address provider) external view returns (uint256) {
        return providerTotalValue[provider];
    }

    /// @notice 查询某个地址当前 HER 余额
    function getHerBalance(address account) external view returns (uint256) {
        return herBalance[account];
    }

    /// @notice 查询某种劳动类型的基础价值系数
    function getLaborUnitValue(LaborType laborType) external view returns (uint256) {
        return laborValue[laborType];
    }
}
