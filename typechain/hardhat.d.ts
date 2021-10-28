/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomiclabs/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "IBondDepository",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBondDepository__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "IERC20Metadata",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Metadata__factory>;
    getContractFactory(
      name: "IOlympusZap",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IOlympusZap__factory>;
    getContractFactory(
      name: "IStaking",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IStaking__factory>;
    getContractFactory(
      name: "IWETH",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IWETH__factory>;
    getContractFactory(
      name: "IwsOHM",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IwsOHM__factory>;
    getContractFactory(
      name: "IOwnable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IOwnable__factory>;
    getContractFactory(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ownable__factory>;
    getContractFactory(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ownable__factory>;
    getContractFactory(
      name: "ZapBaseV22",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ZapBaseV22__factory>;
    getContractFactory(
      name: "OlympusZap",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.OlympusZap__factory>;

    getContractAt(
      name: "IBondDepository",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IBondDepository>;
    getContractAt(
      name: "IERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "IERC20Metadata",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Metadata>;
    getContractAt(
      name: "IOlympusZap",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IOlympusZap>;
    getContractAt(
      name: "IStaking",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IStaking>;
    getContractAt(
      name: "IWETH",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IWETH>;
    getContractAt(
      name: "IwsOHM",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IwsOHM>;
    getContractAt(
      name: "IOwnable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IOwnable>;
    getContractAt(
      name: "Ownable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Ownable>;
    getContractAt(
      name: "Ownable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Ownable>;
    getContractAt(
      name: "ZapBaseV22",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ZapBaseV22>;
    getContractAt(
      name: "OlympusZap",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.OlympusZap>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.utils.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
  }
}
