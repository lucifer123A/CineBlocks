import React from 'react';
import { Container, Card, Row, Col, Image, Navbar, Carousel, Tabs, Tab, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import Footer from './Footer';
import AdminPanel from './../components/movieAdminPanel'
import FactoryContract from '../contracts/FactoryContract.json';
import MovieContract from '../contracts/MovieContract.json';
import ipfs from './ipfs';
import getAllMovies from './../components/getAllMovies'

const GAS = 10000000;
const GAS_PRICE = "20000000000";

class CreatorPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            web3: null,
            accounts: null,
            contract: null,
            MovieName: "",
            TokenName: "",
            TokenSymbol: null,
            Summary: "",
            Description: "",
            Deadline: '',
            Image: null,
            list_of_all_movies: null,
            web3: null,
            FactoryInstance: null,
            loading: true,
            imgBuffer: null,
            movieContractAddress: null,
            nextForm: null,
            movieInstance: null,
            ipfsHash: '',
            infoText: '...',
            activeTab: ''
        }
    }

    componentDidMount = async () => {
        await this.loadWeb3()
        console.log('tring to connect')
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        console.log('connected to ', accounts[0])

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = FactoryContract.networks[networkId];
        const FactoryInstance = new web3.eth.Contract(
            FactoryContract.abi,
            deployedNetwork.address
            // '0xbCf0166D8a3b374FFFbd4F9C16d6B73397CdEf06'
        );
        
        let data = await getAllMovies(web3)
        
        // const FactoryInstance = await new web3.eth.Contract(FactoryContract.abi, '0x50A4dd5EC76374458Bd69cFF48AF3D88c512e73e')
        window.FactoryInstance = FactoryInstance;
        window.accounts = this.state.accounts

        this.setState({
            web3: web3,
            accounts: accounts,
            FactoryInstance: FactoryInstance,
            list_of_all_movies: data
        });


    }

    async loadWeb3() {
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

    handleChange = (event) => {

        const name = event.target.name;
        const value = event.target.value;

        this.setState({
            [name]: value
        });
    }



    handleClick = async (event) => {
        const contract = this.state.FactoryInstance;

        const res = await contract.methods.newMovieContract(this.state.MovieName)
            .send({from: this.state.accounts[0], gas: GAS, gasPrice: GAS_PRICE})
            .then(res => {
                console.log('new movie contract ', res)
                this.setState({infoText: 'Movie Contract created! Enter details.'})
            })
            .catch(err => console.log('Error generating movie contract ', err))
        await contract.methods.recentContract()
            .call()
            .then(res => {
                (res !== '0x0000000000000000000000000000000000000000') ?
                this.setState({movieContractAddress: res}) : console.log('movie address not initiated')
            })
            .catch(err => console.log('didn\'t get recent contract'))

        // const a = await contract.methods.recentContract().call().catch(err => console.log('error ', err));
        // console.log(a)
 
    }

    handleClick1 = async(e) => {
        this.setState({infoText: 'Creating movie token ..'})
        const {web3, contract, accounts, movieContractAddress, Summary, Deadline, TokenName, TokenSymbol} = this.state;
        const instance = new web3.eth.Contract(MovieContract.abi, movieContractAddress);
        this.setState({movieInstance: instance})


        await instance.methods.createMovieToken(TokenSymbol, TokenName, web3.utils.toHex(10 ** 18))
            .send({ from: accounts[0], gas: GAS, gasPrice: GAS_PRICE})
            .then(txhash => {
                console.log('token ', txhash)
                this.setState({infoText: 'Movie token Created! Pushing movie details..'})
            })
            .catch(err => {
                this.setState({infoText: 'Error creating token.'})
                console.log(err)
            })
        // await this.upload();

        await instance.methods.addMovie(Summary, this.state.ipfsHash, web3.utils.toHex(parseInt(Deadline, 10)))
        .send({ from: accounts[0], gas: GAS, gasPrice: GAS_PRICE})
        .then(txhash => {
            console.log('token ', txhash)
            this.setState({infoText: 'Movie Details added'})
        })
        .catch(err => {
            this.setState({inforText: 'Error pushing movie details.'})
            console.log(err)
        })
    }

    onFileChange = async (event) => {

        const file = event.target.files[0]
        let reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = async () => {
            let buffer = await Buffer.from(reader.result);
            this.setState({ imgBuffer: buffer });
        }

        this.setState({
            Image: event.target.files[0]
        });

        // console.log('making url')
        // let blob = new Blob([file])
        // let url = await URL.createObjectURL(blob)


    }

    upload = async () => {
        console.log('url created ', this.state.imgBuffer)
        ipfs.add(this.state.imgBuffer, (err, res) => {
            if(err) console.log('Error ', err)
            else {
                console.log('hash', res)
                this.setState({ipfshash : res[0].hash})
            }
        })
    }

    changeTabs = e => {
        console.log('on', e)
        this.setState({activeTab: e})
    }

    render() {

        var data; // TODO: get all movie list component

        if (this.state.list_of_all_movies == null) {
            data = <span><b>Loading</b></span>
        }
        else {
            var a = [], b;
            for (let i in this.state.list_of_all_movies) {
                b = <Col>
                    <Card className="movieDetails" name={this.state.list_of_all_movies[i].name}>
                        <Card.Body>
                            <Card.Title>
                                {this.state.list_of_all_movies[i].name}
                            </Card.Title>
                            <Card.Text>
                                {this.state.list_of_all_movies[i].summary}
                            </Card.Text>

                            <Link className = "linkToInfo" to={`/info/${this.state.list_of_all_movies[i].address}`} detail={this.state.list_of_all_movies[i].address}>View Details</Link>
                        </Card.Body>
                    </Card>
                </Col>
                a.push(b);
            }
            data = a;
        }

        const form1 = () => (
            <Form>
                <Form.Row className="justify-content-md-center">
                    <Form.Group as={Col} controlId="MovieName">
                        <Form.Label>Movie Name : </Form.Label>
                        <Form.Control type="text" placeholder="Movie Name" name="MovieName" value={this.state.MovieName} onChange={this.handleChange} required />
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Button variant="warning" onClick={this.handleClick} disabled={this.state.movieContractAddress?true:false}>Instantiate Movie Contract</Button>
                </Form.Row>
                <Form.Row>
                    {this.state.movieContractAddress && 
                    <div>
                        <Form.Label>Movie contract address is <strong>{this.state.movieContractAddress}</strong></Form.Label>
                        <Button variant='warning' onClick={() => {
                            this.setState({nextForm: true})
                        }}> Enter Details </Button>
                    </div>}
                </Form.Row>
            </Form>
        )
        const form2 = () => (
            <Form>
                <Form.Row className="justify-content-md-center">
                    <Form.Group as={Col} controlId="MovieName">
                        <Form.Label>Movie Name : </Form.Label>
                        <Form.Control type="text" placeholder={this.state.MovieName} name="MovieName1" readOnly />
                    </Form.Group>
                </Form.Row>
                <Form.Row className="justify-content-md-center">
                    <Form.Group as={Col} controlId="Expected Release Date">
                        <Form.Label>Token Symbol :</Form.Label>
                        <Form.Control type="text" name="TokenSymbol" value={this.state.TokenSymbol} onChange={this.handleChange} required />
                    </Form.Group>
                    <Form.Group as={Col} controlId="Expected Release Date">
                        <Form.Label>Token Name :</Form.Label>
                        <Form.Control type="text" name="TokenName" value={this.state.TokenName} onChange={this.handleChange} required />
                    </Form.Group>
                </Form.Row> 
                <Form.Row className="justify-content-md-center">
                    <Form.Group as={Col} controlId="deadline">
                        <Form.Label>Approximate Deadline : (in days)</Form.Label>
                        <Form.Control type="text" name="Deadline" value={this.state.Deadline} onChange={this.handleChange} placeholder="Enter an Approximate Project deadline in days."  required />
                    </Form.Group>
                </Form.Row>               
                <Form.Row className="justify-content-md-center">
                    <Form.Group as={Col} controlId="Summary">
                        <Form.Label>Summary :</Form.Label>
                        <Form.Control type="text" name="Summary" value={this.state.Summary} onChange={this.handleChange} placeholder="Summary. To let Investors have overview of your Movie." required />
                    </Form.Group>
                </Form.Row>
                <Form.Row className="justify-content-md-center">
                    <Form.Group as={Col} controlId="description">
                        <Form.Label>Description : </Form.Label>
                        <Form.Control as="textarea" rows="3" name="Description" value={this.state.Description} onChange={this.handleChange} placeholder="Brief Description About your movie." />
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Form.Group>
                        <Form.File id="Image" name="Image" onChange={this.onFileChange} label="Poster" />
                    </Form.Group>
                </Form.Row>
                <Form.Row>
                    <Button variant="warning" onClick={this.handleClick1}>Add Movie</Button>
                </Form.Row>
                <Form.Row>
                    <Form.Label>Status - {this.state.infoText}</Form.Label>
                </Form.Row>
            </Form>
        )

        // const passableProps = {
        //     web3: this.state.web3,
        //     accounts: this.state.accounts,
        //     // movieContractAddress: this.state.movieContractAddress,
        //     // movieName: this.state.MovieName,
        //     // tokenSymbol: this.state.TokenSymbol,
        //     // instance: this.state.movieInstance
        // }

        return (

            <div className="creatorPage">
                <Navbar>
                    <Navbar.Brand>
                        <a href="#">
                            <Image src={require("../images/logo2.png")}></Image>
                        </a>
                    </Navbar.Brand>
                </Navbar>
                <Container className="carouselContainer">
                    <Carousel>
                        <Carousel.Item>
                            <img
                                className="d-block w-100"
                                src={require("../images/TheUptownGirl.jpeg")}
                                alt="The Uptown Girl"
                                height="500"
                            />
                            <Carousel.Caption>
                                <h3>The Uptown Girl</h3>
                                <p>Join The Uptown Girl on her Secret Journey.</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img
                                className="d-block w-100"
                                src={require("../images/Countryside.jpg")}
                                alt="Third slide"
                                height="500"
                            />

                            <Carousel.Caption>
                                <h3>Countryside</h3>
                                <p>Join the Battle!</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <img
                                className="d-block w-100"
                                src={require("../images/MyFantasyJournal.jpeg")}
                                alt="Third slide"
                                height="500"
                            />

                            <Carousel.Caption>
                                <h3>My Fantasy Journal</h3>
                                <p>Create with Nathan.</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>
                </Container>
                <Container>
                    <Tabs defaultActiveKey="All Projects" onSelect={this.changeTabs}>
                        <Tab eventKey="All Projects" title="All Projects">
                            <Card className="cardContainer">
                                <Card.Body>
                                    <Card.Title className="cardContainerTitle">
                                        All Movies
                                    </Card.Title>
                                    <Card.Text>
                                        <Container>
                                            <Row lg={4} md={2} sm={1}>
                                                {data}
                                            </Row>
                                        </Container>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Tab>
                        <Tab eventKey="Add Movie" title="Add Movie">
                            <Card className="addMovieCard">
                                <Card.Body>
                                    <Card.Title className="AddMovieTitle">
                                        Add Movie
                                    </Card.Title>
                                    <Card.Text>
                                        {this.state.movieContractAddress && this.state.nextForm ? form2() : form1()}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Tab>
                        <Tab eventKey="Movie Admin Panel" title="Movie Admin Panel">
                            <div className='infoPage'>
                                <Card className="infoCard">
                                    <Card.Body>
                                        <Card.Title className="cardContainerTitle">
                                            Admin Panel
                                        </Card.Title>
                                        {this.state.activeTab === 'Movie Admin Panel' && <AdminPanel/>}
                                    </Card.Body>
                                </Card>
                            </div>
                        </Tab>
                    </Tabs>
                </Container>
                <Footer></Footer>
            </div>
        );
    }
}

export default CreatorPage;
