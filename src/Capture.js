import React from 'react';
import styles from './Capture.module.css'; 

const Capture = (props) => {
       return (
           <div className={styles.capture}>

              <div className={styles.captureItem}>
                 <button onClick={() => props.capture('front')}>
                     Take Front
                 </button>
               </div>
               <div className={styles.captureItem}>
                 <button onClick={() => props.capture('back')}>
                     Take Back
                 </button>
               </div>
           </div>
       );
}

export default Capture;