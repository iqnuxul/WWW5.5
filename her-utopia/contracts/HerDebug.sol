// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IHerTerritory {
    function addressToMemberId(address) external view returns (uint256);
    // 预留兼容字段，不在本合约中做加权或权限区分，只用于确认成员存在性
    function members(uint256) external view returns (
        uint256 id,
        address wallet,
        uint256 joinTime,
        uint256 reputation,
        bool isActive
    );
}

/**
 * @title ConsciousnessToken (AWARE)
 * @dev HerDebug 模块内使用的“觉醒积分”代币，用于奖励觉醒者 / 见证者 / 修复者。
 *      对应白皮书中 “用 HER Token 奖励觉醒者、见证者和修复者” 的积分逻辑。
 *      在本实现中，具体记账载体为 AWARE 代币。
 */
contract ConsciousnessToken is ERC20, Ownable {
    constructor() ERC20("Consciousness", "AWARE") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

/**
 * @title HerDebug
 * @notice
 *  “发现 —— 见证 —— 重写 —— 治愈” 的链上流程实现。
 *  - witnessSystemFlaw      = 发现 / 上报 Bug（觉醒者）
 *  - addCollectiveWitness   = 集体见证 / 说出“不公逻辑”（见证者）
 *  - rewriteSystemLogic     = 提出替代逻辑（修复者）
 *  - reachCollectiveAgreement + _healSystemFlaw = 社群达成修复共识并完成“治愈”
 *
 *  本模块不直接修改其他合约参数，而是作为一个可追溯的“系统逻辑调试与觉醒记录层”。
 */
contract HerDebug is Ownable {
    using Strings for uint256;

    IHerTerritory public territory;
    ConsciousnessToken public awareToken;

    // —— 奖励参数（以 AWARE 计）——
    // 觉醒者：发现并首次上报系统缺陷
    uint256 public AWAKENING_REWARD = 10 * 10**18;
    // 见证者：为同一个缺陷提供集体见证、具体证词
    uint256 public WITNESS_REWARD   = 5  * 10**18;
    // 修复者：提出可行新逻辑、参与修复
    uint256 public REPAIR_REWARD    = 20 * 10**18;

    // multisig 地址：只负责调节奖励参数，不介入具体 Debug 流程
    address public multisig;

    event RewardsUpdated(uint256 awakening, uint256 witness, uint256 repair);
    event MultisigUpdated(address indexed previous, address indexed current);

    // —— Bug 所属的系统层 —— 对应白皮书里的“治理 / 共识 / 投票 /情绪消耗 /劳动失衡”等
    enum SystemLayer {
        EconomicLogic,        // 经济规则、价值度量的逻辑层
        GovernanceStructure,  // 治理结构、投票、共识流程
        SocialContract,       // 社会约定、角色期待
        CulturalCode,         // 文化叙事、隐性规范
        TechnicalInfra        // 纯技术 /合约层逻辑
    }

    // 意识阶段：把 debug 视作“集体觉醒过程”
    enum ConsciousnessStage {
        Witnessing,   // 仅有觉醒者发现并指出问题
        Analyzing,    // 多人见证，进入分析与解释阶段
        Rewriting,    // 有成员提出替代逻辑
        Integrating,  // （可选阶段，保留枚举位）集体内部吸收新逻辑
        Embodying     // 新逻辑被作为“系统修复结果”记录下来
    }

    /**
     * @dev 一条“系统缺陷”的链上记录——对应“这里有一行不公的逻辑”
     */
    struct SystemFlaw {
        uint256 id;
        address witness;          // 最早觉醒者
        SystemLayer layer;        // 所属系统层
        string flawDescription;   // Bug 的人类语义描述
        string currentLogic;      // 现有不公逻辑
        string desiredLogic;      // 期望替代逻辑方向（非具体修复提案）
        uint256 witnessedAt;
        ConsciousnessStage stage;
        uint256 collectiveWitness; // 已有多少不同成员见证
        uint256 repairAttempts;    // 有多少修复提案
        bool isHealed;            // 是否已进入“治愈完成”
    }

    /**
     * @dev 针对某个缺陷的“重写提案”，对应白皮书中“重写旧规则，引入新逻辑”
     */
    struct RepairProposal {
        uint256 id;
        uint256 flawId;
        address rewriter;
        string newLogic;            // 提出的新逻辑
        string metaphorExplanation; // 对于社会层意义的解释 /隐喻
        uint256 proposedAt;
        uint256 collectiveAgreement; // 有多少成员认同该修复
        bool isIntegrated;           // 是否被选为最终“治愈”方案
    }

    /**
     * @dev 见证记录：谁在何时、以怎样的证词参与了见证
     */
    struct AwakeningWitness {
        address witness;
        string testimony;
        uint256 witnessedAt;
    }

    // —— 存储区 —— //
    SystemFlaw[] public systemFlaws;
    RepairProposal[] public repairProposals;

    // flawId → 多个见证者记录
    mapping(uint256 => AwakeningWitness[]) public flawWitnesses;

    // 防止同一成员对同一 flaw 重复“见证”或重复“修复提案”
    mapping(uint256 => mapping(address => bool)) public hasWitnessed;
    mapping(uint256 => mapping(address => bool)) public hasRepaired;

    // 觉醒宣言记录（对应“发现——见证——重写——治愈”的链上文本痕迹）
    string[] public awakeningManifestos;

    // —— 事件 —— //
    event SystemFlawWitnessed(
        uint256 indexed flawId,
        address witness,
        SystemLayer layer,
        string currentLogic
    );

    event CollectiveWitnessAdded(
        uint256 indexed flawId,
        address witness,
        string testimony
    );

    event LogicRewritten(
        uint256 indexed proposalId,
        address rewriter,
        string newLogic
    );

    event SystemHealed(
        uint256 indexed flawId,
        uint256 proposalId,
        string healingManifesto
    );

    event ConsciousnessAwakened(
        address member,
        string awakeningStatement
    );

    modifier onlyMember() {
        require(territory.addressToMemberId(msg.sender) > 0, "Not a conscious member");
        _;
    }

    modifier onlyMultisig() {
        require(multisig != address(0), "Multisig not set");
        require(msg.sender == multisig, "Only multisig can call");
        _;
    }

    constructor(address _territory, address _multisig) Ownable(msg.sender) {
        require(_territory != address(0), "Territory required");
        require(_multisig != address(0), "Multisig required");

        territory = IHerTerritory(_territory);
        multisig = _multisig;

        // HerDebug 自己部署、自己拥有的“觉醒积分”代币
        awareToken = new ConsciousnessToken();

        // 系统启动时的第一条觉醒宣言
        _recordAwakeningManifesto(
            "We are no longer passive users of the system, but active writers of rules."
        );
    }

    // ---------------------------------------------------------------------
    // 管理：仅 owner 可以更换 multisig，multisig 仅能调奖励参数
    // ---------------------------------------------------------------------

    function setMultisig(address _multisig) external onlyOwner {
        require(_multisig != address(0), "Invalid multisig");
        address previous = multisig;
        multisig = _multisig;
        emit MultisigUpdated(previous, _multisig);
    }

    /**
     * @notice 由 multisig 调整奖励参数，不改变 Debug 流程本身。
     */
    function updateRewards(
        uint256 awakening,
        uint256 witness,
        uint256 repair
    ) external onlyMultisig {
        AWAKENING_REWARD = awakening;
        WITNESS_REWARD   = witness;
        REPAIR_REWARD    = repair;
        emit RewardsUpdated(awakening, witness, repair);
    }

    // ---------------------------------------------------------------------
    // ① 发现：上报系统缺陷（觉醒者）
    // ---------------------------------------------------------------------

    function witnessSystemFlaw(
        SystemLayer layer,
        string calldata flawDescription,
        string calldata currentLogic,
        string calldata desiredLogic
    ) external onlyMember returns (uint256) {
        uint256 flawId = systemFlaws.length;

        systemFlaws.push(SystemFlaw({
            id: flawId,
            witness: msg.sender,
            layer: layer,
            flawDescription: flawDescription,
            currentLogic: currentLogic,
            desiredLogic: desiredLogic,
            witnessedAt: block.timestamp,
            stage: ConsciousnessStage.Witnessing,
            collectiveWitness: 1,
            repairAttempts: 0,
            isHealed: false
        }));

        flawWitnesses[flawId].push(AwakeningWitness({
            witness: msg.sender,
            testimony: "I witness this system flaw",
            witnessedAt: block.timestamp
        }));

        hasWitnessed[flawId][msg.sender] = true;

        // 奖励觉醒者
        awareToken.mint(msg.sender, AWAKENING_REWARD);

        emit SystemFlawWitnessed(flawId, msg.sender, layer, currentLogic);

        _recordAwakeningManifesto(
            string(
                abi.encodePacked(
                    "Member ",
                    _addressToString(msg.sender),
                    " discovered unequal logic in ",
                    _layerToString(layer),
                    " layer: ",
                    currentLogic
                )
            )
        );

        return flawId;
    }

    // ---------------------------------------------------------------------
    // ② 见证：集体见证与证词追加
    // ---------------------------------------------------------------------

    function addCollectiveWitness(
        uint256 flawId,
        string calldata personalTestimony
    ) external onlyMember {
        require(flawId < systemFlaws.length, "Flaw does not exist");
        require(!hasWitnessed[flawId][msg.sender], "Already witnessed");

        SystemFlaw storage flaw = systemFlaws[flawId];
        require(!flaw.isHealed, "Flaw already healed");

        flaw.collectiveWitness++;
        hasWitnessed[flawId][msg.sender] = true;

        flawWitnesses[flawId].push(
            AwakeningWitness({
                witness: msg.sender,
                testimony: personalTestimony,
                witnessedAt: block.timestamp
            })
        );

        // 奖励见证者
        awareToken.mint(msg.sender, WITNESS_REWARD);

        emit CollectiveWitnessAdded(flawId, msg.sender, personalTestimony);

        // 见证数达到阈值时，从 Witnessing → Analyzing
        if (flaw.collectiveWitness >= 3 && flaw.stage == ConsciousnessStage.Witnessing) {
            flaw.stage = ConsciousnessStage.Analyzing;
            _recordAwakeningManifesto(
                string(
                    abi.encodePacked(
                        "Flaw #",
                        flawId.toString(),
                        " gained collective witness, entering analysis stage"
                    )
                )
            );
        }
    }

    // ---------------------------------------------------------------------
    // ③ 重写：提出修复逻辑（修复者）
    // ---------------------------------------------------------------------

    function rewriteSystemLogic(
        uint256 flawId,
        string calldata newLogic,
        string calldata metaphorExplanation
    ) external onlyMember returns (uint256) {
        require(flawId < systemFlaws.length, "Flaw does not exist");
        require(!hasRepaired[flawId][msg.sender], "Already proposed repair");

        SystemFlaw storage flaw = systemFlaws[flawId];
        require(!flaw.isHealed, "Flaw already healed");
        require(
            flaw.stage == ConsciousnessStage.Analyzing ||
            flaw.stage == ConsciousnessStage.Rewriting,
            "Not ready for rewriting"
        );

        uint256 proposalId = repairProposals.length;

        repairProposals.push(
            RepairProposal({
                id: proposalId,
                flawId: flawId,
                rewriter: msg.sender,
                newLogic: newLogic,
                metaphorExplanation: metaphorExplanation,
                proposedAt: block.timestamp,
                collectiveAgreement: 0,
                isIntegrated: false
            })
        );

        flaw.repairAttempts++;
        hasRepaired[flawId][msg.sender] = true;
        flaw.stage = ConsciousnessStage.Rewriting;

        // 奖励提出修复逻辑的成员
        awareToken.mint(msg.sender, REPAIR_REWARD);

        emit LogicRewritten(proposalId, msg.sender, newLogic);

        _recordAwakeningManifesto(
            string(
                abi.encodePacked(
                    "Member ",
                    _addressToString(msg.sender),
                    " proposed new system logic for flaw #",
                    flawId.toString()
                )
            )
        );

        return proposalId;
    }

    // ---------------------------------------------------------------------
    // ④ 共识与治愈：达成修复共识 → 标记为“系统已被治愈”
    // ---------------------------------------------------------------------

    function reachCollectiveAgreement(uint256 proposalId) external onlyMember {
        require(proposalId < repairProposals.length, "Proposal does not exist");

        RepairProposal storage proposal = repairProposals[proposalId];
        SystemFlaw storage flaw = systemFlaws[proposal.flawId];

        require(!proposal.isIntegrated, "Already integrated");
        require(!flaw.isHealed, "Flaw already healed");

        proposal.collectiveAgreement++;

        // 简单门槛：5 人以上认同此修复方案，即视为“达成修复共识”
        if (proposal.collectiveAgreement >= 5) {
            _healSystemFlaw(proposal.flawId, proposalId);
        }
    }

    function _healSystemFlaw(uint256 flawId, uint256 proposalId) internal {
        SystemFlaw storage flaw = systemFlaws[flawId];
        RepairProposal storage proposal = repairProposals[proposalId];

        flaw.isHealed = true;
        flaw.stage = ConsciousnessStage.Embodying;
        proposal.isIntegrated = true;

        string memory healingManifesto = string(
            abi.encodePacked(
                "System healing completed. ",
                "Flaw: ",
                flaw.flawDescription,
                ". ",
                "Old logic: ",
                flaw.currentLogic,
                ". ",
                "New logic: ",
                proposal.newLogic,
                ". ",
                "Social metaphor: ",
                proposal.metaphorExplanation,
                ". ",
                "Healer: ",
                _addressToString(proposal.rewriter),
                ". ",
                "Time: ",
                block.timestamp.toString()
            )
        );

        emit SystemHealed(flawId, proposalId, healingManifesto);
        _recordAwakeningManifesto(healingManifesto);

        _rewardHealingParticipants(flawId);
    }

    function _rewardHealingParticipants(uint256 flawId) internal {
        // 所有参与见证者再获得一次见证奖励
        for (uint256 i = 0; i < flawWitnesses[flawId].length; i++) {
            awareToken.mint(flawWitnesses[flawId][i].witness, WITNESS_REWARD);
        }

        // 成功被整合的修复者获得更高奖励
        for (uint256 i = 0; i < repairProposals.length; i++) {
            if (repairProposals[i].flawId == flawId && repairProposals[i].isIntegrated) {
                awareToken.mint(repairProposals[i].rewriter, REPAIR_REWARD * 2);
            }
        }
    }

    // ---------------------------------------------------------------------
    // 觉醒宣言记录 / 工具函数
    // ---------------------------------------------------------------------

    function _recordAwakeningManifesto(string memory statement) internal {
        awakeningManifestos.push(statement);
        emit ConsciousnessAwakened(msg.sender, statement);
    }

    function _addressToString(address addr) internal pure returns (string memory) {
        return Strings.toHexString(uint256(uint160(addr)), 20);
    }

    function _layerToString(SystemLayer layer) internal pure returns (string memory) {
        if (layer == SystemLayer.EconomicLogic) return "Economic Logic";
        if (layer == SystemLayer.GovernanceStructure) return "Governance Structure";
        if (layer == SystemLayer.SocialContract) return "Social Contract";
        if (layer == SystemLayer.CulturalCode) return "Cultural Code";
        return "Technical Infrastructure";
    }

    // ---------------------------------------------------------------------
    // View 辅助：给前端 / 分析使用
    // ---------------------------------------------------------------------

    function getAwakeningHistory() external view returns (string[] memory) {
        return awakeningManifestos;
    }

    function getFlawWitnesses(uint256 flawId) external view returns (AwakeningWitness[] memory) {
        return flawWitnesses[flawId];
    }

    function getConsciousnessBalance(address member) external view returns (uint256) {
        return awareToken.balanceOf(member);
    }

    function getSystemHealth() external view returns (uint256 healed, uint256 witnessing) {
        for (uint256 i = 0; i < systemFlaws.length; i++) {
            if (systemFlaws[i].isHealed) {
                healed++;
            } else {
                witnessing++;
            }
        }
    }

    function getTotalFlaws() external view returns (uint256) {
        return systemFlaws.length;
    }

    function getTotalProposals() external view returns (uint256) {
        return repairProposals.length;
    }
}
