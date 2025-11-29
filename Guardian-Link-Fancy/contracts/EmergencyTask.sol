// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EmergencyTask {
    // --- 状态变量 ---
    IERC20 public guardianToken; // GLT代币合约地址

    // 任务状态
    enum TaskStatus { Created, Accepted, ProofSubmitted, Verified, Paid }

    // 任务结构体
    struct Task {
        address user; // 发布任务的用户
        address acceptedBy; // 接单的响应者
        uint256 bounty; // 赏金金额
        TaskStatus status;
        string proofIPFSHash; // 响应者提交的证明文件IPFS哈希
        uint256 verificationCount; // 当前已验证的人数
        mapping(address => bool) verifiers; // 记录哪些守护者已经验证过
    }

    // 从任务ID映射到任务详情
    mapping(uint256 => Task) public tasks;
    uint256 public nextTaskId = 0; // 下一个任务的ID

    // --- 事件 --- 用于前端监听
    event TaskCreated(uint256 indexed taskId, address indexed user);
    event TaskAccepted(uint256 indexed taskId, address indexed guardian);
    event ProofSubmitted(uint256 indexed taskId, string proofIPFSHash);
    event TaskVerified(uint256 indexed taskId, address indexed verifier);

    // --- 构造函数 ---
    constructor(address _tokenAddress) {
        guardianToken = IERC20(_tokenAddress);
    }

    // --- 核心函数 ---

    // 1. 用户创建紧急任务（赏金从用户账户预扣）
    function createTask(uint256 _bounty) external {
        require(_bounty > 0, "Bounty must be positive");
        require(guardianToken.transferFrom(msg.sender, address(this), _bounty), "Transfer failed");

        uint256 taskId = nextTaskId++;
        Task storage newTask = tasks[taskId];
        newTask.user = msg.sender;
        newTask.bounty = _bounty;
        newTask.status = TaskStatus.Created;

        emit TaskCreated(taskId, msg.sender);
    }

    // 2. 响应者抢单
    function acceptTask(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.status == TaskStatus.Created, "Task not available");
        
        task.acceptedBy = msg.sender;
        task.status = TaskStatus.Accepted;

        emit TaskAccepted(_taskId, msg.sender);
    }

    // 3. 响应者提交完成证明（如图片的IPFS哈希）
    function submitProof(uint256 _taskId, string calldata _proofIPFSHash) external {
        Task storage task = tasks[_taskId];
        require(task.status == TaskStatus.Accepted, "Task not in progress");
        require(msg.sender == task.acceptedBy, "Only accepted guardian can submit proof");

        task.proofIPFSHash = _proofIPFSHash;
        task.status = TaskStatus.ProofSubmitted;

        emit ProofSubmitted(_taskId, _proofIPFSHash);
    }

    // 4. 社区守护者验证证明（简化版：任何地址都可以验证）
    function verifyProof(uint256 _taskId) external {
        Task storage task = tasks[_taskId];
        require(task.status == TaskStatus.ProofSubmitted, "Proof not submitted");
        require(!task.verifiers[msg.sender], "Already verified by this address");

        task.verifiers[msg.sender] = true;
        task.verificationCount++;

        emit TaskVerified(_taskId, msg.sender);

        // 简化逻辑：如果至少有1个人验证，就自动支付赏金
        if (task.verificationCount >= 1) {
            _payout(_taskId);
        }
    }

    // 5. 内部函数：支付赏金给响应者
    function _payout(uint256 _taskId) internal {
        Task storage task = tasks[_taskId];
        require(task.status == TaskStatus.ProofSubmitted, "Cannot payout yet");

        task.status = TaskStatus.Paid;
        require(guardianToken.transfer(task.acceptedBy, task.bounty), "Payout failed");
    }
}