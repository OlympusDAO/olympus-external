/* eslint-disable node/no-unpublished-import */
import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { utils } from "ethers";
import address from "../libs/constants/address";

const contractName = "Olympus_V2_Zap_In";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const { DEPO_V2, OlympusStaking } = address.ohm;
  const { OHM, sOHM, gOHM } = address.tokens;

  const args: any[] = [DEPO_V2, OlympusStaking, OHM, sOHM, gOHM];

  console.log("Deploying", contractName, "with", deployer);

  await deploy(contractName, {
    from: deployer,
    args,
    log: true,
    // gasPrice: utils.hexlify(utils.parseUnits("40", "gwei")),
  });
};
export default func;
func.tags = [contractName];
