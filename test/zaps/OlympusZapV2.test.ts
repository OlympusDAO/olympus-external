/* eslint-disable node/no-missing-import */
import { network, ethers } from "hardhat";
import { constants, BigNumber, utils, Signer } from "ethers";

import { solidity } from "ethereum-waffle";
import chai from "chai";

import address from "../../libs/constants/address";
import { getSwapQuote } from "../../libs/quote/swap/swap";

import { approveToken, getBalance } from "../../libs/token/token.helper";
import { exchangeAndApprove } from "../../libs/exchange/exchange.helper";

import { IBondDepository, OlympusV2ZapV2 } from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getZapInQuote } from "../../libs/quote/zap/zap";
import protocol from "../../libs/quote/zap/protocol";

import { CheapestBondHelper } from "../../typechain";

chai.use(solidity);
const { expect } = chai;

const OlympusZapArtifact = "Olympus_V2_Zap_V2";
const CheapestBondHelperArtifact = "CheapestBondHelper";

describe("OlympusDAO Zap", () => {
  let ohmZap: OlympusV2ZapV2;
  let cheapestBondHelper: CheapestBondHelper;

  let deployer: SignerWithAddress;
  let user: SignerWithAddress;
  let OlympusDAO: SignerWithAddress;

  const stakingAddress = "0xB63cac384247597756545b500253ff8E607a8020";

  const { ETH, DAI, OHM, sOHM, gOHM, SPELL, ALCX } = address.tokens;
  const { OHM_LUSD, OHM_DAI, ALCX_ETH } = address.sushiswap;
  const { OHM_FRAX } = address.uniswap;

  const { OHM_LUSD_DEPO, OHM_DAI_DEPO, DAI_DEPO, ALCX_ETH_DEPO, OHM_FRAX_DEPO } = address.ohm;

  before(async () => {
    [deployer, user, OlympusDAO] = await ethers.getSigners();
    // impersonate zapper admin
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [OlympusDAO.address],
    });
    zapperAdmin = await ethers.provider.getSigner(zapperAdminAddress);

    cheapestBondHelper = await ethers
      .getContractFactory(CheapestBondHelperArtifact, deployer)
      .then(async factory => {
        return (await factory.deploy(
          [address.sushiswap.OHM_DAI],
          address.ohm.OHM_DAI_DEPO, //
        )) as CheapestBondHelper;
      });

    ohmZap = await ethers.getContractFactory(OlympusZapArtifact, deployer).then(async factory => {
      return (await factory.deploy(
        OlympusDAO.address,
        address.ohm.OHM_DAI_DEPO, //TODO: Get correct BondDepoV2 address
        stakingAddress,
        address.tokens.OHM,
        address.tokens.sOHM,
        address.tokens.gOHM,
        0,
        0,
        cheapestBondHelper.address,
      )) as OlympusV2ZapV2;
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
          .ZapIn(
            fromToken,
            amountIn,
            toToken,
            1,
            to,
            data,
            constants.AddressZero,
            constants.AddressZero,
            { value: amountIn },
          );
        const finalBalance = await getBalance(toToken, user.address);
        expect(finalBalance).to.be.gt(initialBalance);
      });

      //     it("should ZapIn to sOHM using DAI", async () => {
      //       const fromETH = utils.parseEther("1");
      //       const fromToken = DAI;
      //       const toToken = sOHM;

      //       const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ohmZap.address);
      //       const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

      //       const initialBalance = await getBalance(toToken, user.address);
      //       await ohmZap
      //         .connect(user)
      //         .ZapIn(
      //           fromToken,
      //           amountIn,
      //           toToken,
      //           1,
      //           to,
      //           data,
      //           constants.AddressZero,
      //           constants.AddressZero,
      //         );
      //       const finalBalance = await getBalance(toToken, user.address);
      //       expect(finalBalance).to.be.gt(initialBalance);
      //     });

      //     it("should ZapIn to sOHM using OHM", async () => {
      //       const fromETH = utils.parseEther("1");
      //       const fromToken = OHM;
      //       const toToken = sOHM;

      //       const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ohmZap.address);
      //       const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

      //       const initialBalance = await getBalance(toToken, user.address);
      //       await ohmZap
      //         .connect(user)
      //         .ZapIn(
      //           fromToken,
      //           amountIn,
      //           toToken,
      //           1,
      //           to,
      //           data,
      //           constants.AddressZero,
      //           constants.AddressZero,
      //         );
      //       const finalBalance = await getBalance(toToken, user.address);
      //       expect(finalBalance).to.be.gt(initialBalance);
      //     });
      //   });

      //   context("to gOHM", () => {
      //     it("should ZapIn to gOHM using ETH", async () => {
      //       const amountIn = utils.parseEther("1");
      //       const fromToken = ETH;
      //       const toToken = gOHM;

      //       const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

      //       const initialBalance = await getBalance(toToken, user.address);
      //       await ohmZap
      //         .connect(user)
      //         .ZapIn(
      //           fromToken,
      //           amountIn,
      //           toToken,
      //           1,
      //           to,
      //           data,
      //           constants.AddressZero,
      //           constants.AddressZero,
      //         );
      //       const finalBalance = await getBalance(toToken, user.address);
      //       expect(finalBalance).to.be.gt(initialBalance);
      //     });

      //     it("should ZapIn to gOHM using DAI", async () => {
      //       const fromETH = utils.parseEther("1");
      //       const fromToken = DAI;
      //       const toToken = gOHM;

      //       const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ohmZap.address);
      //       const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

      //       const initialBalance = await getBalance(toToken, user.address);
      //       await ohmZap
      //         .connect(user)
      //         .ZapIn(
      //           fromToken,
      //           amountIn,
      //           toToken,
      //           1,
      //           to,
      //           data,
      //           constants.AddressZero,
      //           constants.AddressZero,
      //         );
      //       const finalBalance = await getBalance(toToken, user.address);
      //       expect(finalBalance).to.be.gt(initialBalance);
      //     });

      //     it("should ZapIn to gOHM using OHM", async () => {
      //       const fromETH = utils.parseEther("1");
      //       const fromToken = OHM;
      //       const toToken = gOHM;

      //       const amountIn = await exchangeAndApprove(user, ETH, fromToken, fromETH, ohmZap.address);
      //       const { to, data } = await getSwapQuote(fromToken, OHM, amountIn);

      //       const initialBalance = await getBalance(toToken, user.address);
      //       await ohmZap
      //         .connect(user)
      //         .ZapIn(
      //           fromToken,
      //           amountIn,
      //           toToken,
      //           1,
      //           to,
      //           data,
      //           constants.AddressZero,
      //           constants.AddressZero,
      //         );
      //       const finalBalance = await getBalance(toToken, user.address);
      //       expect(finalBalance).to.be.gt(initialBalance);
      //     });
    });
  });

  // describe("ZapOut", () => {
  //   context("from sOHM", () => {
  //     let sOHMAmount: BigNumber;
  //     before(async () => {
  //       // ZapIn
  //       const amountIn = utils.parseEther("1");
  //       const fromToken = ETH;
  //       const toToken = sOHM;

  //       const quote = await getSwapQuote(fromToken, OHM, amountIn);
  //       await ohmZap
  //         .connect(user)
  //         .ZapIn(
  //           fromToken,
  //           amountIn,
  //           toToken,
  //           1,
  //           quote.to,
  //           quote.data,
  //           constants.AddressZero,
  //           constants.AddressZero,
  //         );
  //       const sOHMBalance = await getBalance(toToken, user.address);
  //       sOHMAmount = sOHMBalance.div(4);

  //       // approve Zap
  //       await approveToken(sOHM, user, ohmZap.address);
  //     });

  //     it("should ZapOut from sOHM to ETH", async () => {
  //       const fromToken = sOHM;
  //       const toToken = ETH;
  //       const { to, data } = await getSwapQuote(OHM, toToken, sOHMAmount);

  //       const initialBalance = await user.getBalance();
  //       await ohmZap
  //         .connect(user)
  //         .ZapOut(fromToken, sOHMAmount, toToken, 1, to, data, constants.AddressZero);
  //       const finalBalance = await user.getBalance();
  //       expect(finalBalance).to.be.gt(initialBalance);
  //     });

  //     it("should ZapOut from sOHM to DAI", async () => {
  //       const fromToken = sOHM;
  //       const toToken = DAI;
  //       const { to, data } = await getSwapQuote(OHM, toToken, sOHMAmount);

  //       const initialBalance = await getBalance(toToken, user.address);
  //       await ohmZap
  //         .connect(user)
  //         .ZapOut(fromToken, sOHMAmount, toToken, 1, to, data, constants.AddressZero);
  //       const finalBalance = await getBalance(toToken, user.address);
  //       expect(finalBalance).to.be.gt(initialBalance);
  //     });

  //     it("should ZapOut from sOHM to OHM", async () => {
  //       const fromToken = sOHM;
  //       const toToken = OHM;
  //       const { to, data } = await getSwapQuote(OHM, toToken, sOHMAmount);

  //       const initialBalance = await getBalance(toToken, user.address);
  //       await ohmZap
  //         .connect(user)
  //         .ZapOut(fromToken, sOHMAmount, toToken, 1, to, data, constants.AddressZero);
  //       const finalBalance = await getBalance(toToken, user.address);
  //       expect(finalBalance).to.be.gt(initialBalance);
  //     });
  //   });

  //   context("from gOHM", () => {
  //     let gOHMAmount: BigNumber;
  //     before(async () => {
  //       // ZapIn
  //       const amountIn = utils.parseEther("1");
  //       const fromToken = ETH;
  //       const toToken = gOHM;

  //       const quote = await getSwapQuote(fromToken, OHM, amountIn);
  //       await ohmZap
  //         .connect(user)
  //         .ZapIn(
  //           fromToken,
  //           amountIn,
  //           toToken,
  //           1,
  //           quote.to,
  //           quote.data,
  //           constants.AddressZero,
  //           constants.AddressZero,
  //         );
  //       const gOHMBalance = await getBalance(toToken, user.address);
  //       gOHMAmount = gOHMBalance.div(4);

  //       // approve Zap
  //       await approveToken(gOHM, user, ohmZap.address);
  //     });

  //     it("should ZapOut from gOHM to ETH", async () => {
  //       const fromToken = gOHM;
  //       const toToken = ETH;
  //       const ohmEquivalent = await ohmZap.removeLiquidityReturn(fromToken, gOHMAmount);
  //       const { to, data } = await getSwapQuote(OHM, toToken, ohmEquivalent);

  //       const initialBalance = await user.getBalance();
  //       await ohmZap
  //         .connect(user)
  //         .ZapOut(fromToken, gOHMAmount, toToken, 1, to, data, constants.AddressZero);
  //       const finalBalance = await user.getBalance();
  //       expect(finalBalance).to.be.gt(initialBalance);
  //     });

  //     it("should ZapOut from gOHM to DAI", async () => {
  //       const fromToken = gOHM;
  //       const toToken = DAI;
  //       const ohmEquivalent = await ohmZap.removeLiquidityReturn(fromToken, gOHMAmount);
  //       const { to, data } = await getSwapQuote(OHM, toToken, ohmEquivalent);

  //       const initialBalance = await getBalance(toToken, user.address);
  //       await ohmZap
  //         .connect(user)
  //         .ZapOut(fromToken, gOHMAmount, toToken, 1, to, data, constants.AddressZero);
  //       const finalBalance = await getBalance(toToken, user.address);
  //       expect(finalBalance).to.be.gt(initialBalance);
  //     });

  //     it("should ZapOut from gOHM to OHM", async () => {
  //       const fromToken = gOHM;
  //       const toToken = OHM;
  //       const ohmEquivalent = await ohmZap.removeLiquidityReturn(fromToken, gOHMAmount);
  //       const { to, data } = await getSwapQuote(OHM, toToken, ohmEquivalent);

  //       const initialBalance = await getBalance(toToken, user.address);
  //       await ohmZap
  //         .connect(user)
  //         .ZapOut(fromToken, gOHMAmount, toToken, 1, to, data, constants.AddressZero);
  //       const finalBalance = await getBalance(toToken, user.address);
  //       expect(finalBalance).to.be.gt(initialBalance);
  //     });
  //   });
  // });

  /* TODO check test starting 

  describe("Bonds", () => {
    context("Sushiswap LPs", () => {
      before(async () => {
        await ohmZap
          .connect(OlympusDAO)
          .update_Depo update_BondDepos(
            [OHM_LUSD, OHM_DAI, ALCX_ETH],
            [OHM, OHM, ALCX],
            [OHM_LUSD_DEPO, OHM_DAI_DEPO, ALCX_ETH_DEPO],
          );
      });
      // it("Should create bonds with OHM-LUSD using ETH", async () => {
      //   const amountIn = utils.parseEther("5");
      //   const fromToken = ETH;
      //   const toToken = OHM_LUSD;

      //   const { to, data } = await getZapInQuote({
      //     toWhomToIssue: user.address,
      //     sellToken: fromToken,
      //     sellAmount: amountIn,
      //     poolAddress: toToken,
      //     protocol: protocol.sushiswap,
      //   });

      //   const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

      //   const depository = (await ethers.getContractAt(
      //     "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
      //     depositoryAddress,
      //   )) as IBondDepository;

      //   const maxBondPrice = await depository.bondPrice();

      //   const beforeVesting = (await depository.bondInfo(user.address))[0];

      //   await ohmZap
      //     .connect(user)
      //     .ZapIn(
      //       fromToken,
      //       amountIn,
      //       toToken,
      //       1,
      //       to,
      //       data,
      //       constants.AddressZero,
      //       OHM_LUSD,
      //       maxBondPrice,
      //       true,
      //       {
      //         value: amountIn,
      //       },
      //     );

      //   const vesting = (await depository.bondInfo(user.address))[0];

      //   expect(vesting).to.be.gt(beforeVesting);
      // });
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

        const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

        const depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
          depositoryAddress,
        )) as IBondDepository;

        const maxBondPrice = await depository.bondPrice();

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
            OHM,
            maxBondPrice,
            true,
            {
              value: amountIn,
            },
          );
        const vesting = (await depository.bondInfo(user.address))[0];

        expect(vesting).to.be.gt(beforeVesting);
      });
      //   it("Should create bonds with OHM-LUSD using DAI", async () => {
      //     const fromToken = DAI;
      //     const toToken = OHM_LUSD;

      //     const amountIn = await exchangeAndApprove(
      //       user,
      //       ETH,
      //       fromToken,
      //       utils.parseEther("5"),
      //       ohmZap.address,
      //     );

      //     const { to, data } = await getZapInQuote({
      //       toWhomToIssue: user.address,
      //       sellToken: fromToken,
      //       sellAmount: amountIn,
      //       poolAddress: toToken,
      //       protocol: protocol.sushiswap,
      //     });

      //     const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

      //     const depository = (await ethers.getContractAt(
      //       "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
      //       depositoryAddress,
      //     )) as IBondDepository;

      //     const maxBondPrice = await depository.bondPrice();

      //     const beforeVesting = (await depository.bondInfo(user.address))[0];

      //     await ohmZap
      //       .connect(user)
      //       .ZapIn(
      //         fromToken,
      //         amountIn,
      //         toToken,
      //         1,
      //         to,
      //         data,
      //         constants.AddressZero,
      //         OHM_LUSD,
      //         maxBondPrice,
      //         true,
      //       );

      //     const vesting = (await depository.bondInfo(user.address))[0];

      //     expect(vesting).to.be.gt(beforeVesting);
      //   });
      // });
    });
    context("Uniswap V2 LPs", () => {
      before(async () => {
        await ohmZap.connect(OlympusDAO).update_BondDepos([OHM_FRAX], [OHM], [OHM_FRAX_DEPO]);
      });
      it("Should create bonds with OHM-FRAX using ETH", async () => {
        const amountIn = utils.parseEther("5");
        const fromToken = ETH;
        const toToken = OHM_FRAX;

        const { to, data } = await getZapInQuote({
          toWhomToIssue: user.address,
          sellToken: fromToken,
          sellAmount: amountIn,
          poolAddress: toToken,
          protocol: protocol.uniswap,
        });

        const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

        const depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
          depositoryAddress,
        )) as IBondDepository;

        const maxBondPrice = await depository.bondPrice();

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
            OHM,
            maxBondPrice,
            true,
            {
              value: amountIn,
            },
          );
        const vesting = (await depository.bondInfo(user.address))[0];

        expect(vesting).to.be.gt(beforeVesting);
      });
      it("Should create bonds with OHM-FRAX using DAI", async () => {
        const fromToken = DAI;
        const toToken = OHM_FRAX;

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
          protocol: protocol.uniswap,
        });

        const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

        const depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
          depositoryAddress,
        )) as IBondDepository;

        const maxBondPrice = await depository.bondPrice();

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
            OHM,
            maxBondPrice,
            true,
          );

        const vesting = (await depository.bondInfo(user.address))[0];

        expect(vesting).to.be.gt(beforeVesting);
      });
    });

    context("Tokens", () => {
      before(async () => {
        await ohmZap.connect(OlympusDAO).update_BondDepos([DAI], [OHM], [DAI_DEPO]);
      });
      it("Should create bonds with DAI using ETH", async () => {
        const amountIn = utils.parseEther("10");
        const fromToken = ETH;
        const toToken = DAI;

        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

        const depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
          depositoryAddress,
        )) as IBondDepository;

        const maxBondPrice = await depository.bondPrice();

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
            OHM,
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

        const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

        const depository = (await ethers.getContractAt(
          "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
          depositoryAddress,
        )) as IBondDepository;

        const maxBondPrice = await depository.bondPrice();

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
            OHM,
            maxBondPrice,
            true,
          );

        const vesting = (await depository.bondInfo(user.address))[0];

        expect(vesting).to.be.gt(beforeVesting);
      });
    });
    describe("Olympus Pro Bonds", () => {
      context("Sushiswap LPs", () => {
        before(async () => {
          await ohmZap.connect(OlympusDAO).update_BondDepos([ALCX_ETH], [ALCX], [ALCX_ETH_DEPO]);
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

          const depositoryAddress = await ohmZap.principalToDepository(toToken, ALCX);

          const depository = (await ethers.getContractAt(
            "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
            depositoryAddress,
          )) as IBondDepository;

          // Skip slippage check
          const maxBondPrice = constants.MaxUint256;
          // const maxBondPrice = await depository.bondPrice();

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
              ALCX,
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

          const depositoryAddress = await ohmZap.principalToDepository(toToken, ALCX);

          const depository = (await ethers.getContractAt(
            "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
            depositoryAddress,
          )) as IBondDepository;

          // Skip slippage check
          const maxBondPrice = constants.MaxUint256;
          // const maxBondPrice = await depository.bondPrice();

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
              ALCX,
              maxBondPrice,
              true,
            );

          const vesting = (await depository.bondInfo(user.address))[0];

          expect(vesting).to.be.gt(beforeVesting);
        });
      });
    });
  });
  describe("Security", () => {
    context("Pausable", () => {
      before(async () => {
        await ohmZap.connect(zapperAdmin).toggleContractActive();
      });
      after(async () => {
        await ohmZap.connect(zapperAdmin).toggleContractActive();
      });
      it("Should pause ZapIns", async () => {
        const amountIn = utils.parseEther("5");
        const fromToken = ETH;
        const toToken = ALCX_ETH;

        await expect(
          ohmZap
            .connect(user)
            .ZapIn(
              fromToken,
              amountIn,
              toToken,
              1,
              constants.AddressZero,
              constants.HashZero,
              constants.AddressZero,
              constants.AddressZero,
              0,
              false,
              {
                value: amountIn,
              },
            ),
        ).to.be.revertedWith("Paused");
      });
      it("Should pause ZapIns", async () => {
        const amountIn = utils.parseEther("5");
        const fromToken = ETH;
        const toToken = ALCX_ETH;

        await expect(
          ohmZap
            .connect(user)
            .ZapOut(
              fromToken,
              amountIn,
              toToken,
              1,
              constants.AddressZero,
              constants.HashZero,
              constants.AddressZero,
            ),
        ).to.be.revertedWith("Paused");
      });
      it("Should only be pausable by Zapper Admin", async () => {
        await ohmZap.connect(zapperAdmin).toggleContractActive();
        await expect(ohmZap.toggleContractActive()).to.be.revertedWith(
          "Ownable: caller is not the owner",
        );
        await ohmZap.connect(zapperAdmin).toggleContractActive();
      });
    });
    context("onlyOlympusDAO", () => {
      it("Should only allow OlympusDAO to update depos", async () => {
        await expect(ohmZap.connect(user).update_BondDepos([], [], [])).to.be.revertedWith(
          "Only OlympusDAO",
        );
      });
      it("Should only allow OlympusDAO to update staking", async () => {
        await expect(ohmZap.connect(user).update_Staking(ALCX)).to.be.revertedWith(
          "Only OlympusDAO",
        );
      });
      it("Should only allow OlympusDAO to update sOHM", async () => {
        await expect(ohmZap.connect(user).update_sOHM(ALCX)).to.be.revertedWith("Only OlympusDAO");
      });
      it("Should only allow OlympusDAO to update gOHM", async () => {
        await expect(ohmZap.connect(user).update_gOHM(ALCX)).to.be.revertedWith("Only OlympusDAO");
      });
      it("Should only allow OlympusDAO to update gOHM", async () => {
        await expect(ohmZap.connect(user).update_gOHM(ALCX)).to.be.revertedWith("Only OlympusDAO");
      });
    });
  }); */
});
