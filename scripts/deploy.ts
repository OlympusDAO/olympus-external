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


  // deploy mock dai

  const Dai = await ethers.getContractFactory("DAI");
  const dai = await Dai.deploy(4);

  await dai.deployed();

  console.log("Greeter deployed to:", dai.address);


  // deploy mock frax

  const Frax = await ethers.getContractFactory("FRAX");
  const frax = await Frax.deploy(4);

  await frax.deployed();

  console.log("Greeter deployed to:", frax.address);


  // deploy mock OHM

  const Ohm = await ethers.getContractFactory("MockOHM");
  const ohm = await Ohm.deploy();

  await ohm.deployed();

  console.log("Greeter deployed to:", ohm.address);


  // deploy mock depo

  const Depo = await ethers.getContractFactory("MockOlympusBondDepository");

  // address _OHM,
  // address _principle,
  // address _treasury,
  // address _DAO,
  // address _bondCalculator
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
