pragma solidity ^0.5.1;

import "./SafeMath.sol";
import "./MovieContract.sol";

contract FactoryContract {
  
    using SafeMath for uint256;

	uint256 public contractCount;
	address[] public contractContainer;
	address public recentContract;

	mapping(uint256 => address) public IdToMovieContracts;

	function newMovieContract(string memory _movieName) public returns(MovieContract){
		MovieContract instance = new MovieContract(_movieName,msg.sender);
		recentContract = address(instance);
		contractCount++;
		contractContainer.push(address(instance));
		IdToMovieContracts[contractCount] = address(instance);

	}

	function  checkSpecificContract(uint256 _id) public view returns(address){
		return IdToMovieContracts[_id];
	}

}