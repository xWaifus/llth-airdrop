import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

const getMerkleTree = (addresses: any) => {

    const leaf: any = [];

    addresses.map((e: string) => {
        leaf.push(keccak256(e));
    });

    const merkle = new MerkleTree(leaf, keccak256, { sortPairs: true });

    return [merkle, hexToBytes(merkle.getRoot().toString("hex"))];
}

const getMerkleProof = (root: Buffer, address: string, merkle: any) => {
    const leaf = keccak256(address);
    const proof = merkle.getHexProof(leaf);

    return proof;
}

function hexToBytes(hex: any) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

export { getMerkleTree, getMerkleProof };