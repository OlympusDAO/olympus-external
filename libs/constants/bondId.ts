// BondId from the available bonds:
// Currently the bondIds avaialable can be check directly from the page https://app.olympusdao.finance/#/bonds by clicking on any bond or by
// calling Depository.liveMarkets() @ 0x9025046c6fb25Fb39e720d97a8FD881ED69a1Ef6
// 13 => FRAX
// 11 => UST
// 12 => DAI

/* eslint-disable no-unused-vars */
enum BondId {
  UST = 11,
  DAI = 12,
  FRAX = 13,
}

export default BondId;
