import React from 'react';
import { Link } from "react-router-dom";
import styles from './Navigation.module.css'; 


const Navigation = props => {

	const reset = () => {
		localStorage.removeItem('coins');
		localStorage.removeItem('filtered');
		alert('New Data Retrieved')
	};

	let user;
	let admin;
	if(props.auth.auth.user){
		user = props.auth.auth.user;
	}
	if(props.auth.auth.user.uid === '0UTyRK7o0sNu8EFN5J8xqHiiV5q2'){
		admin = props.auth.auth.user;
	}

	return (
	    	<header className={styles.header}>
				<nav>
					<ul>
						<li>
							<Link to="/">Home</Link>
						</li>
						{ admin &&
						<li>
							<Link to="/add">Add</Link>
						</li>
						}
						{ admin &&
						<li>
							<Link to="#" onClick={reset}>Fetch</Link>
						</li>
						}
						<li className={styles.push}>
						{
							user
							? <Link to="#" onClick={props.auth.auth.signOut}>Sign out {props.auth.auth.user.displayName }</Link>
							: <Link to="#" onClick={props.auth.auth.signInWithGoogle}>Sign in with Google</Link>
							}
						</li>
					</ul>
				</nav>
			</header>
	    );

}

export default Navigation;