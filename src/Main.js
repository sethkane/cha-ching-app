import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import Home from './Home';
import AddCoin from './AddCoin';
import CoinDetail from './CoinDetail';
import CoinEdit from './CoinEdit';

const Main = props => {

	return (
			<Router>
				<Navigation auth={props} />
				<Switch>
				
					<Route exact path="/">
						<Home auth={props}/>
					</Route>
					
					
					<Route exact path="/coin/:id">
						<CoinDetail auth={props} />
					</Route>
					

					{props.auth.user && props.auth.user.uid === '0UTyRK7o0sNu8EFN5J8xqHiiV5q2' &&
					<Route exact path="/add">
						<AddCoin />
					</Route>
					}

					{props.auth.user && props.auth.user.uid === '0UTyRK7o0sNu8EFN5J8xqHiiV5q2' &&
					<Route exact path="/coin/edit/:docid">
						<CoinEdit />
					</Route>
					}

				</Switch>
				<Footer auth={props} />
			</Router>
	  );

}

export default Main; // Don’t forget to use export default!

