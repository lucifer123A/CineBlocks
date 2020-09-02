import React from 'react';
import { Container, Card, Row, Col, Image, Navbar, Carousel } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';
import axios from 'axios';

import Footer from './Footer';

class InvestorPage extends React.Component {

    constructor(props){
        super (props);

        this.state={
            list_of_all_movies: null
        }
    }

    componentDidMount = async () => {

        const response = await axios.get("http://localhost:5000/movies");

        this.setState({
            list_of_all_movies: response.data
        });
    }

    handleClickOnCard = async(event) =>{

        console.log(event.target)
        
        alert(`Alert ${event.target}`)
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
                    <Card className="movieDetails" name={this.state.list_of_all_movies[i]._id}>
                        <Card.Img variant="top" src={`http://localhost:5000/${this.state.list_of_all_movies[i].image.data}`}></Card.Img>
                        <Card.Body>
                            <Card.Title>
                                {this.state.list_of_all_movies[i].name}
                            </Card.Title>
                            <Card.Text>
                                {this.state.list_of_all_movies[i].summary}
                            </Card.Text>

                            <Link className = "linkToInfo" to={`/info/${this.state.list_of_all_movies[i]._id}`} detail={this.state.list_of_all_movies[i]._id}>View Details</Link>
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