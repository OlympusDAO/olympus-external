/* eslint-disable node/no-missing-import */
import { network, ethers } from "hardhat";
import { constants, BigNumber, utils, Signer } from "ethers";

import { solidity } from "ethereum-waffle";
import chai from "chai";

import address from "../../libs/constants/address";
import { getSwapQuote } from "../../libs/quote/swap/swap";

import { approveToken, getBalance } from "../../libs/token/token.helper";
import { exchangeAndApprove } from "../../libs/exchange/exchange.helper";

import { IBondDepository, OlympusV2ZapV1 } from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getZapInQuote } from "../../libs/quote/zap/zap";
import protocol from "../../libs/quote/zap/protocol";

import { BondHelper } from "../../typechain";
import { IBondDepoV2 } from "../../typechain";

chai.use(solidity);
const { expect } = chai;

const OlympusZapArtifact = "Olympus_V2_Zap_V1";
const BondHelperArtifact = "BondHelper";

describe("OlympusDAO Zap", () => {
  let ohmZap: OlympusV2ZapV1;
  let bondHelper: BondHelper;

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

    // bondHelper = await ethers
    //   .getContractFactory(BondHelperArtifact, deployer)
    //   .then(async factory => {
    //     return (await factory.deploy(
    //       [address.sushiswap.OHM_DAI],
    //       address.ohm.DEPO_V2, //
    //     )) as BondHelper;
    //   });

    // const bid = (await bondHelper.getCheapestBID())[0];
    // console.log("Cheapest bondId: " + bid);

    ohmZap = await ethers.getContractFactory(OlympusZapArtifact, deployer).then(async factory => {
      return (await factory.deploy(
        OlympusDAO.address,
        address.ohm.DEPO_V2,
        stakingAddress,
        address.tokens.OHM,
        address.tokens.sOHM,
        address.tokens.gOHM,
        0,
        0,
      )) as OlympusV2ZapV1;
    });
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

  describe.only("ZapBond", () => {
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
        const bondId = 12;

        const amountIn = utils.parseEther("5");

        const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

        const beforeVesting = (await depository.indexesFor(user.address)).length;

        const maxPrice = await depository.marketPrice(12);

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
    });
  });

  // describe("Bonds", () => {
  //   context("Sushiswap LPs", () => {
  //     // before(async () => {
  //     //   await ohmZap
  //     //     .connect(OlympusDAO)
  //     //     .update_Depo(address.sushiswap.OHM_DAI);
  //     // });

  //     it("Should create bonds with OHM-DAI using ETH", async () => {
  //       const amountIn = utils.parseEther("1");
  //       const fromToken = ETH;
  //       const toToken = OHM_DAI;

  //       // getZapInQuote returns an encoded sushiswap Zap in order to get the OHM-DAI LP.
  //       //This is only needed if the principal is an LP, otherwise getSwapQuote can be used instead
  //       const { to, data } = await getZapInQuote({
  //         toWhomToIssue: user.address,
  //         sellToken: fromToken,
  //         sellAmount: amountIn,
  //         poolAddress: toToken,
  //         protocol: protocol.sushiswap,
  //       });

  //       // const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

  //       // const depository = (await ethers.getContractAt(
  //       //   "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
  //       //   depositoryAddress,
  //       // )) as IBondDepository;
  //       const depository = (await ethers.getContractAt(
  //         "contracts/zaps/interfaces/IBondDepoV2.sol:IBondDepoV2",
  //         address.ohm.DEPO_V2,
  //       )) as IBondDepoV2;

  //       //const maxBondPrice = await depository.bondPrice();

  //       const beforeVesting = (await depository.indexesFor(user.address)).length;

  //       await ohmZap
  //         .connect(user)
  //         .ZapBond(
  //           fromToken,
  //           amountIn,
  //           toToken,
  //           to,
  //           data,
  //           constants.AddressZero,
  //           200,
  //           5,
  //           {
  //             value: amountIn,
  //           },
  //         );
  //       const vesting = (await depository.indexesFor(user.address)).length;

  //       expect(vesting).to.be.gt(beforeVesting);
  //     });
  //     //   it("Should create bonds with OHM-LUSD using DAI", async () => {
  //     //     const fromToken = DAI;
  //     //     const toToken = OHM_LUSD;

  //     //     const amountIn = await exchangeAndApprove(
  //     //       user,
  //     //       ETH,
  //     //       fromToken,
  //     //       utils.parseEther("5"),
  //     //       ohmZap.address,
  //     //     );

  //     //     const { to, data } = await getZapInQuote({
  //     //       toWhomToIssue: user.address,
  //     //       sellToken: fromToken,
  //     //       sellAmount: amountIn,
  //     //       poolAddress: toToken,
  //     //       protocol: protocol.sushiswap,
  //     //     });

  //     //     const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

  //     //     const depository = (await ethers.getContractAt(
  //     //       "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
  //     //       depositoryAddress,
  //     //     )) as IBondDepository;

  //     //     const maxBondPrice = await depository.bondPrice();

  //     //     const beforeVesting = (await depository.bondInfo(user.address))[0];

  //     //     await ohmZap
  //     //       .connect(user)
  //     //       .ZapIn(
  //     //         fromToken,
  //     //         amountIn,
  //     //         toToken,
  //     //         1,
  //     //         to,
  //     //         data,
  //     //         constants.AddressZero,
  //     //         OHM_LUSD,
  //     //         maxBondPrice,
  //     //         true,
  //     //       );

  //     //     const vesting = (await depository.bondInfo(user.address))[0];

  //     //     expect(vesting).to.be.gt(beforeVesting);
  //     //   });
  //     // });
  //   });
  //   // context("Uniswap V2 LPs", () => {
  //   //   before(async () => {
  //   //     await ohmZap.connect(OlympusDAO).update_BondDepos([OHM_FRAX], [OHM], [OHM_FRAX_DEPO]);
  //   //   });
  //   //   it("Should create bonds with OHM-FRAX using ETH", async () => {
  //   //     const amountIn = utils.parseEther("5");
  //   //     const fromToken = ETH;
  //   //     const toToken = OHM_FRAX;

  //   //     const { to, data } = await getZapInQuote({
  //   //       toWhomToIssue: user.address,
  //   //       sellToken: fromToken,
  //   //       sellAmount: amountIn,
  //   //       poolAddress: toToken,
  //   //       protocol: protocol.uniswap,
  //   //     });

  //   //     // const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

  //   //     // const depository = (await ethers.getContractAt(
  //   //     //   "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
  //   //     //   depositoryAddress,
  //   //     // )) as IBondDepository;
  //   //     const depository = (await ethers.getContractAt(
  //   //       "contracts/zaps/interfaces/IBondDepoV2.sol:IBondDepoV2",
  //   //       address.ohm.DEPO_V2,
  //   //     )) as IBondDepoV2;

  //   //     //const maxBondPrice = await depository.bondPrice();

  //   //     const beforeVesting = (await depository.bondInfo(user.address))[0];

  //   //     await ohmZap
  //   //       .connect(user)
  //   //       .ZapBond(
  //   //         fromToken,
  //   //         amountIn,
  //   //         toToken,
  //   //         1,
  //   //         to,
  //   //         data,
  //   //         constants.AddressZero,
  //   //         OHM,
  //   //         maxBondPrice,
  //   //         true,
  //   //         {
  //   //           value: amountIn,
  //   //         },
  //   //       );
  //   //     const vesting = (await depository.bondInfo(user.address))[0];

  //   //     expect(vesting).to.be.gt(beforeVesting);
  //   //   });
  //   //   it("Should create bonds with OHM-FRAX using DAI", async () => {
  //   //     const fromToken = DAI;
  //   //     const toToken = OHM_FRAX;

  //   //     const amountIn = await exchangeAndApprove(
  //   //       user,
  //   //       ETH,
  //   //       fromToken,
  //   //       utils.parseEther("5"),
  //   //       ohmZap.address,
  //   //     );

  //   //     const { to, data } = await getZapInQuote({
  //   //       toWhomToIssue: user.address,
  //   //       sellToken: fromToken,
  //   //       sellAmount: amountIn,
  //   //       poolAddress: toToken,
  //   //       protocol: protocol.uniswap,
  //   //     });

  //   //     const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

  //   //     const depository = (await ethers.getContractAt(
  //   //       "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
  //   //       depositoryAddress,
  //   //     )) as IBondDepository;

  //   //     const maxBondPrice = await depository.bondPrice();

  //   //     const beforeVesting = (await depository.bondInfo(user.address))[0];

  //   //     await ohmZap
  //   //       .connect(user)
  //   //       .ZapIn(
  //   //         fromToken,
  //   //         amountIn,
  //   //         toToken,
  //   //         1,
  //   //         to,
  //   //         data,
  //   //         constants.AddressZero,
  //   //         OHM,
  //   //         maxBondPrice,
  //   //         true,
  //   //       );

  //   //     const vesting = (await depository.bondInfo(user.address))[0];

  //   //     expect(vesting).to.be.gt(beforeVesting);
  //   //   });
  //   // });

  //   // context("Tokens", () => {
  //   //   before(async () => {
  //   //     await ohmZap.connect(OlympusDAO).update_BondDepos([DAI], [OHM], [DAI_DEPO]);
  //   //   });
  //   //   it("Should create bonds with DAI using ETH", async () => {
  //   //     const amountIn = utils.parseEther("10");
  //   //     const fromToken = ETH;
  //   //     const toToken = DAI;

  //   //     const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

  //   //     const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

  //   //     const depository = (await ethers.getContractAt(
  //   //       "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
  //   //       depositoryAddress,
  //   //     )) as IBondDepository;

  //   //     const maxBondPrice = await depository.bondPrice();

  //   //     const beforeVesting = (await depository.bondInfo(user.address))[0];

  //   //     await ohmZap
  //   //       .connect(user)
  //   //       .ZapIn(
  //   //         fromToken,
  //   //         amountIn,
  //   //         toToken,
  //   //         1,
  //   //         to,
  //   //         data,
  //   //         constants.AddressZero,
  //   //         OHM,
  //   //         maxBondPrice,
  //   //         true,
  //   //         { value: amountIn },
  //   //       );

  //   //     const vesting = (await depository.bondInfo(user.address))[0];

  //   //     expect(vesting).to.be.gt(beforeVesting);
  //   //   });
  //   //   it("Should create bonds with DAI using SPELL", async () => {
  //   //     const fromToken = SPELL;
  //   //     const toToken = DAI;

  //   //     const amountIn = await exchangeAndApprove(
  //   //       user,
  //   //       ETH,
  //   //       fromToken,
  //   //       utils.parseEther("5"),
  //   //       ohmZap.address,
  //   //     );

  //   //     const { to, data } = await getSwapQuote(fromToken, toToken, amountIn);

  //   //     const depositoryAddress = await ohmZap.principalToDepository(toToken, OHM);

  //   //     const depository = (await ethers.getContractAt(
  //   //       "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
  //   //       depositoryAddress,
  //   //     )) as IBondDepository;

  //   //     const maxBondPrice = await depository.bondPrice();

  //   //     const beforeVesting = (await depository.bondInfo(user.address))[0];

  //   //     await ohmZap
  //   //       .connect(user)
  //   //       .ZapIn(
  //   //         fromToken,
  //   //         amountIn,
  //   //         toToken,
  //   //         1,
  //   //         to,
  //   //         data,
  //   //         constants.AddressZero,
  //   //         OHM,
  //   //         maxBondPrice,
  //   //         true,
  //   //       );

  //   //     const vesting = (await depository.bondInfo(user.address))[0];

  //   //     expect(vesting).to.be.gt(beforeVesting);
  //   //   });
  //   // });
  //   // describe("Olympus Pro Bonds", () => {
  //   //   context("Sushiswap LPs", () => {
  //   //     before(async () => {
  //   //       await ohmZap.connect(OlympusDAO).update_BondDepos([ALCX_ETH], [ALCX], [ALCX_ETH_DEPO]);
  //   //     });
  //   //     it("Should create bonds with ETH_ALCX using ETH", async () => {
  //   //       const amountIn = utils.parseEther("5");
  //   //       const fromToken = ETH;
  //   //       const toToken = ALCX_ETH;

  //   //       const { to, data } = await getZapInQuote({
  //   //         toWhomToIssue: user.address,
  //   //         sellToken: fromToken,
  //   //         sellAmount: amountIn,
  //   //         poolAddress: toToken,
  //   //         protocol: protocol.sushiswap,
  //   //       });

  //   //       const depositoryAddress = await ohmZap.principalToDepository(toToken, ALCX);

  //   //       const depository = (await ethers.getContractAt(
  //   //         "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
  //   //         depositoryAddress,
  //   //       )) as IBondDepository;

  //   //       // Skip slippage check
  //   //       const maxBondPrice = constants.MaxUint256;
  //   //       // const maxBondPrice = await depository.bondPrice();

  //   //       const beforeVesting = (await depository.bondInfo(user.address))[0];

  //   //       await ohmZap
  //   //         .connect(user)
  //   //         .ZapIn(
  //   //           fromToken,
  //   //           amountIn,
  //   //           toToken,
  //   //           1,
  //   //           to,
  //   //           data,
  //   //           constants.AddressZero,
  //   //           ALCX,
  //   //           maxBondPrice,
  //   //           true,
  //   //           {
  //   //             value: amountIn,
  //   //           },
  //   //         );
  //   //       const vesting = (await depository.bondInfo(user.address))[0];

  //   //       expect(vesting).to.be.gt(beforeVesting);
  //   //     });
  //   //     it("Should create bonds with ETH_ALCX using SPELL", async () => {
  //   //       const fromToken = SPELL;
  //   //       const toToken = ALCX_ETH;

  //   //       const amountIn = await exchangeAndApprove(
  //   //         user,
  //   //         ETH,
  //   //         fromToken,
  //   //         utils.parseEther("5"),
  //   //         ohmZap.address,
  //   //       );

  //   //       const { to, data } = await getZapInQuote({
  //   //         toWhomToIssue: user.address,
  //   //         sellToken: fromToken,
  //   //         sellAmount: amountIn,
  //   //         poolAddress: toToken,
  //   //         protocol: protocol.sushiswap,
  //   //       });

  //   //       const depositoryAddress = await ohmZap.principalToDepository(toToken, ALCX);

  //   //       const depository = (await ethers.getContractAt(
  //   //         "contracts/zaps/interfaces/IBondDepository.sol:IBondDepository",
  //   //         depositoryAddress,
  //   //       )) as IBondDepository;

  //   //       // Skip slippage check
  //   //       const maxBondPrice = constants.MaxUint256;
  //   //       // const maxBondPrice = await depository.bondPrice();

  //   //       const beforeVesting = (await depository.bondInfo(user.address))[0];

  //   //       await ohmZap
  //   //         .connect(user)
  //   //         .ZapIn(
  //   //           fromToken,
  //   //           amountIn,
  //   //           toToken,
  //   //           1,
  //   //           to,
  //   //           data,
  //   //           constants.AddressZero,
  //   //           ALCX,
  //   //           maxBondPrice,
  //   //           true,
  //   //         );

  //   //       const vesting = (await depository.bondInfo(user.address))[0];

  //   //       expect(vesting).to.be.gt(beforeVesting);
  //   //     });
  //   //   });
  //   // });
  // });
  describe("Security", () => {
    context("Pausable", () => {
      before(async () => {
        await ohmZap.connect(OlympusDAO).toggleContractActive();
      });
      after(async () => {
        await ohmZap.connect(OlympusDAO).toggleContractActive();
      });
      it("Should pause ZapIns", async () => {
        const amountIn = utils.parseEther("5");
        const fromToken = ETH;
        const toToken = ALCX_ETH;

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
          "Only OlympusDAO",
        );
      });
      it("Should only allow OlympusDAO to update staking", async () => {
        await expect(ohmZap.connect(user).update_Staking(ALCX)).to.be.revertedWith(
          "Only OlympusDAO",
        );
      });
      it("Should only allow OlympusDAO to update OlympusDao address", async () => {
        await expect(
          ohmZap.connect(user).update_OlympusDAO(constants.AddressZero),
        ).to.be.revertedWith("Only OlympusDAO");
      });
      it("Should only allow OlympusDAO to update approvals", async () => {
        await expect(
          ohmZap.connect(user).update_approvals([], constants.AddressZero),
        ).to.be.revertedWith("Only OlympusDAO");
      });
    });
  });
});
