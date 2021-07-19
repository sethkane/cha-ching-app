import React, { Component } from 'react';
import styles from './Video.module.css'; 


let width = 1280;    // We will scale the photo width to this
let height = 0;     // This will be computed based on the input stream

class Video extends Component {

	constructor(props) {
		super(props);
		this.videoRef = React.createRef();
		this.canvasFrontRef = React.createRef();
		this.imgFrontRef = React.createRef();
		this.canvasBackRef = React.createRef();
		this.imgBackRef = React.createRef();

		this.state = {
	    	front: '',
	    	back: ''
	    };
	}

	isStreaming = () => {

		height = this.videoRef.current.offsetHeight / (this.videoRef.current.offsetWidth/width);
		this.videoRef.current.width = width/3;
		this.videoRef.current.height = height/3;
		this.canvasFrontRef.current.width = width;
		this.canvasBackRef.current.width = width;
		this.canvasFrontRef.current.height = height;
		this.canvasBackRef.current.height = height;
	    this.imgFrontRef.current.width = width/3;
	    this.imgBackRef.current.width = width/3;
	}

	takePicture = (props) => {
		let canvas,ctx,data,img;
		canvas = this.canvasFrontRef.current;
		ctx = canvas.getContext("2d");
		ctx.drawImage(this.videoRef.current, 0, 0, width, height);
		data = canvas.toDataURL('image/png');

		if ( props === 'front') {
			this.setState({front:data});
			img = this.imgFrontRef.current;
		} else {
			this.setState({back:data});
			img = this.imgBackRef.current;
		}
	
        img.src = data;
	}

	componentDidMount = () => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: false })
		.then(stream => { 
			this.canvasFrontRef.current.width = width;
			this.canvasBackRef.current.width = width;
			this.videoRef.current.srcObject = stream;
		    this.videoRef.current.play();
		})
		.catch( err => {
		    console.log("An error occurred: " + err);
		});
	}

	render() {
	    return (
	    	<div className={styles.video}>
	    		<div className={styles.crossHairs}>

			    	<span className={styles.ver}></span>
			    	<span className={styles.hor}></span>
			    	<span className={styles.small}></span>
			    	<span className={styles.medium}></span>
			    	<span className={styles.large}></span>
			    	<video 
			    	onCanPlay={this.isStreaming}
			      	srcobject={this.props.stream}
			    	className={styles.border}
			    	ref={this.videoRef}
			    	>Video stream not available.</video>
			    </div>
		    	<canvas ref={this.canvasFrontRef}></canvas>
		    	<canvas ref={this.canvasBackRef}></canvas>
		    	<img ref={this.imgFrontRef} alt="" />
		    	<img ref={this.imgBackRef} alt="" />
	    	</div>
	    );
	  }
}

export default Video; // Don’t forget to use export default!