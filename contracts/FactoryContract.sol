pragma solidity ^0.5.1;

import "./SafeMath.sol";
import "./MovieContract.sol";

contract FactoryContract {
  
    using SafeMath for uint256;

	uint256 public contractCount;
	address[] public contractContainer;
	address public recentContract;

	mapping(string => address) public NameToMovieContracts;

	function newMovieContract(string memory _movieName) public{
		MovieContract instance = new MovieContract(_movieName,msg.sender);
		recentContract = address(instance);
		contractCount++;
		contractContainer.push(address(instance));
		NameToMovieContracts[_movieName] = address(instance);

	}

	function  checkSpecificContract(string memory _name) public view returns(address){
		return NameToMovieContracts[_name];
	}

}