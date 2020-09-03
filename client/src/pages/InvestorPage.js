import React from 'react';
import { Container, Card, Row, Col, Image, Navbar, Carousel } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';
import Web3 from 'web3';
import Footer from './Footer';
import getAllMovies from './../components/getAllMovies'

class InvestorPage extends React.Component {

    constructor(props){
        super (props);
        this.state={
            list_of_all_movies: null,
            web3: null
        }
    }

    componentDidMount = async () => {

        await this.loadWeb3()
        let web3 = window.web3
        this.setState({
            web3: web3
        })
        let data = await getAllMovies(web3)

        this.setState({
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

    render() {

        var data;

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

        return (

            <div className="investorPage">
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
                </Container>
                <Footer></Footer>
            </div>
        );
    }
}

export default withRouter(InvestorPage);