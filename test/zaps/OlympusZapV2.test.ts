/* eslint-disable node/no-missing-import */
import { network, ethers } from "hardhat";
import { constants, utils } from "ethers";

import { solidity } from "ethereum-waffle";
import chai from "chai";

import address from "../../libs/constants/address";
import { getSwapQuote } from "../../libs/quote/swap/swap";

import { getBalance } from "../../libs/token/token.helper";
import { exchangeAndApprove, exchange } from "../../libs/exchange/exchange.helper";

import { OlympusV2ZapIn, IBondDepoV2 } from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import BondId from "../../libs/constants/bondId";

chai.use(solidity);
const { expect } = chai;

const OlympusZapArtifact = "Olympus_V2_Zap_In";

describe("OlympusDAO Zap", () => {
  let ohmZap: OlympusV2ZapIn;

  let deployer: SignerWithAddress;
  let user: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let OlympusDAO: SignerWithAddress;

  const { ETH, DAI, OHM, sOHM, gOHM, SPELL, ALCX, FRAX, UST } = address.tokens;

  before(async () => {
    [deployer, user, OlympusDAO, user2, user3] = await ethers.getSigners();

    ohmZap = await ethers.getContractFactory(OlympusZapArtifact, deployer).then(async factory => {
      return (await factory.deploy(
        address.ohm.DEPO_V2,
        address.ohm.OlympusStaking,
        address.tokens.OHM,
        address.tokens.sOHM,
        address.tokens.gOHM,
      )) as OlympusV2ZapIn;
    });

    await ohmZap.transferOwnership(OlympusDAO.address);
  });

  describe("ZapStake", () => {
    context("to sOHM", () => {
      it("should ZapIn to sOHM using ETH", async () => {
        const amountIn = utils.parseEther("1");
        const fromToken = ETH;
        const toToken = sOHM;

        const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);
        const initialBalance = await getBalance(toToken, user.address);

        await ohmZap
          .connect(user)
          .ZapStake(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero, {
            value: amountIn,
          });
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapIn to sOHM using DAI", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = DAI;
        const toToken = sOHM;

        const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ohmZap.address);
        const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ohmZap
          .connect(user)
          .ZapStake(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapIn to sOHM using OHM", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = OHM;
        const toToken = sOHM;

        const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ohmZap.address);
        const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ohmZap
          .connect(user)
          .ZapStake(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should Not allow ZapIn if swap Targets not approved", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = ETH;
        const toToken = sOHM;

        const { to, data } = await getSwapQuote(fromToken, OHM, fromETH);

        await expect(
          ohmZap
            .connect(user2)
            .ZapStake(
              fromToken,
              fromETH,
              toToken,
              1,
              constants.AddressZero,
              data,
              constants.AddressZero,
              { value: fromETH },
            ),
        ).to.be.revertedWith("Target not Authorized");
      });
      it("should revert if slippage is exceeded", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = OHM;
        const toToken = sOHM;

        const amountIn = await exchangeAndApprove(user2, ETH, fromToken, fromETH, ohmZap.address);
        const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

        await expect(
          ohmZap
            .connect(user2)
            .ZapStake(
              fromToken,
              amountIn,
              toToken,
              constants.MaxUint256,
              to,
              data,
              constants.AddressZero,
            ),
        ).to.be.revertedWith("High Slippage");
      });
    });

    context("to gOHM", () => {
      it("should ZapIn to gOHM using ETH", async () => {
        const amountIn = utils.parseEther("1");
        const fromToken = ETH;
        const toToken = gOHM;

        const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ohmZap
          .connect(user)
          .ZapStake(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero, {
            value: amountIn,
          });
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapIn to gOHM using DAI", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = DAI;
        const toToken = gOHM;

        const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ohmZap.address);
        const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ohmZap
          .connect(user)
          .ZapStake(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapIn to gOHM using OHM", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = OHM;
        const toToken = gOHM;

        const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ohmZap.address);
        const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ohmZap
          .connect(user)
          .ZapStake(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });
    });
  });

  describe("ZapBond", () => {
    let depository: IBondDepoV2;
    context("Tokens", () => {
      before(async () => {
        depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepoV2.sol:IBondDepoV2",
          address.ohm.DEPO_V2,
        )) as IBondDepoV2;
      });
      it("Should create bonds with DAI principal using ETH", async () => {
        const fromToken = ETH;
        const toToken = DAI;

        const bondId = BondId.DAI;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = utils.parseEther("5");

        // getZapInQuote returns an encoded sushiswap Zap in order to get the OHM-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(bondId);

        await ohmZap
          .connect(user)
          .ZapBond(
            fromToken,
            amountIn,
            toToken,
            to,
            data,
            constants.AddressZero,
            maxPrice,
            bondId,
            {
              value: amountIn,
            },
          );

        const vesting = (await depository.indexesFor(user.address)).length;

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with DAI principal using SPELL", async () => {
        const fromToken = SPELL;
        const toToken = DAI;

        const bondId = BondId.DAI;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = await exchangeAndApprove(
          user,
          ETH,
          fromToken,
          utils.parseEther("5"),
          ohmZap.address,
        );

        // getZapInQuote returns an encoded sushiswap Zap in order to get the OHM-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(bondId);

        await ohmZap
          .connect(user)
          .ZapBond(fromToken, amountIn, toToken, to, data, constants.AddressZero, maxPrice, bondId);

        const vesting = (await depository.indexesFor(user.address)).length;

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with FRAX principal using ETH", async () => {
        const fromToken = ETH;
        const toToken = FRAX;

        const bondId = BondId.FRAX;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = utils.parseEther("5");

        // getZapInQuote returns an encoded sushiswap Zap in order to get the OHM-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(bondId);

        await ohmZap
          .connect(user)
          .ZapBond(
            fromToken,
            amountIn,
            toToken,
            to,
            data,
            constants.AddressZero,
            maxPrice,
            bondId,
            { value: amountIn },
          );

        const vesting = (await depository.indexesFor(user.address)).length;

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with FRAX principal using SPELL", async () => {
        const fromToken = SPELL;
        const toToken = FRAX;

        const bondId = BondId.FRAX;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = await exchangeAndApprove(
          user,
          ETH,
          fromToken,
          utils.parseEther("5"),
          ohmZap.address,
        );

        // getZapInQuote returns an encoded sushiswap Zap in order to get the OHM-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(bondId);

        await ohmZap
          .connect(user)
          .ZapBond(fromToken, amountIn, toToken, to, data, constants.AddressZero, maxPrice, bondId);

        const vesting = (await depository.indexesFor(user.address)).length;

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with UST principal using ETH", async () => {
        const fromToken = ETH;
        const toToken = UST;

        const bondId = BondId.UST;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = utils.parseEther("5");

        // getZapInQuote returns an encoded sushiswap Zap in order to get the OHM-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(bondId);

        await ohmZap
          .connect(user)
          .ZapBond(
            fromToken,
            amountIn,
            toToken,
            to,
            data,
            constants.AddressZero,
            maxPrice,
            bondId,
            { value: amountIn },
          );

        const vesting = (await depository.indexesFor(user.address)).length;

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with UST principal using DAI", async () => {
        const fromToken = DAI;
        const toToken = UST;

        const bondId = BondId.UST;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = await exchangeAndApprove(
          user,
          ETH,
          fromToken,
          utils.parseEther("1"),
          ohmZap.address,
        );

        // getZapInQuote returns an encoded sushiswap Zap in order to get the OHM-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(bondId);

        await ohmZap
          .connect(user)
          .ZapBond(fromToken, amountIn, toToken, to, data, constants.AddressZero, maxPrice, bondId);

        const vesting = (await depository.indexesFor(user.address)).length;

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should not allow to create bonds if swap Target not approved", async () => {
        const fromToken = SPELL;
        const toToken = FRAX;

        const bondId = BondId.FRAX;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = await exchangeAndApprove(
          user3,
          ETH,
          fromToken,
          utils.parseEther("5"),
          ohmZap.address,
        );

        // getZapInQuote returns an encoded sushiswap Zap in order to get the OHM-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const maxPrice = await depository.marketPrice(bondId);

        await expect(
          ohmZap
            .connect(user3)
            .ZapBond(
              fromToken,
              amountIn,
              toToken,
              constants.AddressZero,
              data,
              constants.AddressZero,
              maxPrice,
              bondId,
            ),
        ).to.be.revertedWith("Target not Authorized");
      });
      it("should revert if slippage is exceeded", async () => {
        const fromToken = SPELL;
        const toToken = FRAX;

        const bondId = BondId.FRAX;

        // Convert from Eth to the token that will be used as deposit for the bond (fromTOken)
        // This is NOT needed if ETH  is the fromToken
        const amountIn = await exchangeAndApprove(
          user3,
          ETH,
          fromToken,
          utils.parseEther("5"),
          ohmZap.address,
        );

        // getZapInQuote returns an encoded sushiswap Zap in order to get the OHM-DAI LP.
        // This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const maxPrice = 0;

        await expect(
          ohmZap
            .connect(user3)
            .ZapBond(
              fromToken,
              amountIn,
              toToken,
              to,
              data,
              constants.AddressZero,
              maxPrice,
              bondId,
            ),
        ).to.be.revertedWith("Depository: more than max price");
      });
    });
  });

  describe("Security", () => {
    context("Pausable", () => {
      before(async () => {
        await ohmZap.connect(OlympusDAO).toggleContractActive();
      });
      after(async () => {
        await ohmZap.connect(OlympusDAO).toggleContractActive();
      });
      it("Should pause ZapStake", async () => {
        const amountIn = utils.parseEther("5");
        const fromToken = ETH;
        const toToken = UST;

        await expect(
          ohmZap
            .connect(user)
            .ZapStake(
              fromToken,
              amountIn,
              toToken,
              1,
              constants.AddressZero,
              constants.HashZero,
              constants.AddressZero,
              {
                value: amountIn,
              },
            ),
        ).to.be.revertedWith("Paused");
      });
      it("Should pause ZapBond", async () => {
        const amountIn = utils.parseEther("5");
        const fromToken = ETH;
        const toToken = UST;
        const bondId = BondId.UST;

        await expect(
          ohmZap
            .connect(user)
            .ZapBond(
              fromToken,
              amountIn,
              toToken,
              constants.AddressZero,
              constants.HashZero,
              constants.AddressZero,
              0,
              bondId,
              {
                value: amountIn,
              },
            ),
        ).to.be.revertedWith("Paused");
      });

      it("Should only be pausable by OlympusDao", async () => {
        await ohmZap.connect(OlympusDAO).toggleContractActive();
        await expect(ohmZap.toggleContractActive()).to.be.revertedWith(
          "Ownable: caller is not the owner",
        );
        await ohmZap.connect(OlympusDAO).toggleContractActive();
      });
    });
    context("onlyOlympusDAO", () => {
      it("Should only allow OlympusDAO to update depos", async () => {
        await expect(ohmZap.connect(user).update_Depo(constants.AddressZero)).to.be.revertedWith(
          "Ownable: caller is not the owner",
        );
      });
      it("Should only allow OlympusDAO to update staking", async () => {
        await expect(ohmZap.connect(user).update_Staking(ALCX)).to.be.revertedWith(
          "Ownable: caller is not the owner",
        );
      });
    });
  });
});
