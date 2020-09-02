import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

class FooterComponent extends React.Component {

    render() {
        return (
            <footer>
                <Container className="footer-elements">
                    <Row>
                        <Col>
                            <h4>Contact Us</h4>
                            <ul>
                                <li>Phone no. :</li>
                                <li>Tel no. :</li>
                                <li>Email :</li>
                                <li>Address :</li>
                            </ul>
                        </Col>
                        <Col>
                        <div class="social-icons">
                        <a href="#">
                            <i class="fab fa-twitter fa-2x"></i>
                        </a>
                        <a href="#">
                            <i class="fab fa-github fa-2x"></i>
                        </a>
                        <a href="#">
                            <i class="fab fa-linkedin fa-2x"></i>
                        </a>
                        <a href="#">
                            <i class="fab fa-facebook fa-2x"></i>
                        </a>
                    </div>
                        </Col>
                    </Row>
                    <p>
                        &copy; Copyright 2020
                    </p>
                </Container>
            </footer>
        );
    }
}
export default FooterComponent;