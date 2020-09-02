import React from 'react';
import {BrowserRouter as Router, Route, Redirect} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './scss/main.css';

import "./pages/FirstPage";
import FirstPage from './pages/FirstPage';
import InvestorPage from './pages/InvestorPage';
import CreatorPage from './pages/CreatorPage';
import InfoPage from './pages/InfoPage';

function App() {
  return (
    <Router>
      <Redirect from="/" to="/home"></Redirect>
      <Route path='/home' component={FirstPage}></Route>
      <Route path='/investor' component={InvestorPage}></Route>
      <Route path='/creator' component={CreatorPage}></Route>
      <Route path="/info/:movieId" component={InfoPage}></Route>
    </Router>
  );
}

export default App;
