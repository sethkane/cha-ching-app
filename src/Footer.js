import React from 'react';
import styles from './Footer.module.css'; 

const Footer = (props) => {

	const date = new Date();
	const year= date.getFullYear();

	return (
		<footer className={styles.footer}>
			<p>&copy; Copyright {year} <a href='https://twitter.com/onesixtieth'>Onesixtieth</a></p>
			<p><a href='https://github.com/sethkane/cha-ching-app' rel='noopener noreferrer' target='_blank'>Check out this app on GitHub</a></p>
			
		</footer>
	);
}
  	

export default Footer; // Don’t forget to use export default!