pragma solidity ^0.5.1;

import "./SafeMath.sol";

contract MovieContract {
  using SafeMath for uint256;

  address payable public owner;
  address public tokenAddress;
  string public movieName;
  string public tokenName;
  uint256 public deadline;
  uint256 public totalSupply;
  uint256 public totalTokenSold;
  uint256 public tokenPrice = 1000;
  uint256 public creationDate;
  uint256 public investorCount;
  uint256 public withdrawCount;

    


constructor(string memory _movieName, address payable _movieCreator) public{
    owner = _movieCreator;
    movieName = _movieName;
    creationDate = now;
  }

  struct movieDetails{
    string name;
    string details;
    string ipfsHash;
  }

  struct investorDetails{
    string name;
    string contactDetails;
    address payable investorAddress;
    uint256 tokensBought;
  }

  struct withdrawDetails{
    address withdrawnBy;
    uint256 amountWithdrawn;
    uint256 time;
    string reason;
  }

}