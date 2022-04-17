//SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./interfaces/ILLTH.sol";

contract Airdrop is Ownable {
    address public preBurnAddress;
    bytes32 public merkleRoot;
    ILLTH public llth;

    mapping (address => bool) public claimed;

    constructor(ILLTH _llth) {
        llth = _llth;
    }

    function claim(bytes32[] calldata _merkleProof) public {
        require(claimed[msg.sender] == false, "Tokens already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(_merkleProof, merkleRoot, leaf),
            "Invalid merkle proof"
        );

        claimed[msg.sender] = true;

        llth.mint(msg.sender, 500 * (10**18));
    }

    function setMerkleRoot(bytes32 root) public onlyOwner {
        merkleRoot = root;
    }

    function setLlth(ILLTH _llth) public onlyOwner {
        llth = _llth;
    }

    function setPreBurnAddress(address addr) public onlyOwner {
        preBurnAddress = addr;
    }
}