pragma solidity ^0.5.1;

import "./MovieContract.sol";

contract FactoryContract {

	uint public contractCount;
	address[] public contractContainer;
	address public recentContract;

	mapping(string => address) public NameToMovieContracts;
	mapping(address => address) public AddressToMovieContracts;
	mapping(uint => address) public IdToMovieContracts;

	function newMovieContract(string memory _movieName) public{
		MovieContract instance = new MovieContract(_movieName,msg.sender);
		recentContract = address(instance);
		contractCount++;
		contractContainer.push(address(instance));
		AddressToMovieContracts[msg.sender] = address(instance);
		IdToMovieContracts[contractCount] = address(instance);
		NameToMovieContracts[_movieName] = address(instance);

	}

	function checkSpecificContract(string memory _name) public view returns(address){
		return NameToMovieContracts[_name];
	}

	function findByAddress(address _owner) public view returns(address){
		return AddressToMovieContracts[_owner];
	}
	
	function findById(uint _id) public view returns(address){
		return IdToMovieContracts[_id];
	}
	

}