import { BigNumber } from "ethers";

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getMerkleTree, getMerkleProof } = require("../merkle/index");

describe("Airdrop", async () => {
	let llth: any;
	let airdrop: any;
	let accounts: any;
	let root: any;
	let merkle: any;

	beforeEach(async () => {
		const LLTH = await ethers.getContractFactory("LLTH");
		const AIRDROP = await ethers.getContractFactory("Airdrop");

		llth = await LLTH.deploy();
		await llth.deployed();

		airdrop = await AIRDROP.deploy(llth.address);

		await airdrop.deployed();

		await llth.setManager(airdrop.address, true);

		accounts = await ethers.getSigners();

		let addresses: any = [];

		accounts.forEach((e: any) => {
			addresses.push(e.address);
		})

		// its ugly, i know and i dont care
		let res = getMerkleTree(addresses);
		merkle = res[0];
		root = res[1];

		await airdrop.setMerkleRoot(root);
	});

	it("ground tests", async () => {
		expect(await llth.address).not.to.be.equal(undefined);
		expect(await airdrop.address).not.to.be.equal(undefined);
		expect(await llth.getManager(airdrop.address)).to.be.equal(true);
	});

	it("should mint", async () => {
		let proof = getMerkleProof(root, accounts[1].address, merkle);
		await airdrop.connect(accounts[1]).claim(proof);

		let balance = await llth.balanceOf(accounts[1].address);
		expect(balance.toString()).to.be.equal((500 * (10 ** 18)).toString());
	})
});
