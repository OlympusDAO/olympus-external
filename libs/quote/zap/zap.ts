import { BigNumber, constants } from "ethers";
import axios from "axios";
import protocol from "./protocol";
import { zapInRoute } from "./zapRoute";
type ZapIn = {
  toWhomToIssue: string;
  sellToken: string;
  sellAmount: string | BigNumber;
  poolAddress: string;
  protocol: protocol;
  network?: string;
  affiliateAddress?: string;
};

type ZapQuote = {
  to: string;
  from: string;
  data: string;
  value: string;
  sellTokenAddress: string;
  sellTokenAmount: string;
  buyTokenAddress: string;
  minTokens: string;
  gasPrice: string;
  gas: string;
};

export const getZapInQuote = async ({
  toWhomToIssue,
  sellToken,
  sellAmount,
  poolAddress,
  protocol,
  network = "ethereum",
  affiliateAddress = constants.AddressZero,
}: ZapIn): Promise<ZapQuote> => {
  const params = {
    api_key: process.env.ZAPPER_API_KEY,
    ownerAddress: toWhomToIssue,
    sellAmount: sellAmount.toString(),
    sellTokenAddress: sellToken,
    poolAddress: poolAddress.toLowerCase(),
    affiliateAddress,
    gasPrice: "250000000000",
    slippagePercentage: "0.1",
    skipGasEstimate: true,
    network,
  };

  try {
    const response = await axios.get(zapInRoute(protocol), { params });
    return response.data as ZapQuote;
  } catch (err: any) {
    console.error(err.config);
    throw err.response.data;
  }
};
