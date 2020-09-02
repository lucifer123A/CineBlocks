import React from 'react';
import { Container, Button } from 'react-bootstrap';
import {  withRouter } from 'react-router';

class FirstPage extends React.Component {

    render() {

        return (
            <div className = "home">
                <Container className="FirstPage">
                    <h2 className="title-welcome">
                        Welcome to
                    </h2>
                    <h1 className="title-app">
                        CINEBOCKS
                    </h1>
                   <Button variant="warning" onClick={() => {this.props.history.push('/creator')}}>Login as Creator</Button>
                   <Button variant="warning" onClick={() => {this.props.history.push('/investor')}}>Login as Investor</Button>
                </Container>
            </div>
        );
    }
}

export default withRouter(FirstPage);