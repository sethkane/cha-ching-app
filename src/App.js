import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import React  from 'react';
import firebaseUtil from './FirebaseUtil'
import withFirebaseAuth from 'react-with-firebase-auth';
import 'firebase/auth';
import Main from './Main';
import Splash from './Splash';
import styles from './App.module.css'; 
import CoinDetailPublic from './CoinDetailPublic';
import Footer from './Footer';
firebaseUtil.init();

const App = props => {

	return (

		<Router>
			<Switch>
				<Route exact path="/public/:id">
					<div className={styles.main}>
						<CoinDetailPublic />
						<Footer auth={props} />
					</div>
				</Route>
				<Route path="/">
					<div className={styles.main}>
					{
					props.user
					? <Main auth={props} />
					: <Splash auth={props} />
					}
					</div>
				</Route>
			</Switch>
		</Router>

	);

}




export default withFirebaseAuth({
  providers: firebaseUtil.providers,
  firebaseAppAuth: firebaseUtil.getFirebaseAppAuth()
})(App);


