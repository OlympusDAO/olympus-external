// SPDX-License-Identifier: MIT

pragma solidity =0.8.0;

library Bytes32Pagination {
    function paginate(
        bytes32[] memory hashes,
        uint page,
        uint limit
    ) internal pure returns (bytes32[] memory result) {
        result = new bytes32[](limit);
        for (uint i; i < limit; i++) {
            if (page * limit + i >= hashes.length) {
                result[i] = bytes32(0);
            } else {
                result[i] = hashes[page * limit + i];
            }
        }
    }
}
