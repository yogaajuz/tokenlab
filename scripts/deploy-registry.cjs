/**
 * Standalone deployment script for TokenRegistry and TokenFactory
 * Usage:
 *   node scripts/deploy-registry.cjs [rpcUrl] [privateKey] [ownerAddress]
 * Or with environment variables:
 *   RPC_URL=... PRIVATE_KEY=... OWNER_ADDRESS=... node scripts/deploy-registry.cjs
 */
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const TokenRegistryArtifact = require('../src/contracts/TokenRegistry.json');
const TokenFactoryArtifact = require('../src/contracts/TokenFactory.json');

async function main() {
  console.log('=== 20LAB Protocol Registry & Factory Deployment ===\n');

  const rpcUrl = process.argv[2] || process.env.RPC_URL || 'http://127.0.0.1:8545';
  const privateKey = process.argv[3] || process.env.PRIVATE_KEY;
  const ownerAddress = process.argv[4] || process.env.OWNER_ADDRESS;

  let provider;
  let signer;

  try {
    provider = new ethers.JsonRpcProvider(rpcUrl);
  } catch (err) {
    console.error('Failed to connect to RPC:', rpcUrl);
    process.exit(1);
  }

  if (privateKey) {
    signer = new ethers.Wallet(privateKey, provider);
  } else {
    // Generate a new ephemeral wallet or use default Hardhat/Anvil account
    console.log('No private key specified. Generating a dedicated deployment wallet...');
    signer = ethers.Wallet.createRandom(provider);
    console.log(`Generated Deployer Address: ${signer.address}`);
    console.log(`Private Key: ${signer.privateKey}`);
    console.log('⚠️ Please fund this address with testnet/mainnet native coins before deploying!\n');
  }

  const deployerAddress = await signer.getAddress();
  const finalOwner = ownerAddress || deployerAddress;

  console.log(`Deployer:    ${deployerAddress}`);
  console.log(`Owner Target:${finalOwner} (You will be the OWNER of the protocol)`);
  console.log(`Network RPC: ${rpcUrl}`);

  const network = await provider.getNetwork().catch(() => ({ name: 'unknown', chainId: 0n }));
  console.log(`Chain ID:    ${network.chainId}\n`);

  // Default creation fee: 0 on testnets, 0.025 ETH on mainnet
  const isTestnet = network.chainId === 11155111n || network.chainId === 84532n || network.chainId === 97n || network.chainId === 0n;
  const initialFee = isTestnet ? ethers.parseEther('0') : ethers.parseEther('0.025');

  console.log(`1. Deploying TokenRegistry (uRegistryV5 Clone)...`);
  console.log(`   Initial Creation Fee: ${ethers.formatEther(initialFee)} ETH/native coin`);

  const registryFactory = new ethers.ContractFactory(
    TokenRegistryArtifact.abi,
    TokenRegistryArtifact.bytecode,
    signer
  );

  const registry = await registryFactory.deploy(finalOwner, initialFee);
  console.log(`   Tx Hash: ${registry.deploymentTransaction().hash}`);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`   ✅ TokenRegistry deployed at: ${registryAddress}`);
  console.log(`   👑 Registry Owner set to:     ${finalOwner}`);

  console.log(`\n2. Deploying TokenFactory...`);
  const factoryContractFactory = new ethers.ContractFactory(
    TokenFactoryArtifact.abi,
    TokenFactoryArtifact.bytecode,
    signer
  );

  const factory = await factoryContractFactory.deploy(registryAddress);
  console.log(`   Tx Hash: ${factory.deploymentTransaction().hash}`);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log(`   ✅ TokenFactory deployed at:  ${factoryAddress}`);

  // Save deployed addresses
  const deployRecord = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployedAt: new Date().toISOString(),
    owner: finalOwner,
    deployer: deployerAddress,
    registry: registryAddress,
    factory: factoryAddress,
    creationFee: ethers.formatEther(initialFee)
  };

  const recordsPath = path.join(__dirname, '..', 'src', 'contracts', 'deployed-registry.json');
  fs.writeFileSync(recordsPath, JSON.stringify(deployRecord, null, 2), 'utf8');
  console.log(`\nDeployment records saved to: ${recordsPath}`);

  console.log('\n======================================================');
  console.log('🎉 DEPLOYMENT COMPLETE! YOU ARE THE PROTOCOL OWNER!');
  console.log('======================================================');
  console.log(`All deployment fees paid by users will accumulate in:`);
  console.log(`➡️  ${registryAddress}`);
  console.log(`And only YOU (${finalOwner}) can withdraw funds via withdraw().`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});
