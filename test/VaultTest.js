const Vault = artifacts.require("Vault");

require('chai')
    .use(require('chai-as-promised'))
    .should()
require("web3")
const assert = require('assert').strict;

contract('Vault', ([owner, investor]) => {
    let vault
    beforeEach('setup contract for each test', async function () {
        vault = await Vault.new()
    })

    it('has an owner', async function () {
        const actualOwner = await vault.owner()
        const addr = actualOwner.addr
        assert.equal(addr, owner)
    })
})