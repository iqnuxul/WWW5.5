// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title HerTerritory — Identity Root Layer (Native SBT)
/// @notice
/// - 成员可 permissionless 自主加入
/// - 每位成员自动获得一枚不可转移的 SBT（tokenId = memberId）
/// - 无 owner、无 admin、无白名单、不可封禁
/// - 作为所有模块的身份验证入口
contract HerTerritory {

    // --------------------------
    //  MEMBER STRUCTURE
    // --------------------------

    struct Member {
        uint256 id;
        address wallet;
        uint256 joinTime;
        bool isActive;
    }

    // 地址 → memberId（0 = 非成员）
    mapping(address => uint256) public addressToMemberId;

    // memberId → Member
    mapping(uint256 => Member) public members;

    // tokenId → owner
    mapping(uint256 => address) private _tokenOwner;

    // owner → 持有的 tokenId（SBT 只能拥有 1 个）
    mapping(address => uint256) private _ownedToken;

    uint256 public totalMembers;

    // --------------------------
    //        EVENTS
    // --------------------------
    event MemberJoined(uint256 memberId, address wallet);

    modifier onlyMember() {
        require(isMember(msg.sender), "Not a member");
        _;
    }

    constructor() {
        // 无 owner，无管理员
    }

    // --------------------------
    //     JOIN COMMUNITY
    // --------------------------

    function joinCommunity() external {
        require(!isMember(msg.sender), "Already a member");

        totalMembers++;
        uint256 newId = totalMembers;

        members[newId] = Member({
            id: newId,
            wallet: msg.sender,
            joinTime: block.timestamp,
            isActive: true
        });

        addressToMemberId[msg.sender] = newId;

        // 铸造 SBT
        _mint(msg.sender, newId);

        emit MemberJoined(newId, msg.sender);
    }

    // --------------------------
    //       MEMBER CHECK
    // --------------------------

    function isMember(address user) public view returns (bool) {
        uint256 id = addressToMemberId[user];
        return id != 0 && members[id].isActive;
    }

    function getMember(address user)
        external
        view
        returns (uint256 id, address wallet, uint256 joinTime, bool isActive)
    {
        uint256 mid = addressToMemberId[user];
        require(mid != 0, "Not a member");
        Member memory m = members[mid];
        return (m.id, m.wallet, m.joinTime, m.isActive);
    }

    function getMemberById(uint256 memberId)
        external
        view
        returns (Member memory)
    {
        require(memberId > 0 && memberId <= totalMembers, "Invalid ID");
        return members[memberId];
    }

    // --------------------------
    //       NATIVE SBT LOGIC
    // --------------------------

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Invalid address");
        require(_tokenOwner[tokenId] == address(0), "Already minted");
        require(_ownedToken[to] == 0, "Address already owns SBT");

        _tokenOwner[tokenId] = to;
        _ownedToken[to] = tokenId;
    }

    /// @dev 获取 tokenId 的 owner
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _tokenOwner[tokenId];
        require(owner != address(0), "Invalid token");
        return owner;
    }

    // --------------------------
    //  禁止所有形式的转移与授权
    // --------------------------

    function transferFrom(address, address, uint256) public pure {
        revert("SBT: non-transferable");
    }

    function safeTransferFrom(address, address, uint256) public pure {
        revert("SBT: non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) public pure {
        revert("SBT: non-transferable");
    }

    function approve(address, uint256) public pure {
        revert("SBT: approvals disabled");
    }

    function setApprovalForAll(address, bool) public pure {
        revert("SBT: approvals disabled");
    }

    function getApproved(uint256) public pure returns (address) {
        return address(0);
    }

    function isApprovedForAll(address, address) public pure returns (bool) {
        return false;
    }
}