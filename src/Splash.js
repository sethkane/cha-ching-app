import React from 'react';
import styles from './Splash.module.css'; 


const Splash = props => {

	let user;
	if(props.auth.user && props.auth.user.uid === '0UTyRK7o0sNu8EFN5J8xqHiiV5q2'){
		user = props.auth.user;
	}

	return (
	    	<main className={styles.splash}>
		    	<h1>Welcome to Cha-Ching Coins</h1>
		    	<p>This is site is dedicated to the Kane Family Coin collection and for security and tracking purposes you must have a valid Google Account to visit and access the contents of this site.</p>
		    	<p>Don't worry it is safe and we will respect your privacy!</p>
				{
				user
				? <button onClick={props.auth.signOut}>Sign out {props.auth.user.displayName }</button>
				: <button onClick={props.auth.signInWithGoogle}><img alt="Sign In With Google" src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png" /></button>
				}
			</main>
	    );

}

export default Splash;