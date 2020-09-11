import React, {useState, useEffect} from 'react'
// import web3 from './../components/web3'
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import TokenFactory from '../contracts/TokenFactory.json';
import FactoryContract from '../contracts/FactoryContract.json';
import MovieContract from '../contracts/MovieContract.json';
import ProgressBar from 'react-bootstrap/ProgressBar'
const movieStates = ['PRE_PRODUCTION', 'PRODUCTION', 'RELEASED', 'OVER'] 

export default function AdminPanel(props) {
    // const {web3, accounts, movieContractAddress, instance, tokenSymbol} = props.passableProps;

    const [infoText, setInfoText] = useState('')
    const [movieData, setMovieData] = useState()
    const [statusInput, setStatusInput] = useState('')
    const [stateOption, setStateOption] = useState(0)
    const [profitInput, setProfitInput] = useState()
    const [fundsInput, setFundsInput] = useState()
    const [updateData, setUpdateData] = useState(false)
    const [web3, setWeb3] = useState()
    const [account, setAccount] = useState()
    const [instance, setInstance] = useState()
    const [movieAddress, setMovieAddress] = useState('')
    const [progress, setProgress] = useState({show: false, val: 0})


    useEffect(() => {
        // fetchData()
        if(!movieData){
            getUtils()
        }
    }, [])

    const getUtils = async () => {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = FactoryContract.networks[networkId];
        const factoryInstance = new web3.eth.Contract(
            FactoryContract.abi,
            deployedNetwork.address
        );
        let r = ''
        await factoryInstance.methods.findByAddress(accounts[0])
            .call()
            .then(res => {
                console.log('contracts of user', res)
                r=res
                setMovieAddress(res)
                if(res === "0x0000000000000000000000000000000000000000") {
                    alert('No contract Found.')
                }
            })
            .catch(err => {
                console.log('err')
                setMovieAddress("0x0000000000000000000000000000000000000000")
            })
        if(r !== '') {
            const instance = new web3.eth.Contract(
                MovieContract.abi,
                r
            );
            console.log('h1')
            window.movieContract = instance //debugging
                await fetchData(instance, web3, accounts[0])
                setWeb3(web3)
                setAccount(accounts[0])
                setInstance(instance)
        }
        
    }

    const fetchData = async (instance, web3, account) => {
        try{
            console.log('fetching ')
            let rate = await instance.methods.rate().call()
            let tokenAddress = await instance.methods.token().call()
            let totalInvestment = await instance.methods.totalInvestment().call()
            let investorCount = await instance.methods.investorCount().call()
            let totalProfit = await instance.methods.totalProfit().call()
            let state = await instance.methods.currentState().call()
            let movie = await instance.methods.movie().call()
            let tokenSymbol = ''
            if(web3 && tokenAddress && account) {
                let tokeninstance = new web3.eth.Contract(TokenFactory.abi, tokenAddress);
                tokenSymbol = await tokeninstance.methods.symbol().call()
            }
            rate = handleInt(rate)
            let deadline = handleDate(movie.deadline)
            let creationDate = handleDate(movie.creationDate)
            let maxReleaseLimit = handleInt(movie.maxReleaseLimit)
            totalInvestment = handleInt(totalInvestment)
            totalProfit = handleInt(totalProfit) 
            investorCount = investorCount.toString()
            setMovieData({ name: movie.name, rate: rate, tokenSymbol: tokenSymbol, tokenAddress: tokenAddress, deadline: deadline, creationDate: creationDate, totalInvestment: totalInvestment, investorCount: investorCount , totalProfit: totalProfit, maxReleaseLimit: maxReleaseLimit , ipfsHash: movie.ipfsHash, state: movieStates[state]})
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
        d = d.split(' ').slice(0,5).join(' ')
        return d
    }

    const handleInt = hexInt => {
        let c = hexInt.toString()
        c /= (10 ** 18)
        return c
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
        setInfoText('Pushing recent status..')
        let c = new Date()
        c = c.toUTCString().split(' ').slice(0,5).join(' ')
        c = '[' + c + '] ' + statusInput
        instance.methods.projectUpdate(c)
            .send({
                from: account,
                gas: 2000000
            })
            .on('transactionHash', h => {
                console.log('tx hash', h)
                setProgress({show: true, val: 5})
            })
            .on('confirmation', c => {
                if(c < 6) {
                    setProgress({show: true, val: Math.floor(c/5 * 100)})
                }
                if(c === 6) {
                    setInfoText('Status pushed successfully.')
                    setProgress({show: false, val: 0})
                }
            })
            // .then(tx => {
            //     console.log(tx)
            //     setInfoText('Status pushed successfully.')
            //     setProgress({show: false, val: 0})
            // })
            .catch(err => {
                console.log(err)
                setProgress({show: false, val: 0})
                setInfoText('Error pushing status.')
            })
    }

    const handleState = e => {
        e.preventDefault()
        setInfoText('Pushing recent state of the project..')
        instance.methods.updateState(stateOption)
            .send({
                from: account,
                gas: 2000000
            })
            .on('transactionHash', h => {
                console.log('tx hash', h)
                setProgress({show: true, val: 5})
            })
            .on('confirmation', c => {
                if(c < 6) {
                    setProgress({show: true, val: Math.floor(c/5 * 100)})
                }
                if(c === 6) {
                    setInfoText('State updated successfully.')
                    setProgress({show: false, val: 0})
                    setUpdateData(true)
                }
            })
            // .then(tx => {
            //     console.log(tx)
            //     setInfoText('State updated successfully.')
            //     setProgress({show: false, val: 0})
            //     setUpdateData(true)
            // })
            .catch(err => {
                console.log(err)
                setInfoText('Error updating state.')
                setProgress({show: false, val: 0})
            })
    }

    const handleProfit = e => {
        e.preventDefault()
        setInfoText('Loading')
        if(movieData.state !== 'RELEASED') {
            alert('Can only report profit after PRODUCTION state.')
            setInfoText('')
            return 
        }
        setInfoText('Congratulations! Sending profit..')
        instance.methods.reportProfit()
            .send({
                from: account,
                gas: 5000000,
                value: profitInput * 10 ** 18
            })
            .on('transactionHash', h => {
                console.log('tx hash', h)
                setProgress({show: true, val: 5})
            })
            .on('confirmation', c => {
                if(c < 6) {
                    setProgress({show: true, val: Math.floor(c/5 * 100)})
                }
                if(c === 6) {
                    setInfoText('Profit sent successfully.')
                    setProgress({show: false, val: 0})
                    setUpdateData(true)
                }
            })
            // .then(tx => {
            //     console.log(tx)
            //     setInfoText('Profit sent successfully.')
            //     setProgress({show: false, val: 0})
            //     setUpdateData(true)
            // })
            .catch(err => {
                console.log(err)
                setProgress({show: false, val: 0})
                setInfoText('Error sending profit.')
            })

    }

    const handleFunds = e => {
        e.preventDefault()
        setInfoText('Loading withdraw request..')
        if(fundsInput === 0) {
            alert('Please enter a value.')
            return
        } else if(fundsInput > 5){
            alert('To withdraw funds over 5 ETH, please start a vote.')
            return
        }

        let reason = prompt(`Enter reason for withdrawing ${fundsInput}`)
        reason = reason.toString()

        if(reason === '') {
            setInfoText('Reason recorded, submitting withdraw request')
            return
        }

        instance.methods.releaseFunds(web3.utils.toHex(fundsInput * 10 ** 18), reason)
            .send({
                from: account,
                gas: 5000000
            })
            .on('transactionHash', h => {
                console.log('tx hash', h)
                setProgress({show: true, val: 5})
            })
            .on('confirmation', c => {
                if(c < 6) {
                    setProgress({show: true, val: Math.floor(c/5 * 100)})
                }
                if(c === 6) {
                    setInfoText('Withdraw Successful!')
                    setProgress({show: false, val: 0})
                }
            })
            // .then(tx => {
            //     console.log(tx)
            //     setInfoText('Withdraw Successful!')
            //     setProgress({show: false, val: 0})
            // })
            .catch(err => {
                console.log(err)
                setInfoText('Error submitting request.')
                setProgress({show: false, val: 0})
            })
    }

    if(movieAddress === "0x0000000000000000000000000000000000000000") return <strong><h4>No project found.</h4></strong>

    if(!movieData) return <span><h4>Project Found. Loading ...</h4></span>

    return (
        <Card.Text>
            <Row className='justify-content-md-center'>
                <Col xs={8}>
                Project Name: <text style={{color:"white"}}>{movieData.name}</text>
                    <br /><hr />
                </Col>
                <Col>
                    <Button variant='outline-primary' onClick={()=>setUpdateData(true)}>Refresh Data</Button>
                </Col>
            </Row>
            <Row className='justify-content-md-center'>
                <Col>
                    Creation Date: <text style={{color:"white"}}>{movieData.creationDate}</text>
                    <br /><hr />
                </Col>
                <Col>
                    Deadline : <text style={{color:"white"}}>{movieData.deadline}</text>
                    <br /><hr />
                </Col>
            </Row>
            <Row className='justify-content-md-center'>
                <Col>
                    Total Investment: <text style={{color:"white"}}>{movieData.totalInvestment.toString().slice(0,7)} ETH</text>
                    <br /><hr />
                </Col>
                <Col>
                    Total Profit: <text style={{color:"white"}}>{movieData.totalProfit.toString().slice(0,7)} ETH</text>
                    <br /><hr />
                </Col>
                <Col>
                    Investor Count: <text style={{color:"white"}}>{movieData.investorCount}</text>
                    <br /><hr />
                </Col>
            </Row>
            
            <Row className='justify-content-md-center'>
                <Col>
                    Current State : <text style={{color:"white"}}>{movieData.state}</text>
                    <br /><hr />
                </Col>
                <Col>
                    Current Rate : <text style={{color:"white"}}>{movieData.rate.toString().slice(0,7)} ETH / {movieData.tokenSymbol ? movieData.tokenSymbol : 'Token'}</text>
                    <br /><hr />
                </Col>
                <Col>
                    Release Limit : <text style={{color:"white"}}>{movieData.maxReleaseLimit} ETH</text>
                    <br /><hr />
                </Col>
            </Row>
            <Form>
                <Form.Row className="justify-content-md-center">
                    <Form.Group as={Col} controlId="status">
                        <Form.Label>Update Project Status :</Form.Label>
                        <Form.Control type="text" name="updateProject" value={statusInput} onChange={e=>setStatusInput(e.target.value)} placeholder='Enter recent project updates.' />
                        <br />
                        <Button variant='success' onClick={handleStatus}>Update</Button>
                    </Form.Group>
                    <Form.Group as={Col} controlId="state">
                        <Form.Label>Update Project State :</Form.Label>
                        <Form.Control as='select' name="state" id='inlineFormCustomSelect' custom onChange={e=>{console.log(e.target.value);setStateOption(e.target.value)}} > 
                            {movieStates.map((val, index) => (
                                <option value={index}>{val}</option>
                            ))}
                        </Form.Control>
                        <br />
                        <Button variant='success' onClick={handleState}>Update</Button>
                    </Form.Group>
                </Form.Row> 
                <Form.Row className="justify-content-md-center">
                    <Form.Group as={Col} controlId="reportprofit">
                        <Form.Label>Report Profit :</Form.Label>
                        <Form.Control type="text" name="reportprofit" value={profitInput} onChange={e=>setProfitInput(e.target.value)} placeholder='0 ETH' />
                        <br />
                        <Button variant='success' onClick={handleProfit}>Report</Button>
                    </Form.Group>
                    <Form.Group as={Col} controlId="withdrawEth">
                        <Form.Label>Withdraw Funds :</Form.Label>
                        <Form.Control type="text" name="withdraw" value={fundsInput} onChange={e=>setFundsInput(e.target.value)} placeholder='0 ETH' />
                        <br />
                        <Button variant='success' onClick={handleFunds}>Withdraw</Button>
                    </Form.Group>
                </Form.Row> 
            </Form>
            <Row className='justify-content-md-center'>
                <Col>
                    <text style={{color:'white'}}>{infoText}</text>
                    {progress.show && <div style={{padding:'15px'}}>
                        <ProgressBar animated label={`${progress.val}`} now={progress.val} variant='success'/> 
                    </div>}
                </Col>
            </Row>
        </Card.Text>
    )
}