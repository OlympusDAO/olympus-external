import { ethers } from "hardhat";
import { Signer, constants, utils, BigNumber } from "ethers";
import address from "../constants/address";
import { getSwapQuote } from "../quote/swap/swap";
import { IERC20, IWETH } from "../../typechain";

const { ETH, WETH } = address.tokens;

export const exchangeAndApprove = async (
  fromAccount: Signer,
  fromTokenAddress: string,
  toTokenAddress: string,
  sellAmount: BigNumber,
  spender: string,
): Promise<BigNumber> => {
  if (fromTokenAddress === ETH && toTokenAddress === WETH) {
    const wethToken = (await ethers.getContractAt("IWETH", WETH)) as IWETH;
    wethToken.connect(fromAccount).deposit({ value: sellAmount });
  } else {
    const value = fromTokenAddress === address.tokens.ETH ? sellAmount : "0";
    const { to, data } = await getSwapQuote(fromTokenAddress, toTokenAddress, sellAmount);
    await fromAccount.sendTransaction({ to, data, value });
  }
  const token = (await ethers.getContractAt(
    "contracts/zaps/interfaces/IERC20.sol:IERC20",
    toTokenAddress,
  )) as IERC20;

  await token.connect(fromAccount).approve(spender, constants.MaxUint256);

  return await token.balanceOf(await fromAccount.getAddress());
};
