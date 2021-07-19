import React, { Component } from 'react';
import firebaseUtil from './FirebaseUtil'
import Video from './Video';
import Capture from './Capture';
import Form from './Form';
import styles from './AddCoin.module.css'; 

class AddCoin extends Component {

	photos = [];
	photoPaths = [];
	db = firebaseUtil.getDb();
	storage = firebaseUtil.getStorage();
	storageRef = firebaseUtil.getStorage().ref();

	constructor(props) {
		super(props);
		this.videoRef = React.createRef();
		this.formRef = React.createRef();
		this.state = {}
	}


	captureImage = (props) => {
		this.videoRef.current.takePicture(props);
	}

	completed = () => {
		this.photos = [];
		this.photoPaths = [];
		this.formRef.current.setState({submitting: ''});
		alert('Completed');
	}

	updateMetaData = (img1,img2) => {
	    let storage = firebaseUtil.getStorage();
	    let storageRef = storage.ref();
	    let frontImage = storageRef.child(img1);
	    let backImage = storageRef.child(img2);

	    let newMetadata = {
	      cacheControl: 'public,max-age=300',
	      contentType: 'image/png'
	    };

	      frontImage.updateMetadata(newMetadata)
	      .then((metadata) => {
	        // Updated metadata for 'images/forest.jpg' is returned in the Promise
	      }).catch((error) => {
	        // Uh-oh, an error occurred!
	        console.log(error);
	      });

	      backImage.updateMetadata(newMetadata)
	      .then((metadata) => {
	        // Updated metadata for 'images/forest.jpg' is returned in the Promise
	      }).catch((error) => {
	        // Uh-oh, an error occurred!
	        console.log(error);
	      });
	  
	}

	insert = () => {
		this.setState(this.formRef.current.state);
		this.setState({photoArr:this.photos});
		this.setState({photoArrPaths:this.photoPaths});


        this.db.collection("coins").add(this.state)
	        .then((docRef) => {
	        	this.updateMetaData(this.photos[0],this.photos[1]);
	            this.completed();
	        })
	        .catch((error) => {
	            console.error("Error adding document: ", error);
	        });
    }

	upload = () => {
        let timestamp = Date.now();
        let frontRef = this.storageRef.child(timestamp + '_front.png');
        let backRef = this.storageRef.child(timestamp + '_back.png');
        this.photos = [timestamp + '_front.png',timestamp + '_back.png'];

        // Upload Front
        frontRef.putString(this.videoRef.current.state.front.replace('data:image/png;base64,',''), 'base64').then((snapshot) => {
            snapshot.ref.getDownloadURL().then((downloadURL) => {
                this.photoPaths.push(downloadURL);

                /// When Front is done upload back
                backRef.putString(this.videoRef.current.state.back.replace('data:image/png;base64,',''), 'base64').then((snapshot) => {
                        snapshot.ref.getDownloadURL().then((downloadURL) => {
                            this.photoPaths.push(downloadURL);
                            this.insert();
                        });
                });
             
            });
        });
    }


	handleSubmit = ()  =>{
		this.upload();
	}


  	render() {

	    return (
	    	<main className={styles.addCoin}>
	    		<h1>Cha-Ching Coins</h1>
	    		<div className={styles.flex}>
		    		<div className={styles.flexItem}>
			    		<Capture capture={this.captureImage} />
			    		<Video ref={this.videoRef} />
			    	</div>
			    	<div className={styles.flexItem}>
		    			<Form ref={this.formRef} form={this.handleSubmit} />
		    		</div>
		    	</div>
	    	</main>
	    );
  	}
}

export default AddCoin; // Don’t forget to use export default!