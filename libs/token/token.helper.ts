import { ethers } from "hardhat";

import { Signer, constants, BigNumber } from "ethers";
import { IERC20 } from "../../typechain";

export const approveToken = async (
  token: IERC20 | string,
  owner: Signer,
  spender: string,
  amount: BigNumber = constants.MaxUint256,
) => {
  if (typeof token === "string") {
    token = await getToken(token);
  }
  const ownerAddress = await owner.getAddress();
  return await token.connect(owner).approve(spender, amount, {
    from: ownerAddress,
  });
};

export const getBalance = async (token: IERC20 | string, owner: string) => {
  if (typeof token === "string") {
    token = await getToken(token);
  }
  return await token.balanceOf(owner);
};

const getToken = async (tokenAddress: string) => {
  return (await ethers.getContractAt(
    "contracts/zaps/interfaces/IERC20.sol:IERC20",
    tokenAddress,
  )) as IERC20;
};
