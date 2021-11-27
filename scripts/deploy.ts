// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  // deploy mock frax

  const Frax = await ethers.getContractFactory("FRAX");
  const frax = await Frax.deploy(4);

  await frax.deployed();

  console.log("Greeter deployed to:", frax.address);

  // deploy mock depo

  const Depo = await ethers.getContractFactory("MockOlympusBondDepository");
  const depo = await Depo.deploy(
    
  );

  await depo.deployed();

  console.log("Greeter deployed to:", depo.address);

  // deploy orderbook (on dif chain if possible)

  // deploy settlement, passing in depo as param


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
