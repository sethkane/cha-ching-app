import React from 'react';
import styles from './Magnifier.module.css'; 


const Magnifier = (props) => {

	
	return (
	    	<div className={styles.magnifier}><img src={props.src} alt={props.alt} /></div>
	    );

}

export default Magnifier;