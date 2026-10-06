const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractsDir = path.join(__dirname, '..', 'contracts');
const outDir = path.join(__dirname, '..', 'src', 'contracts');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sources = {
  'TokenRegistry.sol': {
    content: fs.readFileSync(path.join(contractsDir, 'TokenRegistry.sol'), 'utf8')
  },
  'CustomToken.sol': {
    content: fs.readFileSync(path.join(contractsDir, 'CustomToken.sol'), 'utf8')
  },
  'TokenFactory.sol': {
    content: fs.readFileSync(path.join(contractsDir, 'TokenFactory.sol'), 'utf8')
  }
};

const input = {
  language: 'Solidity',
  sources: sources,
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object']
      }
    }
  }
};

console.log('Compiling contracts with solc...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

let hasErrors = false;
if (output.errors) {
  for (const err of output.errors) {
    if (err.severity === 'error') {
      hasErrors = true;
      console.error(err.formattedMessage);
    } else {
      console.warn(err.formattedMessage);
    }
  }
}

if (hasErrors) {
  console.error('Compilation failed with errors.');
  process.exit(1);
}

const compiledData = {};

for (const [file, contractObj] of Object.entries(output.contracts)) {
  for (const [name, data] of Object.entries(contractObj)) {
    const artifact = {
      contractName: name,
      sourceName: file,
      abi: data.abi,
      bytecode: '0x' + data.evm.bytecode.object
    };
    compiledData[name] = artifact;
    const dest = path.join(outDir, `${name}.json`);
    fs.writeFileSync(dest, JSON.stringify(artifact, null, 2), 'utf8');
    console.log(`Saved artifact: ${name} -> ${dest} (Bytecode size: ${data.evm.bytecode.object.length / 2} bytes)`);
  }
}

// Write bundled export file
const indexContent = `// Auto-generated contract artifacts
${Object.keys(compiledData).map(k => `import ${k}Artifact from './${k}.json';`).join('\n')}

export {
${Object.keys(compiledData).map(k => `  ${k}Artifact,`).join('\n')}
};
`;

fs.writeFileSync(path.join(outDir, 'index.js'), indexContent, 'utf8');
console.log('Successfully bundled artifacts to src/contracts/index.js');
