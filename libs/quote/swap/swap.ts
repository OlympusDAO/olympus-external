import axios from "axios";
import { BigNumber, constants } from "ethers";
import address from "../../constants/address";
import route from "./swapRoute";

const { WETH, ETHAlt } = address.tokens;

type SwapQuote = {
  price?: string;
  guaranteedPrice?: string;
  to: string;
  data: string;
  value?: string;
  gas?: string;
  estimatedGas?: string;
  gasPrice?: string;
  protocolFee?: string;
  minimumProtocolFee?: string;
  buyTokenAddress?: string;
  sellTokenAddress?: string;
  buyAmount?: string;
  sellAmount: string;
  estimatedGasTokenRefund?: string;
  sources?: [{ name: string; proportion: string }];
  allowanceTarget?: string;
};

export const getSwapQuote = async (
  sellToken: string,
  buyToken: string,
  sellAmount: string | BigNumber,
): Promise<SwapQuote> => {
  const wrappedBaseToken = WETH.toLowerCase();
  sellToken = sellToken.toLowerCase();
  buyToken = buyToken.toLowerCase();

  if (
    sellToken === buyToken ||
    (sellToken === wrappedBaseToken && buyToken === constants.AddressZero)
  ) {
    return {
      to: constants.AddressZero,
      data: constants.HashZero,
      sellAmount: sellToken === constants.AddressZero ? sellAmount.toString() : "0",
    };
  }

  const params = {
    sellToken: sellToken === constants.AddressZero ? ETHAlt : sellToken,
    buyToken: buyToken === constants.AddressZero ? ETHAlt : buyToken,
    sellAmount: sellAmount.toString(),
    slippagePercentage: "0.1",
  };
  try {
    const response = await axios.get(route.mainnet, {
      params,
    });

    return response.data as SwapQuote;
  } catch (err: any) {
    console.error(err.config);
    throw err.config;
  }
};
