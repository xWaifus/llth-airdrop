const { expect } = require('chai')
const { ethers } = require('hardhat')
const { getMerkleTree, getMerkleProof } = require('../merkle/index')

/**
 * account/addresses [0] admin
 * account/addresss [n+0] user
 */

describe('Airdrop', async () => {
	let llth: any
	let airdrop: any
	let accounts: any
	let root: any
	let merkle: any
	let addresses: any = []

	beforeEach(async () => {
		const LLTH = await ethers.getContractFactory('LLTH')
		const AIRDROP = await ethers.getContractFactory('Airdrop')

		llth = await LLTH.deploy()
		await llth.deployed()

		airdrop = await AIRDROP.deploy(llth.address)

		await airdrop.deployed()

		await llth.setManager(airdrop.address, true)

		addresses = [];

		accounts = await ethers.getSigners()

		for (let x = 0; x < 3; x++) {
			addresses.push(accounts[x].address)
		}

		// its ugly, i know and i dont care
		let res = getMerkleTree(addresses)
		merkle = res[0]
		root = res[1]

		await airdrop.setMerkleRoot(root)
	})

	it('ground tests', async () => {
		expect(await llth.address).not.to.be.equal(undefined)
		expect(await airdrop.address).not.to.be.equal(undefined)
		expect(await llth.getManager(airdrop.address)).to.be.equal(true)
	})

	it('happy path', async () => {
		let proof = getMerkleProof(root, addresses[1], merkle)
		await airdrop.connect(accounts[1]).claim(proof)

		let balance = await llth.balanceOf(accounts[1].address)
		expect(balance.toString()).to.be.equal((500 * 10 ** 18).toString())
	})

	it('sad path', async () => {
		let proof = getMerkleProof(root, addresses[5], merkle)
		await expect(airdrop.connect(accounts[5]).claim(proof)).to.be.revertedWith('Invalid merkle proof')

		proof = getMerkleProof(root, addresses[1], merkle)
		await airdrop.connect(accounts[1]).claim(proof)
		await expect(airdrop.connect(accounts[1]).claim(proof)).to.be.revertedWith('Tokens already claimed')

	})
})
