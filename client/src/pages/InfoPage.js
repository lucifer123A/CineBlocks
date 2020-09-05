import React, {useState, useEffect} from 'react';
import { Navbar, Image, Row, Card, Container, Col, Form, Button } from 'react-bootstrap';
import MovieContract from '../contracts/MovieContract.json';
import TokenFactory from '../contracts/TokenFactory.json';
import Web3 from 'web3';
import Footer from './Footer';
import ProgressBar from 'react-bootstrap/ProgressBar'


const movieStates = ['PRE_PRODUCTION', 'PRODUCTION', 'RELEASED', 'OVER'] 

function InfoPage (props) {

    const [web3, setWeb3] = useState()
    const [instance, setInstance] = useState()
    const [account, setAccount] = useState()
    const [movieData, setMovieData] = useState(null)
    const [tokensOwned, setTokensOwned] = useState()
    const [buyTokens, setBuyTokens] = useState()
    const [updateData, setUpdateData] = useState(false)
    const [infoText, setInfoText] = useState('')
    const [amount, setAmount] = useState()
    const [amount1, setAmount1] = useState()
    const [progress, setProgress] = useState({show: false, val: 0})

    useEffect(() => {
        loadWeb3()
    }, [])


    async function loadWeb3() {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
        } else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider);
        } else {
          window.alert(
            "Non-Ethereum browser detected. You should consider trying MetaMask!"
          );
        }
        const web3 = window.web3;
        web3.eth.handleRevert = true
        const accounts = await web3.eth.getAccounts();
        const instance = new web3.eth.Contract(
            MovieContract.abi,
            props.match.params.movieId
        );
        window.movieContract = instance //debugging
        await fetchData(instance, web3, accounts[0])
        setWeb3(web3)
        setAccount(accounts[0])
        setInstance(instance)
    }

    const fetchData = async (instance, web3, account) => {
            console.log('fetching data')
            let owner = await instance.methods.owner().call()
            let rate = await instance.methods.rate().call()
            let tokenName = await instance.methods.tokenName().call()
            let tokenAddress = await instance.methods.token().call()
            let totalInvestment = await instance.methods.totalInvestment().call()
            let totalProfit = await instance.methods.totalProfit().call()
            let state = await instance.methods.currentState().call()
            let movie = await instance.methods.movie().call()
            // let totalTokensSold = await instance.methods.totalTokensSold().call()
            let tokenSymbol = ''
            if(web3 && tokenAddress && account) {
                let tokeninstance = new web3.eth.Contract(TokenFactory.abi, tokenAddress);
                console.log(tokeninstance, 'dvdvc', tokeninstance.methods)
                let tokens = await tokeninstance.methods.balanceOf(account).call();
                tokens = tokens.toString()
                tokenSymbol = await tokeninstance.methods.symbol().call()
                setTokensOwned(tokens)
            }

            rate = rate.toString()
            rate /= (10 ** 18)
            let deadline = handleDate(movie.deadline)
            let creationDate = handleDate(movie.creationDate)
            totalInvestment = totalInvestment.toString() 
            totalInvestment /= (10 ** 18)
            totalProfit = totalProfit.toString() 
            totalProfit /= (10 ** 18)
            setMovieData({ name: movie.name, owner: owner, summary: movie.details, rate: rate, tokenName: tokenName, tokenSymbol: tokenSymbol,tokenAddress: tokenAddress, deadline: deadline, creationDate: creationDate, totalInvestment: totalInvestment, 
                // totalTokensSold: totalTokensSold.toString() ,
                totalProfit: totalProfit, ipfsHash: movie.ipfsHash, state: movieStates[state]})
        }

        useEffect(() => {
            if(movieData !== null) {
                console.log('fetched ', movieData)
            }
            // if(movieData === {} && updateData) {
            //     fetchData(instance)
            //     setUpdateData(false)
            // }
        }, [movieData])

        useEffect(() => {
            if(updateData) {
                setMovieData(null)
                fetchData(instance, web3, account)
                setUpdateData(false)
            }
        }, [updateData])


    const handleDate = timeIn => {
        timeIn = timeIn.toNumber()
        timeIn *=1000
        let d = new Date(timeIn)
        d = d.toUTCString()
        d = d.split(' ').slice(0,5).join(' ')
        return d
    }

    useEffect(() => {
        if(!movieData){
            console.log('Movie data fetched', movieData)
        }
    }, [movieData])

    const buyToken = (e) => {
        e.preventDefault()
        setInfoText('Initializing buy method')
        let x = Math.floor(Math.random() * 100).toString()
        let n = 'Anon Investor ' + x
        let ethCost = amount * 10 ** 18 * movieData.rate
        setInfoText(`At current rate, buying ${amount} ${movieData.tokenSymbol} for ${amount * movieData.rate} ETH..`)
        instance.methods.buyMovieTokens(n, x)
            .send({
                from: account,
                gas: 5000000,
                value: web3.utils.toHex(ethCost)
            })
            .on('transactionHash', h => {
                console.log('tx hash', h)
                setProgress({show: true, val: 5})
            })
            .on('confirmation', c => {
                setProgress({show: true, val: Math.floor(c/24 * 100)})
            })
            .then(tx => {
                console.log('tokens bought ', tx)
                setInfoText(`Tokens purchased successfully.`)
                setProgress({show: false, val: 0})
                setUpdateData(true)

            })
            .catch(err => {
                console.log('Error buying', err);
                setProgress({show: false, val: 0})
                setInfoText('Error buying tokens.')
            })
    }

    const withdrawToken = (e) => {
        e.preventDefault()
        setInfoText('Initializing withdraw method')
        // let amount12 = amount1 * 10 ** 18
        setInfoText(`At current rate, selling ${amount1} ${movieData.tokenSymbol} for ${amount1 * movieData.rate} ETH..`)
        instance.methods.unlockEther(amount1)
            .send({
                from: account,
                gas: 5000000
            })
            .on('transactionHash', h => {
                console.log('tx hash', h)
                setProgress({show: true, val: 5})
            })
            .on('confirmation', c => {
                setProgress({show: true, val: Math.floor(c/24 * 100)})
            })
            .then(tx => {
                console.log('withdrawn ', tx)
                setInfoText('Tokens withdrawn')
                setProgress({show: false, val: 0})
            })
            .catch(err => {
                setInfoText('Error withdrawing tokens.')
                console.log('error withdrawing ', err)
                setProgress({show: false, val: 0})
            })

    }

    const Main = () => (
        <Card.Body>
            <Card.Title className="movieTitle">
                {movieData.name}
            </Card.Title>
            <Card.Text>
                <Row >
                    {/* <Col>
                        <Image width="80%" src={`http://localhost:5000/${this.state.movieData.image.data}`} alt={this.state.movieData.name}></Image>
                    </Col> */}
                    <Col xs={8}>
                        Description :  <text style={{color:"white"}}>{movieData.summary}</text>
                         <br /><hr />
                    </Col>
                    <Col>
                        <Button variant='outline-primary' onClick={()=>setUpdateData(true)}>Refresh Data</Button>
                    </Col>
                    <hr /><br />
                </Row>
                <Row  className='justify-content-md'>
                    <Col>
                        CreationDate: <text style={{color:"white"}}>{movieData.creationDate}</text>
                    </Col>
                    <Col>
                        Deadline: <text style={{color:"white"}}>{movieData.deadline}</text>
                    </Col>
                    <Col>
                        Owner:<text style={{color:"white", fontSize:'80%'}}>{movieData.owner}</text>
                    </Col>
                </Row>
                <hr /><br />
                <Row className='justify-content-md-center'>
                    <Col>
                        CurrentRate: <text style={{color:"white"}}>{movieData.rate} ETH / {movieData.tokenSymbol ? movieData.tokenSymbol : 'Token'}</text>
                    </Col>
                    <Col>
                        Total Investment: <text style={{color:"white"}}>{movieData.totalInvestment} ETH</text>
                    </Col>
                    <Col>
                        Project State: <text style={{color:"white"}}>{movieData.state}</text>                   
                    </Col>
                    <Col>
                        Total Profit: <text style={{color:"white"}}>{movieData.totalProfit} ETH</text>
                    </Col>
                </Row>
                <hr /><br />
                <Row>
                    <Col>
                        <Form>
                            <Form.Row className="justify-content-md-center" lg={2}>
                                <Form.Group as={Col} controlId="BuyTokens">
                                    <Form.Label>Buy Token : </Form.Label>
                                    <Form.Control type="text" placeholder='100' value={amount} name="BuyTokens" onChange={e=>setAmount(e.target.value)} required />
                                </Form.Group>
                            </Form.Row>
                            <Button variant="warning" onClick={buyToken}>Buy Token</Button>
                        </Form>
                    </Col>
                    <Col className="justify-content-md-center">

                        {/* <h4>Tokens Owned : <text style={{color:"white"}}>{tokensOwned} {movieData.tokenSymbol} ({(tokensOwned/movieData.totalTokensSold) * 100} %)</text></h4> */}
                        <hr /><br />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form>
                            <Form.Row className="justify-content-md-center" lg={2}>
                                <Form.Group as={Col} controlId="Withdraw">
                                    <Form.Label>Withdraw Token : </Form.Label>
                                    <Form.Control type="text" placeholder='100' value={amount1} name="BuyTokens" onChange={e=>setAmount1(e.target.value)} required />
                                </Form.Group>
                            </Form.Row>
                            <Button variant="warning" onClick={withdrawToken}>Withdraw Token</Button>
                        </Form>
                    </Col>
                    <Col className="justify-content-md-center">
                        Transaction Status : <text style={{color:'white'}}>{infoText}</text>
                        {progress.show && <div style={{padding:'15px'}}>
                            <ProgressBar animated label={`${progress.val}`} now={progress.val} variant='success'/> 
                        </div>}
                    </Col>
                </Row>
            </Card.Text>
        </Card.Body>
    )

   
    return (
        <div className="infoPage">
            <Navbar>
                <Navbar.Brand>
                    <a href="#">
                        <Image src={require("../images/logo2.png")}></Image>
                    </a>
                </Navbar.Brand>
            </Navbar>

            <Container>
                <Card className="infoCard">
                    {movieData === null ? <Card.Title>Loading</Card.Title> : <Main />}
                </Card>
            </Container>
            <Footer></Footer>
        </div>
    );
    
}

export default InfoPage;