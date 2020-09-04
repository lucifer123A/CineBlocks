import React, {useState, useEffect} from 'react'
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import TokenFactory from '../contracts/TokenFactory.json';
import FactoryContract from '../contracts/FactoryContract.json';
import MovieContract from '../contracts/MovieContract.json';

const movieStates = ['PRE_PRODUCTION', 'PRODUCTION', 'RELEASED', 'OVER'] 

export default function AdminPanel(props) {
    // const {web3, accounts, movieContractAddress, instance, tokenSymbol} = props.passableProps;

    const [infoText, setInfoText] = useState('')
    const [movieData, setMovieData] = useState()
    const [statusInput, setStatusInput] = useState('')
    const [stateOption, setStateOption] = useState()
    const [profitInput, setProfitInput] = useState()
    const [fundsInput, setFundsInput] = useState()
    const [updateData, setUpdateData] = useState(false)
    const [web3, setWeb3] = useState()
    const [account, setAccount] = useState()
    const [instance, setInstance] = useState()
    const [movieAddress, setMovieAddress] = useState('')


    useEffect(() => {
        fetchData()
    })

    const getUtils = async () => {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts();
        const factoryInstance = window.FactoryInstance

        await factoryInstance.methods.findByAddress(accounts[0])
            .call()
            .then(res => {
                console.log('contracts of user', res)
                if(res === "0x0000000000000000000000000000000000000000") {
                    alert('No contract Found.')
                }
                setMovieAddress(res)
            })
            .catch(err => {
                console.log('err')
                setMovieAddress("0x0000000000000000000000000000000000000000")
            })
        if(movieAddress !== '') {
            const instance = new web3.eth.Contract(
                MovieContract.abi,
                movieAddress
            );
            window.movieContract = instance //debugging
            await fetchData(instance, web3, accounts[0])
            setWeb3(web3)
            setAccount(accounts[0])
            setInstance(instance)
        }
        
    }

    const fetchData = async (instance, web3, account) => {
        try{
            setInfoText('fetching data')
            console.log('fetching ')
            let rate = await instance.methods.rate().call()
            console.log('rate fetched ', rate)
            let tokenAddress = await instance.methods.token().call()
            let totalInvestment = await instance.methods.totalInvestment().call()
            let totalProfit = await instance.methods.totalProfit().call()
            let state = await instance.methods.currentState().call()
            let movie = await instance.methods.movie().call()
            console.log('here1')
            let tokenSymbol = ''
            if(web3 && tokenAddress && account) {
                console.log('here2')
                let tokeninstance = new web3.eth.Contract(TokenFactory.abi, tokenAddress);
                tokenSymbol = await tokeninstance.methods.symbol().call()
            }
            console.log('here3', tokenSymbol)
            rate = rate.toNumber() / (10 ** 18)
            let deadline = handleDate(movie.deadline)
            let creationDate = handleDate(movie.creationDate)
            totalInvestment = totalInvestment.toString() 
            totalInvestment /= (10 ** 18)
            totalProfit = totalProfit.toString() 
            totalProfit /= (10 ** 18)
            console.log('here5')
            setMovieData({ name: movie.name, rate: rate, tokenSymbol: tokenSymbol, tokenAddress: tokenAddress, deadline: deadline, creationDate: creationDate, totalInvestment: totalInvestment, totalProfit: totalProfit, ipfsHash: movie.ipfsHash, state: movieStates[state]})
            setInfoText('fetched')
        }
        catch(err) {
            console.log(err)
        }
    }

    const handleDate = timeIn => {
        timeIn = timeIn.toNumber()
        timeIn *=1000
        let d = new Date(timeIn)
        d = d.toUTCString()
        return d
    }

    useEffect(() => {
        if(updateData) {
            setMovieData(null)
            fetchData(instance, web3,account)
            setUpdateData(false)
        }
    }, [updateData])


    const handleStatus = e => {
        e.preventDefault()
    }

    const handleState = e=> {
        e.preventDefault()

    }

    const handleProfit = e => {
        e.preventDefault()

    }

    const handleFunds = e => {
        e.preventDefault()

    }

    if(movieAddress === "0x0000000000000000000000000000000000000000") return <strong><h4>No project found.</h4></strong>

    if(!movieData) return <span><h4>Project Found. Loading ...</h4></span>

    return (
        <Card.Text>
            <Row className='justify-content-md-center'>
                <Col>
                    Project Name: {movieData.name}
                </Col>
                <Col>
                    <Button variant='outline-primary' onClick={()=>setUpdateData(true)}>Refresh Data</Button>
                    <br /><hr />
                </Col>
            </Row>
            <Row className='justify-content-md-center'>
                <Col>
                    Creation Date: {movieData.creationDate}
                </Col>
                <Col>
                    Deadline : {movieData.deadline}
                    <br /><hr />
                </Col>
            </Row>
            <Row className='justify-content-md-center'>
                <Col>
                    Total Investment: {movieData.totalInvestment} ETH
                </Col>
                <Col>
                    Total Profit: {movieData.profit} ETH
                </Col>
                <Col>
                    Investor Count: {movieData.investorCount}
                    <br /><hr />
                </Col>
            </Row>
            
            <Row className='justify-content-md-center'>
                <Col>
                    Current State : {movieData.state}
                </Col>
                <Col>
                    Current Rate : {movieData.rate} ETH / {movieData.tokenSymbol}
                </Col>
                <Col>
                    Release Limit : {movieData.maxReleaseLimit}
                    <br /><hr />
                </Col>
            </Row>
            
            <Form>
                <Form.Row className="justify-content-md-center">
                    <Form.Group as={Col} controlId="status">
                        <Form.Label>Update Project Status :</Form.Label>
                        <Form.Control type="text" name="updateProject" value={statusInput} onChange={e=>setStatusInput(e.target.value)} placeholder='Enter recent project updates.' />
                        <Button variant='warning' onClick={handleStatus}>Update</Button>
                    </Form.Group>
                    <Form.Group as={Col} controlId="state">
                        <Form.Label>Update Project State :</Form.Label>
                        <Form.Control as='select' name="state" id='inlineFormCustomSelect' custom onChange={e=>console.log(e)} > 
                            {movieStates.map((val, index) => (
                                <option value={index}>{val}</option>
                            ))}
                        </Form.Control>
                        <Button variant='warning' onClick={handleState}>Update</Button>
                    </Form.Group>
                </Form.Row> 
                <Form.Row className="justify-content-md-center">
                    <Form.Group as={Col} controlId="reportprofit">
                        <Form.Label>Report Profit :</Form.Label>
                        <Form.Control type="text" name="reportprofit" value={profitInput} onChange={e=>setProfitInput(e.target.value)} placeholder='0 ETH' />
                        <Button variant='warning' onClick={handleProfit}>Report</Button>
                    </Form.Group>
                    <Form.Group as={Col} controlId="withdrawEth">
                        <Form.Label>Withdraw Funds :</Form.Label>
                        <Form.Control type="text" name="withdraw" value={fundsInput} onChange={e=>setFundsInput(e.target.value)} placeholder='0 ETH' />
                        <Button variant='warning' onClick={handleFunds}>Withdraw</Button>
                    </Form.Group>
                </Form.Row> 
            </Form>
            <Row className='justify-content-md-center'>
                <Col>
                    {infoText}
                </Col>
            </Row>
        </Card.Text>
    )
}