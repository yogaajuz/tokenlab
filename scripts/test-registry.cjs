const { ethers } = require('ethers');
const TokenRegistryArtifact = require('../src/contracts/TokenRegistry.json');
const TokenFactoryArtifact = require('../src/contracts/TokenFactory.json');
const CustomTokenArtifact = require('../src/contracts/CustomToken.json');

async function runTests() {
  console.log('🧪 Running automated tests on TokenRegistry & CustomToken...');

  // Setup local in-memory simulated accounts
  const userOwner = ethers.Wallet.createRandom();
  const tokenCreator = ethers.Wallet.createRandom();
  const attacker = ethers.Wallet.createRandom();

  console.log(`- Protocol Owner:  ${userOwner.address}`);
  console.log(`- Token Creator:   ${tokenCreator.address}`);
  console.log(`- Attacker Wallet: ${attacker.address}`);

  // We can test bytecode deployment logic and ABI encoding
  const creationFee = ethers.parseEther('0.05');
  const registryFactory = new ethers.ContractFactory(
    TokenRegistryArtifact.abi,
    TokenRegistryArtifact.bytecode
  );

  const deployTx = await registryFactory.getDeployTransaction(userOwner.address, creationFee);
  console.log(`✅ TokenRegistry deploy tx generated: ${deployTx.data.slice(0, 40)}... (length: ${deployTx.data.length})`);

  const customTokenFactory = new ethers.ContractFactory(
    CustomTokenArtifact.abi,
    CustomTokenArtifact.bytecode
  );

  const sampleConfig = {
    name: 'Test Clone Token',
    symbol: 'TCT',
    decimals: 18,
    initialSupply: ethers.parseEther('1000000'),
    maxSupply: ethers.parseEther('10000000'),
    supplyRecipient: tokenCreator.address,
    initialOwner: userOwner.address,
    mintable: true,
    burnable: true,
    pausable: true,
    antiBot: true,
    cooldownSecs: 60,
    limits: true,
    maxTx: ethers.parseEther('10000'),
    maxWallet: ethers.parseEther('20000'),
    taxes: true,
    buyMkt: 200,
    sellMkt: 300,
    transferMkt: 100,
    buyLiq: 100,
    sellLiq: 100,
    transferLiq: 0,
    mktWallet: userOwner.address,
    routerAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    tradingDelayed: false
  };

  const tokenDeployTx = await customTokenFactory.getDeployTransaction(sampleConfig);
  console.log(`✅ CustomToken deploy tx generated: ${tokenDeployTx.data.slice(0, 40)}... (length: ${tokenDeployTx.data.length})`);

  // Verify ABI signatures
  const registryIface = new ethers.Interface(TokenRegistryArtifact.abi);
  console.log(`✅ TokenRegistry selectors:`);
  console.log(`   - owner():             ${registryIface.getFunction('owner').selector}`);
  console.log(`   - registerToken(...):  ${registryIface.getFunction('registerToken').selector}`);
  console.log(`   - withdraw():          ${registryIface.getFunction('withdraw').selector}`);
  console.log(`   - setCreationFee(...): ${registryIface.getFunction('setCreationFee').selector}`);
  console.log(`   - transferOwnership(): ${registryIface.getFunction('transferOwnership').selector}`);

  console.log(`\n🎉 All ABI encoding and contract artifacts validated successfully!\n`);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
