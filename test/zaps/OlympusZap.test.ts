/* eslint-disable node/no-missing-import */
import { artifacts, ethers } from "hardhat";
import { constants, BigNumber, utils } from "ethers";

import { solidity } from "ethereum-waffle";
import chai from "chai";

import address from "../../libs/constants/address";
import { getSwapQuote } from "../../libs/quote/swap/swap";

import { approveToken, getBalance } from "../../libs/token/token.helper";
import { exchangeAndApprove } from "../../libs/exchange/exchange.helper";

import { IBondDepository, OlympusZap, OlympusZapManager } from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getZapInQuote } from "../../libs/quote/zap/zap";
import protocol from "../../libs/quote/zap/protocol";

chai.use(solidity);
const { expect } = chai;

const OlympusZapManagerArtifact = "contracts/zaps/OlympusZapManager.sol:OlympusZapManager";
const OlympusZapArtifact = "contracts/zaps/OlympusZap.sol:OlympusZap";

describe("OlympusDAO Zap", () => {
  let ohmZap: OlympusZap;
  let zapManager: OlympusZapManager;

  let deployer: SignerWithAddress;
  let user: SignerWithAddress;

  const { ETH, DAI, OHM, sOHM, wsOHM, SPELL } = address.tokens;
  const { OHM_LUSD, OHM_DAI, ALCX_ETH } = address.sushiswap;
  const { OHM_LUSD_DEPO, OHM_DAI_DEPO, DAI_DEPO, ALCX_ETH_DEPO } = address.ohm;

  before(async () => {
    [deployer, user] = await ethers.getSigners();

    // contracts
    zapManager = await ethers
      .getContractFactory(OlympusZapManagerArtifact, deployer)
      .then(async factory => {
        return (await factory.deploy()) as OlympusZapManager;
      });

    ohmZap = await ethers.getContractFactory(OlympusZapArtifact, deployer).then(async factory => {
      return (await factory.deploy(0, 0, zapManager.address)) as OlympusZap;
    });
  });

  describe("ZapIn", () => {
    context("to sOHM", () => {
      it("should ZapIn to sOHM using ETH", async () => {
        const amountIn = utils.parseEther("1");
        const fromToken = ETH;
        const toToken = sOHM;

        const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);
        const initialBalance = await getBalance(toToken, user.address);

        await ohmZap
          .connect(user)
          .ZapIn(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero, 0, false, {
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
          .ZapIn(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero, 0, false);
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
          .ZapIn(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero, 0, false);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });
    });

    context("to wsOHM", () => {
      it("should ZapIn to wsOHM using ETH", async () => {
        const amountIn = utils.parseEther("1");
        const fromToken = ETH;
        const toToken = wsOHM;

        const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ohmZap
          .connect(user)
          .ZapIn(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero, 0, false, {
            value: amountIn,
          });
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapIn to wsOHM using DAI", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = DAI;
        const toToken = wsOHM;

        const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ohmZap.address);
        const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ohmZap
          .connect(user)
          .ZapIn(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero, 0, false);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapIn to wsOHM using OHM", async () => {
        const fromETH = utils.parseEther("1");
        const fromToken = OHM;
        const toToken = wsOHM;

        const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ohmZap.address);
        const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

        const initialBalance = await getBalance(toToken, user.address);
        await ohmZap
          .connect(user)
          .ZapIn(fromToken, amountIn, toToken, 1, to, data, constants.AddressZero, 0, false);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });
    });
  });

  describe("ZapOut", () => {
    context("from sOHM", () => {
      let sOHMAmount: BigNumber;
      before(async () => {
        // ZapIn
        const amountIn = utils.parseEther("1");
        const fromToken = ETH;
        const toToken = sOHM;

        const quote = await getSwapQuote(fromToken, OHM, amountIn);
        await ohmZap
          .connect(user)
          .ZapIn(
            fromToken,
            amountIn,
            toToken,
            1,
            quote.to,
            quote.data,
            constants.AddressZero,
            0,
            false,
            {
              value: amountIn,
            },
          );
        const sOHMBalance = await getBalance(toToken, user.address);
        sOHMAmount = sOHMBalance.div(4);

        // approve Zap
        await approveToken(sOHM, user, ohmZap.address);
      });

      it("should ZapOut from sOHM to ETH", async () => {
        const fromToken = sOHM;
        const toToken = ETH;
        const { to, data } = await getSwapQuote(OHM, toToken, sOHMAmount);

        const initialBalance = await user.getBalance();
        await ohmZap
          .connect(user)
          .ZapOut(fromToken, sOHMAmount, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await user.getBalance();
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapOut from sOHM to DAI", async () => {
        const fromToken = sOHM;
        const toToken = DAI;
        const { to, data } = await getSwapQuote(OHM, toToken, sOHMAmount);

        const initialBalance = await getBalance(toToken, user.address);
        await ohmZap
          .connect(user)
          .ZapOut(fromToken, sOHMAmount, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapOut from sOHM to OHM", async () => {
        const fromToken = sOHM;
        const toToken = OHM;
        const { to, data } = await getSwapQuote(OHM, toToken, sOHMAmount);

        const initialBalance = await getBalance(toToken, user.address);
        await ohmZap
          .connect(user)
          .ZapOut(fromToken, sOHMAmount, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });
    });

    context("from wsOHM", () => {
      let wsOHMAmount: BigNumber;
      before(async () => {
        // ZapIn
        const amountIn = utils.parseEther("1");
        const fromToken = ETH;
        const toToken = wsOHM;

        const quote = await getSwapQuote(fromToken, OHM, amountIn);
        await ohmZap
          .connect(user)
          .ZapIn(
            fromToken,
            amountIn,
            toToken,
            1,
            quote.to,
            quote.data,
            constants.AddressZero,
            0,
            false,
            {
              value: amountIn,
            },
          );
        const wsOHMBalance = await getBalance(toToken, user.address);
        wsOHMAmount = wsOHMBalance.div(4);

        // approve Zap
        await approveToken(wsOHM, user, ohmZap.address);
      });

      it("should ZapOut from wsOHM to ETH", async () => {
        const fromToken = wsOHM;
        const toToken = ETH;
        const ohmEquivalent = await ohmZap.removeLiquidityReturn(fromToken, wsOHMAmount);
        const { to, data } = await getSwapQuote(OHM, toToken, ohmEquivalent);

        const initialBalance = await user.getBalance();
        await ohmZap
          .connect(user)
          .ZapOut(fromToken, wsOHMAmount, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await user.getBalance();
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapOut from wsOHM to DAI", async () => {
        const fromToken = wsOHM;
        const toToken = DAI;
        const ohmEquivalent = await ohmZap.removeLiquidityReturn(fromToken, wsOHMAmount);
        const { to, data } = await getSwapQuote(OHM, toToken, ohmEquivalent);

        const initialBalance = await getBalance(toToken, user.address);
        await ohmZap
          .connect(user)
          .ZapOut(fromToken, wsOHMAmount, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      it("should ZapOut from wsOHM to OHM", async () => {
        const fromToken = wsOHM;
        const toToken = OHM;
        const ohmEquivalent = await ohmZap.removeLiquidityReturn(fromToken, wsOHMAmount);
        const { to, data } = await getSwapQuote(OHM, toToken, ohmEquivalent);

        const initialBalance = await getBalance(toToken, user.address);
        await ohmZap
          .connect(user)
          .ZapOut(fromToken, wsOHMAmount, toToken, 1, to, data, constants.AddressZero);
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });
    });
  });
  describe("Bonds", () => {
    context("Sushiswap LPs", () => {
      before(async () => {
        await zapManager.update_BondDepos(
          [OHM_LUSD, OHM_DAI, ALCX_ETH],
          [OHM_LUSD_DEPO, OHM_DAI_DEPO, ALCX_ETH_DEPO],
        );
      });
      it("Should create bonds with OHM-LUSD using ETH", async () => {
        const amountIn = utils.parseEther("5");
        const fromToken = ETH;
        const toToken = OHM_LUSD;

        const { to, data } = await getZapInQuote({
          toWhomToIssue: user.address,
          sellToken: fromToken,
          sellAmount: amountIn,
          poolAddress: toToken,
          protocol: protocol.sushiswap,
        });

        const depositoryAddress = await zapManager.principalToDepository(toToken);

        const depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
          depositoryAddress,
        )) as IBondDepository;

        const maxBondPrice = await ohmZap.bondPrice(toToken);

        const beforeVesting = (await depository.bondInfo(user.address))[0];

        await ohmZap
          .connect(user)
          .ZapIn(
            fromToken,
            amountIn,
            toToken,
            1,
            to,
            data,
            constants.AddressZero,
            maxBondPrice,
            true,
            {
              value: amountIn,
            },
          );

        const vesting = (await depository.bondInfo(user.address))[0];

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with OHM-DAI using ETH", async () => {
        const amountIn = utils.parseEther("5");
        const fromToken = ETH;
        const toToken = OHM_DAI;

        const { to, data } = await getZapInQuote({
          toWhomToIssue: user.address,
          sellToken: fromToken,
          sellAmount: amountIn,
          poolAddress: toToken,
          protocol: protocol.sushiswap,
        });

        const depositoryAddress = await zapManager.principalToDepository(toToken);

        const depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
          depositoryAddress,
        )) as IBondDepository;

        const maxBondPrice = await ohmZap.bondPrice(toToken);

        const beforeVesting = (await depository.bondInfo(user.address))[0];

        await ohmZap
          .connect(user)
          .ZapIn(
            fromToken,
            amountIn,
            toToken,
            1,
            to,
            data,
            constants.AddressZero,
            maxBondPrice,
            true,
            {
              value: amountIn,
            },
          );
        const vesting = (await depository.bondInfo(user.address))[0];

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with OHM-LUSD using DAI", async () => {
        const fromToken = DAI;
        const toToken = OHM_LUSD;

        const amountIn = await exchangeAndApprove(
          user,
          ETH,
          fromToken,
          utils.parseEther("5"),
          ohmZap.address,
        );

        const { to, data } = await getZapInQuote({
          toWhomToIssue: user.address,
          sellToken: fromToken,
          sellAmount: amountIn,
          poolAddress: toToken,
          protocol: protocol.sushiswap,
        });

        const depositoryAddress = await zapManager.principalToDepository(toToken);

        const depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
          depositoryAddress,
        )) as IBondDepository;

        const maxBondPrice = await ohmZap.bondPrice(toToken);

        const beforeVesting = (await depository.bondInfo(user.address))[0];

        await ohmZap
          .connect(user)
          .ZapIn(
            fromToken,
            amountIn,
            toToken,
            1,
            to,
            data,
            constants.AddressZero,
            maxBondPrice,
            true,
          );

        const vesting = (await depository.bondInfo(user.address))[0];

        expect(vesting).to.be.gt(beforeVesting);
      });
    });
    context("Tokens", () => {
      before(async () => {
        await zapManager.update_BondDepos([DAI], [DAI_DEPO]);
      });
      it("Should create bonds with DAI using ETH", async () => {
        const amountIn = utils.parseEther("10");
        const fromToken = ETH;
        const toToken = DAI;

        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const depositoryAddress = await zapManager.principalToDepository(toToken);

        const depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
          depositoryAddress,
        )) as IBondDepository;

        const maxBondPrice = await ohmZap.bondPrice(toToken);

        const beforeVesting = (await depository.bondInfo(user.address))[0];

        await ohmZap
          .connect(user)
          .ZapIn(
            fromToken,
            amountIn,
            toToken,
            1,
            to,
            data,
            constants.AddressZero,
            maxBondPrice,
            true,
            { value: amountIn },
          );

        const vesting = (await depository.bondInfo(user.address))[0];

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with DAI using SPELL", async () => {
        const fromToken = SPELL;
        const toToken = DAI;

        const amountIn = await exchangeAndApprove(
          user,
          ETH,
          fromToken,
          utils.parseEther("5"),
          ohmZap.address,
        );

        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const depositoryAddress = await zapManager.principalToDepository(toToken);

        const depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
          depositoryAddress,
        )) as IBondDepository;

        const maxBondPrice = await ohmZap.bondPrice(toToken);

        const beforeVesting = (await depository.bondInfo(user.address))[0];

        await ohmZap
          .connect(user)
          .ZapIn(
            fromToken,
            amountIn,
            toToken,
            1,
            to,
            data,
            constants.AddressZero,
            maxBondPrice,
            true,
          );

        const vesting = (await depository.bondInfo(user.address))[0];

        expect(vesting).to.be.gt(beforeVesting);
      });
    });
  });
  describe("Olympus Pro Bonds", () => {
    context("Sushiswap LPs", () => {
      before(async () => {
        await zapManager.update_BondDepos([ALCX_ETH], [ALCX_ETH_DEPO]);
      });
      it("Should create bonds with ETH_ALCX using ETH", async () => {
        const amountIn = utils.parseEther("5");
        const fromToken = ETH;
        const toToken = ALCX_ETH;

        const { to, data } = await getZapInQuote({
          toWhomToIssue: user.address,
          sellToken: fromToken,
          sellAmount: amountIn,
          poolAddress: toToken,
          protocol: protocol.sushiswap,
        });

        const depositoryAddress = await zapManager.principalToDepository(toToken);

        const depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
          depositoryAddress,
        )) as IBondDepository;

        // Skip slippage check
        const maxBondPrice = constants.MaxUint256;
        // const maxBondPrice = await ohmZap.bondPrice(toToken);

        const beforeVesting = (await depository.bondInfo(user.address))[0];

        await ohmZap
          .connect(user)
          .ZapIn(
            fromToken,
            amountIn,
            toToken,
            1,
            to,
            data,
            constants.AddressZero,
            maxBondPrice,
            true,
            {
              value: amountIn,
            },
          );
        const vesting = (await depository.bondInfo(user.address))[0];

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with ETH_ALCX using SPELL", async () => {
        const fromToken = SPELL;
        const toToken = ALCX_ETH;

        const amountIn = await exchangeAndApprove(
          user,
          ETH,
          fromToken,
          utils.parseEther("5"),
          ohmZap.address,
        );

        const { to, data } = await getZapInQuote({
          toWhomToIssue: user.address,
          sellToken: fromToken,
          sellAmount: amountIn,
          poolAddress: toToken,
          protocol: protocol.sushiswap,
        });

        const depositoryAddress = await zapManager.principalToDepository(toToken);

        const depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
          depositoryAddress,
        )) as IBondDepository;

        // Skip slippage check
        const maxBondPrice = constants.MaxUint256;
        // const maxBondPrice = await ohmZap.bondPrice(toToken);

        const beforeVesting = (await depository.bondInfo(user.address))[0];

        await ohmZap
          .connect(user)
          .ZapIn(
            fromToken,
            amountIn,
            toToken,
            1,
            to,
            data,
            constants.AddressZero,
            maxBondPrice,
            true,
          );

        const vesting = (await depository.bondInfo(user.address))[0];

        expect(vesting).to.be.gt(beforeVesting);
      });
    });
  });
});
