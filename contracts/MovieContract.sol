pragma solidity ^0.5.1;

import "./TokenFactory.sol";
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
  uint256 public requestCount;
  uint256 public voterCount;
  
TokenFactory public token;


constructor(string memory _movieName, address payable _movieCreator) public{
    owner = _movieCreator;
    movieName = _movieName;
    creationDate = now;
  }
// Stucts
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

  struct WithdrawRequest{
  	 uint256 amountOfEth;
     uint256 numberOfVoters;
  	 string description;
  	 string receiverDesignation;
     bool completed;
     address payable recipient;
    
    mapping(address=>bool) voters;
  }

   movieDetails public movie;

//Mappings
  mapping (address => bool) public profitAdded;
  mapping (address => investorDetails)public investors;
  mapping (address => uint256 ) public investedAmount;
  mapping (uint256 => WithdrawRequest) public requests;
  

  modifier  onlyOwner() { 
    require(msg.sender == owner, "Caller is not the owner"); 
    _; 
  }
  
//Events
  event TokenSold(address buyer,uint256 amount);
  event etherWithdrawn(address rec,string designation,uint256 amount);



  function addMovie(string memory _details, string memory _ipfs, uint256 _timeInDays) public onlyOwner{
    movie.name = movieName;
    movie.details = _details;
    movie.ipfsHash = _ipfs;
    deadline = now + _timeInDays * 1 days;
  }

  function  createMovieToken(string memory _symbol, string memory _name, uint256 _totalSupply) public onlyOwner{
      token = new TokenFactory(_symbol, _name, _totalSupply);
      tokenAddress = address(token);
      tokenName = _name;
      totalSupply = _totalSupply;
  }

//amountToGive = rate.mul(msg.value); // if user send 1 ETH it will give 1000 tokens.
  function buyMovieTokens(string memory _name, string memory _contact) public payable{
    require (msg.value > 0);
    token = TokenFactory(tokenAddress);
    uint256 _numberOfTokens = tokenPrice.mul(msg.value);
    address payable _to = msg.sender;

    require(token.balanceOf(address(this)) >= _numberOfTokens, "Token Quantity Exceeded");
    investorCount++;
    investors[msg.sender] = investorDetails(_name, _contact,_to,_numberOfTokens.div(1000000000000000000));
    investedAmount[_to] = msg.value;
    token.transfer(_to,_numberOfTokens);
    totalTokenSold += _numberOfTokens;
    emit TokenSold(_to,_numberOfTokens);
  }

  function  initiateRequest(string memory _desc,address payable _rec,string memory _receiverDesignation,uint256 _val) public onlyOwner{
  	requestCount++;
  	requests[requestCount] = WithdrawRequest(_val.mul(1 ether),0,_desc,_receiverDesignation,false,_rec);
  }
  
  function startVoting(uint256 _index) public{
  		require (investedAmount[msg.sender] > 0,"Investor Not Eligible to VOTE");
  		require (requests[_index].voters[msg.sender] == false,"Vote Already registered from this addreess");

  		requests[_index].voters[msg.sender] = true;
  		requests[_index].numberOfVoters++;	
  }
  

  function  withdrawEther(uint256 _index) public onlyOwner{
    require (requests[_index].completed == false,"This Request already Executed");
    require (requests[_index].numberOfVoters > investorCount.div(2),"Vote Result is NEGATIVE");

    requests[_index].recipient.transfer(requests[_index].amountOfEth);
    requests[_index].completed == true;
    
    
    emit etherWithdrawn(requests[_index].recipient,requests[_index].receiverDesignation,requests[_index].amountOfEth);
  }
  

function getBalance() public view returns(uint256){
    return address(this).balance;
}

  function unlockEther(uint256 _amountOfTokens) public returns(uint256){
    require(now < deadline, "Deadline already Achieved");
    address payable user = msg.sender;
    token = TokenFactory(tokenAddress);
  
    uint256 totalTokens = token.balanceOf(user);
    require (_amountOfTokens.mul(1000000000000000000) < totalTokens, "Not Enough tokens");
    uint256 totalEth = _amountOfTokens.mul(1000000000000000);
    require(investedAmount[msg.sender] > totalEth);
    require(address(this).balance > totalEth, "Not Enough Ether to transfer");
    investedAmount[user] -= totalEth;
    user.transfer(totalEth);
    //Deaduct User's Token Balnace ????
    //Transfer the user's submitted tokens to the contract.
  }
    
   
}
