const { expect } = require('chai');
const { ethers } = require('hardhat');
const { BigNumber } = require('ethers');

describe('AaveERC3156', () => {
  let user;
  let weth, dai, aWeth, aDai, lendingPool, lendingPoolAddressProvider, lender;
  let borrower;
  const aaveBal = BigNumber.from(100000);

  beforeEach(async () => {
    [_, user] = await ethers.getSigners();

    const AToken = await ethers.getContractFactory('ATokenMock');
    const MockToken = await ethers.getContractFactory('MockToken');
    const LendingPoolAddressesProvider = await ethers.getContractFactory(
      'LendingPoolAddressesProviderMock',
    );
    const LendingPool = await ethers.getContractFactory('LendingPoolMock');
    const AaveERC3156 = await ethers.getContractFactory('AaveERC3156');
    const FlashBorrower = await ethers.getContractFactory('FlashBorrower');

    weth = await MockToken.deploy('WETH', 'WETH');
    dai = await MockToken.deploy('DAI', 'DAI');
    aWeth = await AToken.deploy(weth.address, 'AToken1', 'ATST1');
    aDai = await AToken.deploy(dai.address, 'Atoken2', 'ATST2');
    lendingPool = await LendingPool.deploy();
    await lendingPool.addReserve(aWeth.address);
    await lendingPool.addReserve(aDai.address);
    lendingPoolAddressProvider = await LendingPoolAddressesProvider.deploy(lendingPool.address);
    lender = await AaveERC3156.deploy(lendingPoolAddressProvider.address);

    borrower = await FlashBorrower.deploy();

    await weth.mint(aWeth.address, aaveBal);
    await dai.mint(aDai.address, aaveBal);
  });

  it('flash supply', async function () {
    expect(await lender.maxFlashLoan(weth.address)).to.equal(aaveBal);
    expect(await lender.maxFlashLoan(dai.address)).to.equal(aaveBal);
    expect(await lender.maxFlashLoan(lender.address)).to.equal('0');
  });

  it('flash fee', async function () {
    expect(await lender.flashFee(weth.address, aaveBal)).to.equal(aaveBal.mul(9).div(10000));
    expect(await lender.flashFee(dai.address, aaveBal)).to.equal(aaveBal.mul(9).div(10000));
    await expect(lender.flashFee(lender.address, aaveBal)).to.revertedWith('Unsupported currency');
  });

  it('weth flash loan', async () => {
    const fee = await lender.flashFee(weth.address, aaveBal);

    await weth.connect(user).mint(borrower.address, fee);
    await borrower.connect(user).flashBorrow(lender.address, weth.address, aaveBal);

    const balanceAfter = await weth.balanceOf(await user.getAddress());
    expect(balanceAfter).to.equal(BigNumber.from('0'));
    const flashBalance = await borrower.flashBalance();
    expect(flashBalance).to.equal(aaveBal.add(fee));
    const flashToken = await borrower.flashToken();
    expect(flashToken).to.equal(weth.address);
    const flashAmount = await borrower.flashAmount();
    expect(flashAmount).to.equal(aaveBal);
    const flashFee = await borrower.flashFee();
    expect(flashFee).to.equal(fee);
    const flashSender = await borrower.flashSender();
    expect(flashSender).to.equal(borrower.address);
  });

  it('dai flash loan', async () => {
    const fee = await lender.flashFee(dai.address, aaveBal);

    await dai.connect(user).mint(borrower.address, fee);
    await borrower.connect(user).flashBorrow(lender.address, dai.address, aaveBal);

    const balanceAfter = await dai.balanceOf(await user.getAddress());
    expect(balanceAfter).to.equal(BigNumber.from('0'));
    const flashBalance = await borrower.flashBalance();
    expect(flashBalance).to.equal(aaveBal.add(fee));
    const flashToken = await borrower.flashToken();
    expect(flashToken).to.equal(dai.address);
    const flashAmount = await borrower.flashAmount();
    expect(flashAmount).to.equal(aaveBal);
    const flashFee = await borrower.flashFee();
    expect(flashFee).to.equal(fee);
    const flashSender = await borrower.flashSender();
    expect(flashSender).to.equal(borrower.address);
  });
});
