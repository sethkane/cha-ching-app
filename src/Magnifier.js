import React, {useEffect,useRef} from 'react';
import styles from './Magnifier.module.css'; 



const Magnifier = (props) => {


	const src = props.src;
	const zoom = 2;
	const bw = 3;
	const theImage = React.createRef();
	const theGlass = React.createRef();

	let imgWidth = 0;
	let imgHeight = 0;
	let w;
	let h;


	useEffect(() => {
		imgWidth = theImage.current.width;
		imgHeight = theImage.current.height;

		theGlass.current.style.backgroundImage = "url(" + src + ")";
		theGlass.current.style.backgroundSize = (imgWidth * zoom) + "px " + (imgHeight * zoom) + "px";

		w = theGlass.current.offsetWidth / 2;
  		h = theGlass.current.offsetHeight / 2;
	 
	}, [props])

	const GetCursor = (e) => {
		let a, x = 0, y = 0;
		e = e || window.event;
	    /* Get the x and y positions of the image: */
	    a = theImage.current.getBoundingClientRect();
	    /* Calculate the cursor's x and y coordinates, relative to the image: */
	    x = e.pageX - a.left;
	    y = e.pageY - a.top;
	    /* Consider any page scrolling: */
	    x = x - window.pageXOffset;
	    y = y - window.pageYOffset;
	    return {x : x, y : y};
	}

	const TrackMouse = (e) => {
		var pos, x, y;
	    /* Prevent any other actions that may occur when moving over the image */
	    e.preventDefault();
	    /* Get the cursor's x and y positions: */
	    pos = GetCursor(e);
	    x = pos.x;
	    y = pos.y;
	    /* Prevent the magnifier glass from being positioned outside the image: */
	    if (x > theImage.current.width - (w / zoom)) {x = theImage.current.width - (w / zoom);}
	    if (x < w / zoom) {x = w / zoom;}
	    if (y > theImage.current.height - (h / zoom)) {y = theImage.current.height - (h / zoom);}
	    if (y < h / zoom) {y = h / zoom;}
	    /* Set the position of the magnifier glass: */
	    theGlass.current.style.visibility = 'visible';
	    theGlass.current.style.left = (x - w) + "px";
	    theGlass.current.style.top = (y - h) + "px";
	    /* Display what the magnifier glass "sees": */
	    theGlass.current.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";

	}

	const HideGlass = (e) => {
		theGlass.current.style.visibility = 'hidden';
	}

	return (
	    	<div className={styles.magnifier}>
	    		<span onMouseMove={TrackMouse} onMouseOut={HideGlass} ref={theGlass} className={styles.glass}></span>
	    		<img onMouseMove={TrackMouse} onMouseOut={HideGlass} ref={theImage} src={src} alt={props.alt} />
	    	</div>
	    );

}

export default Magnifier;