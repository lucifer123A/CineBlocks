import React from 'react';
import { Navbar, Image, Row, Card, Container, Col, Form, Button } from 'react-bootstrap'
import axios from 'axios';

import Footer from './Footer';

class InfoPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            movieData: null,
            tokensOwned: 0,
            BuyTokens: 0
        }
    }

    componentDidMount = async () => {

        try {
            const response = await axios.get(`http://localhost:5000/movies/${this.props.match.params.movieId}`);

            this.setState({
                movieData: response.data
            });
            console.log(response.data);
        }
        catch (error) {
            console.log(error);
        }
    }

    handleChange = (event) => {

        const name = event.target.name;
        const value = event.target.value;

        this.setState({
            [name]: value
        });
    }

    buyToken = (event) =>{
        
        var sum = parseInt(this.state.tokensOwned) + parseInt(this.state.BuyTokens);
        console.log(sum);
        this.setState({
            tokensOwned: sum
        });
        console.log(this.state.tokensOwned)
        this.forceUpdate();
    }

    withdrawToken = (event) =>{
        
        var sum = parseInt(this.state.tokensOwned) - parseInt(this.state.BuyTokens);
        console.log(sum);
        this.setState({
            tokensOwned: sum
        });
        console.log(this.state.tokensOwned)
        this.forceUpdate();
    }

    render() {
        var tk = this.state.tokensOwned;
        var data;

        if (this.state.movieData == null) {
            data = <Card.Title>Loading</Card.Title>
        }
        else {
            data = <Card.Body>
                <Card.Title className="movieTitle">
                    {this.state.movieData.name}
                </Card.Title>
                <Card.Text>
                    <Row classname="justify-content-md-center" md={1}>
                        <Col>
                            <Image width="80%" src={`http://localhost:5000/${this.state.movieData.image.data}`} alt={this.state.movieData.name}></Image>
                        </Col>
                        <Col>
                            Description : <br></br><hr></hr>
                            {this.state.movieData.description}
                        </Col>
                    </Row>
                    <hr></hr>
                    <Row>
                        <Col>
                            <Form>
                                <Form.Row className="justify-content-md-center" lg={2}>
                                    <Form.Group as={Col} controlId="BuyTokens">
                                        <Form.Label>Buy Token : </Form.Label>
                                        <Form.Control type="text" placeholder="100" name="BuyTokens" value={this.state.BuyTokens} onChange={this.handleChange} required />
                                    </Form.Group>
                                </Form.Row>
                                <Button variant="warning" onClick={this.buyToken}>Buy Token</Button>
                            </Form>
                        </Col>
                        <Col className="justify-content-md-center">

                            <h4>Tokens Owned : {this.state.tokensOwned}</h4>

                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form>
                                <Form.Row className="justify-content-md-center" lg={2}>
                                    <Form.Group as={Col} controlId="Withdraw">
                                        <Form.Label>Withdraw Token : </Form.Label>
                                        <Form.Control type="text" placeholder="100" name="BuyTokens" value={this.state.BuyTokens} onChange={this.handleChange} required />
                                    </Form.Group>
                                </Form.Row>
                                <Button variant="warning" onClick={this.withdrawToken}>Withdraw Token</Button>
                            </Form>
                        </Col>
                        <Col className="justify-content-md-center">
                        <h4>Status : {this.state.movieData.status}</h4>
                            <br></br>
                        </Col>
                    </Row>
                </Card.Text>
            </Card.Body>
        }
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
                        {data}
                    </Card>
                </Container>
                <Footer></Footer>
            </div>
        );
    }
}

export default InfoPage;