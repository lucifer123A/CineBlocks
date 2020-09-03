import React, {useState, useEffect} from 'react';
import { Navbar, Image, Row, Card, Container, Col, Form, Button } from 'react-bootstrap';
import MovieContract from '../contracts/MovieContract.json';
import Web3 from 'web3';
import Footer from './Footer';

const movieStates = ['PRE_PRODUCTION', 'PRODUCTION', 'RELEASED', 'OVER'] 

function InfoPage (props) {

    const [web3, setWeb3] = useState()
    const [instance, setInstance] = useState()
    const [account, setAccount] = useState()
    const [movieData, setMovieData] = useState({})
    const [tokensOwned, setTokensOwned] = useState()
    const [buyTokens, setBuyTokens] = useState()
    const [updateData, setUpdateData] = useState(false)
    const [infoText, setInfoText] = useState('')
    const [amount, setAmount] = useState()
    const [amount1, setAmount1] = useState()
    // const [ethCost, setEthCost] = useState() //can display eth cost 

    useEffect(async () => {
 
        await loadWeb3()
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        const instance = new web3.eth.Contract(
            MovieContract.abi,
            props.match.params.movieId
        );
        window.movieContract = instance //debugging
        await fetchData(instance)
        setWeb3(web3)
        setAccount(accounts[0])
        setInstance(instance)

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
    }

    const fetchData = async (instance) => {
            console.log('fetching data')
            let owner = await instance.methods.owner().call()
            let rate = await instance.methods.rate().call()
            let tokenName = await instance.methods.tokenName().call()
            let tokenAddress = await instance.methods.token().call()
            let deadline = await instance.methods.deadline().call()
            let creationDate = await instance.methods.creationDate().call()
            let totalInvestment = await instance.methods.totalInvestment().call()
            let totalProfit = await instance.methods.totalProfit().call()
            let state = await instance.methods.currentState().call()
            let movie = await instance.methods.movie().call()

            rate = rate.toNumber() / (10 ** 18)
            deadline = handleDate(deadline)
            creationDate = handleDate(creationDate)
            totalInvestment = totalInvestment.toNumber() / (10 ** 18)
            totalProfit = totalProfit.toNumber() / (10 ** 18)
            setMovieData({ name: movie.name, owner: owner, summary: movie.details, rate: rate, tokenName: tokenName, tokenAddress: tokenAddress, deadline: deadline, creationDate: creationDate, totalInvestment: totalInvestment, totalProfit: totalProfit, ipfsHash: movie.ipfsHash, state: movieStates[state]})
        }

        useEffect(() => {
            if(movieData !== {}) {
                console.log('fetched ', movieData)
            }
            if(movieData === {} && updateData) {
                fetchData(instance)
                setUpdateData(false)
            }
        }, [movieData])

        useEffect(() => {
            if(updateData) {
                setMovieData({})
                // fetchData(instance)
                // setUpdateData(false)
            }
        }, [updateData])


    const handleDate = timeIn => {
        timeIn = timeIn.toNumber()
        timeIn *=1000
        let d = new Date(timeIn)
        d = d.toUTCString()
        return d
    }

    useEffect(() => {
        if(!movieData){
            console.log('Movie data fetched', movieData)
        }
    }, [movieData])

    const buyToken = async (e) => {
        e.preventDefault()
        setInfoText('Initializing buy method')
        let x = Math.floor(Math.random() * 100).toString()
        let n = 'Anon Investor ' + x
        let ethCost = amount * 10 ** 18 * movieData.rate

        await instance.methods.buyMovieTokens(n, x)
            .send({
                from: account,
                gas: 5000000,
                value: web3.utils.toHex(ethCost)
            })
            .then(tx => {
                console.log('tokens bought ', tx)
            })
            .catch(err => {
                console.log('Error buying', err);
                setInfoText('Error buying tokens.')
            })
        setInfoText('Tokens purchased successfully.')
    }

    const withdrawToken = (e) => {
        e.preventDefault()
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
                        Description : <br /><hr />
                        {movieData.summary}
                    </Col>
                    <Col>
                        <Button variant='outline-primary' onClick={()=>setUpdateData(true)}>Refresh Data</Button>
                    </Col>
                </Row>
                <hr /><br />
                <Row  className='justify-content-md'>
                    <Col>
                        CreationDate: {movieData.creationDate}
                    </Col>
                    <Col>
                        Deadline: {movieData.deadline}
                    </Col>
                    <Col>
                        Owner:{movieData.owner}
                    </Col>
                </Row>
                <hr /><br />
                <Row className='justify-content-md-center'>
                    <Col>
                        CurrentRate: {movieData.rate} ETH / Token
                    </Col>
                    <Col>
                        Total Investment: {movieData.totalInvestment} ETH
                    </Col>
                    <Col>
                        Project State: {movieData.state}                    
                    </Col>
                    <Col>
                        Total Profit: {movieData.totalProfit} ETH
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

                        <h4>Tokens Owned : {movieData.tokensOwned}</h4>

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
                        { infoText === '' ? '' : <div>Transaction Status : {infoText}</div>}
                        <br></br>
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
                    {movieData ? <Main /> : <Card.Title>Loading</Card.Title>}
                </Card>
            </Container>
            <Footer></Footer>
        </div>
    );
    
}

export default InfoPage;