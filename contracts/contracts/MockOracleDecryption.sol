// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockOracleDecryption {
    event OracleCallback(uint256 indexed requestId, bytes cleartexts, bytes proof);

    function mockDecryptionCallback(
        address targetContract,
        bytes4 callbackSelector,
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory proof
    ) external {
        (bool success, ) = targetContract.call(
            abi.encodeWithSelector(callbackSelector, requestId, cleartexts, proof)
        );
        require(success, "Callback failed");
        emit OracleCallback(requestId, cleartexts, proof);
    }
}
