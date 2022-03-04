// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IFYDai.sol";

interface IPool is IERC20 {
    function dai() external view returns (IERC20);

    function fyDai() external view returns (IFYDai);

    function getDaiReserves() external view returns (uint128);

    function getFYDaiReserves() external view returns (uint128);

    function sellDai(
        address from,
        address to,
        uint128 daiIn
    ) external returns (uint128);

    function buyDai(
        address from,
        address to,
        uint128 daiOut
    ) external returns (uint128);

    function sellFYDai(
        address from,
        address to,
        uint128 fyDaiIn
    ) external returns (uint128);

    function buyFYDai(
        address from,
        address to,
        uint128 fyDaiOut
    ) external returns (uint128);

    function sellDaiPreview(uint128 daiIn) external view returns (uint128);

    function buyDaiPreview(uint128 daiOut) external view returns (uint128);

    function sellFYDaiPreview(uint128 fyDaiIn) external view returns (uint128);

    function buyFYDaiPreview(uint128 fyDaiOut) external view returns (uint128);

    function mint(
        address from,
        address to,
        uint256 daiOffered
    ) external returns (uint256);

    function burn(
        address from,
        address to,
        uint256 tokensBurned
    ) external returns (uint256, uint256);
}
