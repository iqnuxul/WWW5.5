// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IHerTerritory {
    function addressToMemberId(address) external view returns (uint256);

    function members(uint256) external view returns (
        uint256 id,
        address wallet,
        uint256 joinTime,
        uint256 reputation, // 在本合约中不会用于加权，仅用于保持兼容
        bool isActive
    );
}

contract HerCommons {
    IHerTerritory public territory;

    /// @notice 提案类型：目前实现 Funding / Debug，其他类型可后续扩展
    enum ProposalType { Funding, RuleChange, Debug, Emergency }

    /// @notice 提案状态：
    /// Listening        倾听期
    /// ConsensusBlocked 保留枚举值以兼容前端/叙事，但当前版本不会自动进入该状态
    /// Voting           投票期
    /// Executed         已执行（通过）
    /// Rejected         已否决或未达门槛
    enum ProposalStatus { Listening, ConsensusBlocked, Voting, Executed, Rejected }

    struct Proposal {
        uint256 id;
        address proposer;
        ProposalType proposalType;
        string title;
        string description;

        // Funding 提案用
        uint256 amount;
        address recipient;

        // 阶段时间
        uint256 listeningEnd;
        uint256 votingEnd;

        // 投票数据（1 人 = 1 票）
        uint256 forVotes;
        uint256 againstVotes;
        uint256 totalVotes;

        bool executed;  // 是否已经最终处理（无论通过 / 否决）

        // Debug / 流程提案用
        string debugTarget;

        // 共识相关
        ProposalStatus status;
        uint256 coreValueConcerns; // 被标记为"触及核心价值"的 concern 数量
    }

    Proposal[] private proposals;

    /// @notice 记录：某成员是否对某个提案在 Listening 期做过回应
    mapping(uint256 => mapping(address => bool)) public hasResponded;

    /// @notice 记录：某成员是否对某个提案在 Voting 期投过票
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    /// @notice 记录：某成员是否已经对某个提案标记过「核心价值冲突」
    mapping(uint256 => mapping(address => bool)) public hasRaisedConcern;

    // ---------------- Events ----------------

    event ProposalCreated(
        uint256 proposalId,
        address proposer,
        ProposalType proposalType,
        string title
    );

    /// @param raisesCoreConcern 表示该回应是否声明 "此提案触及核心价值"
    event RespondedToProposal(
        uint256 proposalId,
        address responder,
        string comment,
        bool raisesCoreConcern
    );

    event VotingOpened(uint256 proposalId, uint256 votingEnd);

    event Voted(
        uint256 proposalId,
        address voter,
        bool support
    );

    event ProposalExecuted(
        uint256 proposalId,
        ProposalStatus finalStatus
    );

    event FundsTransferred(address recipient, uint256 amount);

    /// @dev 当前版本不再自动根据 concern 数量进入该状态，但保留事件做兼容/未来拓展
    event ConsensusBlocked(
        uint256 proposalId,
        uint256 concernCount
    );

    modifier onlyMember() {
        require(territory.addressToMemberId(msg.sender) > 0, "Not a member");
        _;
    }

    constructor(address _territory) {
        require(_territory != address(0), "Territory address required");
        territory = IHerTerritory(_territory);
    }

    // ------------------------------------------------------------------------
    //                            提案创建
    // ------------------------------------------------------------------------

    /// @notice 创建资金提案（Funding）
    /// @param _listeningDays 倾听期天数（>0）
    /// @param _votingDays    投票期天数（>0）
    function createFundingProposal(
        string memory _title,
        string memory _description,
        uint256 _amount,
        address _recipient,
        uint256 _listeningDays,
        uint256 _votingDays
    ) external onlyMember {
        require(_listeningDays > 0, "Listening days must be > 0");
        require(_votingDays > 0, "Voting days must be > 0");

        _createProposal(
            ProposalType.Funding,
            _title,
            _description,
            _amount,
            _recipient,
            "",
            _listeningDays,
            _votingDays
        );
    }

    /// @notice 创建调试 / 规则检查类提案（Debug）
    function createDebugProposal(
        string memory _title,
        string memory _description,
        string memory _debugTarget,
        uint256 _listeningDays,
        uint256 _votingDays
    ) external onlyMember {
        require(_listeningDays > 0, "Listening days must be > 0");
        require(_votingDays > 0, "Voting days must be > 0");

        _createProposal(
            ProposalType.Debug,
            _title,
            _description,
            0,
            address(0),
            _debugTarget,
            _listeningDays,
            _votingDays
        );
    }

    function _createProposal(
        ProposalType _type,
        string memory _title,
        string memory _description,
        uint256 _amount,
        address _recipient,
        string memory _debugTarget,
        uint256 _listeningDays,
        uint256 _votingDays
    ) internal {
        uint256 id = proposals.length;

        Proposal memory p = Proposal({
            id: id,
            proposer: msg.sender,
            proposalType: _type,
            title: _title,
            description: _description,
            amount: _amount,
            recipient: _recipient,
            listeningEnd: block.timestamp + _listeningDays * 1 days,
            votingEnd: block.timestamp + (_listeningDays + _votingDays) * 1 days,
            forVotes: 0,
            againstVotes: 0,
            totalVotes: 0,
            executed: false,
            debugTarget: _debugTarget,
            status: ProposalStatus.Listening,
            coreValueConcerns: 0
        });

        proposals.push(p);
        emit ProposalCreated(id, msg.sender, _type, _title);
    }

    // ------------------------------------------------------------------------
    //                           倾听期（Listening）
    // ------------------------------------------------------------------------

    /// @notice 倾听期回应。只有回应过的成员，后面才能参与投票。
    /// @param _raisesCoreConcern 若为 true，表示该回应声明此提案触及核心价值
    function respondToProposal(
        uint256 _proposalId,
        string calldata _comment,
        bool _raisesCoreConcern
    ) external onlyMember {
        require(_proposalId < proposals.length, "Proposal does not exist");
        Proposal storage prop = proposals[_proposalId];

        require(prop.status == ProposalStatus.Listening, "Not in listening");
        require(block.timestamp < prop.listeningEnd, "Listening ended");
        require(!hasResponded[_proposalId][msg.sender], "Already responded");

        hasResponded[_proposalId][msg.sender] = true;

        // 如被标记为"触及核心价值"，计入 coreValueConcerns（仅作为记录，不再自动阻断）
        if (_raisesCoreConcern && !hasRaisedConcern[_proposalId][msg.sender]) {
            hasRaisedConcern[_proposalId][msg.sender] = true;
            prop.coreValueConcerns += 1;
        }

        emit RespondedToProposal(_proposalId, msg.sender, _comment, _raisesCoreConcern);
    }

    // ------------------------------------------------------------------------
    //                           共识检查 → 投票期
    // ------------------------------------------------------------------------

    /// @notice 倾听期结束后，任何成员都可以调用本函数：
    /// - 当前版本中，不再根据 concern 数量自动阻断提案
    /// - 倾听完成后，提案进入 Voting 状态，开启投票期
    /// - coreValueConcerns 作为叙事与决策参考数据，保留在链上
    function openVoting(uint256 _proposalId) external onlyMember {
        require(_proposalId < proposals.length, "Proposal does not exist");
        Proposal storage prop = proposals[_proposalId];

        require(prop.status == ProposalStatus.Listening, "Not in listening");
        require(block.timestamp >= prop.listeningEnd, "Listening not finished");
        require(block.timestamp < prop.votingEnd, "Voting window already passed");

        // 当前版本：不再根据 coreValueConcerns 自动进入 ConsensusBlocked，
        // 由成员在投票与后续治理实践中进行再讨论和再设计。
        prop.status = ProposalStatus.Voting;
        emit VotingOpened(_proposalId, prop.votingEnd);
    }

    // ------------------------------------------------------------------------
    //                               投票期
    // ------------------------------------------------------------------------

    /// @notice 投票：每个成员一票，必须在 Listening 期间回应过才能投票
    function vote(uint256 _proposalId, bool support) external onlyMember {
        require(_proposalId < proposals.length, "Proposal does not exist");
        Proposal storage prop = proposals[_proposalId];

        require(prop.status == ProposalStatus.Voting, "Not in voting");
        require(block.timestamp >= prop.listeningEnd, "Listening ongoing");
        require(block.timestamp < prop.votingEnd, "Voting ended");
        require(hasResponded[_proposalId][msg.sender], "Must respond first");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");

        hasVoted[_proposalId][msg.sender] = true;

        if (support) {
            prop.forVotes += 1;
        } else {
            prop.againstVotes += 1;
        }
        prop.totalVotes += 1;

        emit Voted(_proposalId, msg.sender, support);
    }

    // ------------------------------------------------------------------------
    //                           执行 / 否决 逻辑
    // ------------------------------------------------------------------------

    /// @notice 执行提案：
    /// - 必须在 votingEnd 之后
    /// - 若无人参与投票，则视为尚未准备好形成集体决定（Rejected）
    /// - 否则：简单多数（forVotes > againstVotes）通过，否则否决
    /// - Funding 提案通过时，从合约余额给 recipient 转账
    function executeProposal(uint256 _proposalId) external onlyMember {
        require(_proposalId < proposals.length, "Proposal does not exist");
        Proposal storage prop = proposals[_proposalId];

        require(!prop.executed, "Already finalized");
        require(block.timestamp >= prop.votingEnd, "Voting not finished");

        // 若未曾进入 Voting（例如未来版本通过其他逻辑阻断），不允许执行
        require(prop.status == ProposalStatus.Voting, "Not a voting proposal");

        prop.executed = true;

        // 若完全没有投票参与，则视为暂不形成集体决定
        if (prop.totalVotes == 0) {
            prop.status = ProposalStatus.Rejected;
            emit ProposalExecuted(_proposalId, ProposalStatus.Rejected);
            return;
        }

        // 简单多数：赞成多于反对则通过，否则否决
        if (prop.forVotes > prop.againstVotes) {
            prop.status = ProposalStatus.Executed;

            if (
                prop.proposalType == ProposalType.Funding &&
                prop.amount > 0 &&
                prop.recipient != address(0) &&
                address(this).balance >= prop.amount
            ) {
                payable(prop.recipient).transfer(prop.amount);
                emit FundsTransferred(prop.recipient, prop.amount);
            }

            emit ProposalExecuted(_proposalId, ProposalStatus.Executed);
        } else {
            prop.status = ProposalStatus.Rejected;
            emit ProposalExecuted(_proposalId, ProposalStatus.Rejected);
        }
    }

    // ------------------------------------------------------------------------
    //                               View 辅助
    // ------------------------------------------------------------------------

    /// @notice 获取当前仍在 Listening / Voting 窗口内的提案列表
    function getActiveProposals() external view returns (uint256[] memory) {
        uint256 count = 0;

        for (uint256 i = 0; i < proposals.length; i++) {
            Proposal storage p = proposals[i];

            bool inTime = block.timestamp < p.votingEnd;
            bool inStatus = (p.status == ProposalStatus.Listening || p.status == ProposalStatus.Voting);

            if (!p.executed && inTime && inStatus) {
                count++;
            }
        }

        uint256[] memory active = new uint256[](count);
        uint256 idx = 0;

        for (uint256 i = 0; i < proposals.length; i++) {
            Proposal storage p = proposals[i];

            bool inTime = block.timestamp < p.votingEnd;
            bool inStatus = (p.status == ProposalStatus.Listening || p.status == ProposalStatus.Voting);

            if (!p.executed && inTime && inStatus) {
                active[idx++] = i;
            }
        }

        return active;
    }

    /// @notice 获取提案基本信息
    function getProposalBasic(uint256 _proposalId)
        external
        view
        returns (
            uint256 id,
            address proposer,
            ProposalType proposalType,
            string memory title,
            uint256 listeningEnd,
            uint256 votingEnd,
            ProposalStatus status
        )
    {
        require(_proposalId < proposals.length, "Proposal does not exist");
        Proposal storage p = proposals[_proposalId];

        return (
            p.id,
            p.proposer,
            p.proposalType,
            p.title,
            p.listeningEnd,
            p.votingEnd,
            p.status
        );
    }

    /// @notice 获取提案详细信息
    function getProposalDetail(uint256 _proposalId)
        external
        view
        returns (
            string memory description,
            uint256 amount,
            address recipient,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 totalVotes,
            uint256 coreValueConcerns,
            string memory debugTarget
        )
    {
        require(_proposalId < proposals.length, "Proposal does not exist");
        Proposal storage p = proposals[_proposalId];

        return (
            p.description,
            p.amount,
            p.recipient,
            p.forVotes,
            p.againstVotes,
            p.totalVotes,
            p.coreValueConcerns,
            p.debugTarget
        );
    }

    function getTotalProposals() external view returns (uint256) {
        return proposals.length;
    }

    function getVotingStatus(uint256 _proposalId)
        external
        view
        returns (
            uint256 forVotes,
            uint256 againstVotes,
            uint256 totalVotes
        )
    {
        require(_proposalId < proposals.length, "Proposal does not exist");
        Proposal storage p = proposals[_proposalId];
        return (p.forVotes, p.againstVotes, p.totalVotes);
    }

    // ------------------------------------------------------------------------
    //                           Treasury 接收资金
    // ------------------------------------------------------------------------

    /// @notice 合约作为社区公共金库，接收 ETH
    receive() external payable {}
}
