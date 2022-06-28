const {
  chainNameById,
  chainIdByName,
  log
} = require("../js-helpers/deploy");
require('dotenv').config()
const config = require('../config/config.json')
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

module.exports = async (hre) => {
  const { ethers } = hre;
  const network = await hre.network;
  const signers = await ethers.getSigners()
  const chainId = chainIdByName(network.name);
  const feeTo = "0x6f6Be3C5d4D0f738F8AEe07757e81eD21D973164"

  log('Contract Deployment');
  log('Network name:', chainNameById(chainId));
  log('Network id:', chainId);
  log('Deployer:', signers[0].address);

  log('Deploying...');
  if (config[chainId].aavev2.LendingPoolAddressProvider === ZERO_ADDRESS) {
    console.log('Error: LendingPoolAddressProvider = ', ZERO_ADDRESS)
    return
  } else {
    const AaveV2ERC3156 = await ethers.getContractFactory("AaveV2ERC3156")
    const AaveV2ERC3156Instance = await AaveV2ERC3156.deploy(config[chainId].aavev2.LendingPoolAddressProvider, feeTo);
    let lender = await AaveV2ERC3156Instance.deployed();
    log('Deployed to: ', lender.address);
  }
};

module.exports.tags = ['aavev2']