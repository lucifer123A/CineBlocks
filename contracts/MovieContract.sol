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
  uint256 public withdrawCount;
  uint256 public totalInvestment;
  uint256 public totalProfit;

  uint internal rate = 0.001 * 10 ** 18; //ETH per Token

  enum State { PRE_PRODUCTION, PRODUCTION, RELEASED, OVER } // Rate - 0.001, 0.003, profitDependent
  State public currentState = State.PRE_PRODUCTION;
  
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

  struct withdrawDetails{
    address withdrawnBy;
    uint256 amountWithdrawn;
    uint256 time;
    string reason;
  }

   movieDetails public movie;

//Mappings
  mapping(address => bool) public profitAdded;
  mapping (uint256 => withdrawDetails) public withdrawlsByOwner;
  mapping (address => investorDetails)public investors;
  mapping (address => uint256 ) public investedAmount;

  modifier  onlyOwner() { 
    require(msg.sender == owner, "Caller is not the owner"); 
    _; 
  }
  
//Events
  event TokenSold(address buyer,uint256 amount);
  event etherWithdrawn(address rec,uint256 amount);
  event MovieState(State _currentState, uint _currentRate);



  function addMovie(string memory _details, string memory _ipfs, uint256 _timeInDays) public onlyOwner{
    movie.name = movieName;
    movie.details = _details;
    movie.ipfsHash = _ipfs;
    deadline = now + _timeInDays * 1 days;
  }

  function createMovieToken(string memory _symbol, string memory _name, uint256 _totalSupply) public onlyOwner{
      token = new TokenFactory(_symbol, _name, _totalSupply);
      tokenAddress = address(token);
      tokenName = _name;
      totalSupply = _totalSupply;
  }

  function updateState(State _state) public onlyOwner returns (uint _rate) {
    currentState = _state;
    if(_state == State.PRODUCTION) {
      rate = 0.003 * 10 ** 18;
    }
    // else if(_state == State.RELEASED) {
    //   rate = 0.1;
    // }
    emit MovieState(currentState, rate);
    return rate;
  }

  function reportProfit(string memory _source) public payable onlyOwner {
    require(currentState == State.RELEASED);
    require(msg.value > 0);
    totalProfit += msg.value;
    rate = totalProfit.div(totalInvestment);
    emit MovieState(currentState, rate);    
  }

//amountToGive = rate.mul(msg.value); // if user send 1 ETH it will give 1000 tokens.
  function buyMovieTokens(string memory _name, string memory _contact) public payable{
    require (msg.value > 0);
    token = TokenFactory(tokenAddress);
    // uint256 _numberOfTokens = tokenPrice.mul(msg.value);
    uint256 _numberOfTokens = msg.value.div(rate);
    address payable _to = msg.sender;

    require(token.balanceOf(address(this)) >= _numberOfTokens, "Token Quantity Exceeded");
    investorCount++;
    investors[msg.sender] = investorDetails(_name, _contact,_to,_numberOfTokens.div(1000000000000000000));
    investedAmount[_to] = msg.value;
    token.transfer(_to,_numberOfTokens);
    totalTokenSold += _numberOfTokens;
    totalInvestment += msg.value;
    emit TokenSold(_to,_numberOfTokens);
  }

  function  useEther(uint256 _amount, string memory _reason) public onlyOwner{
    require(now > deadline, "Deadline isn't over yet");
    require (address(this).balance > _amount, "Not Enough ETHER to Withdraw");
    withdrawCount++;
    withdrawlsByOwner[withdrawCount] = withdrawDetails(msg.sender, _amount,now, _reason);
    owner.transfer(_amount);   
    emit etherWithdrawn(msg.sender,_amount);
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
    // uint256 totalEth = _amountOfTokens.mul(1000000000000000);
    uint256 totalEth = _amountOfTokens.mul(rate);
    require(investedAmount[msg.sender] > totalEth);
    require(address(this).balance > totalEth, "Not Enough Ether to transfer");
    investedAmount[user] -= totalEth;
    user.transfer(totalEth);
    //Deaduct User's Token Balnace ????
    //Transfer the user's submitted tokens to the contract.
  }
    
   
}
