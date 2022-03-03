import React, {useEffect, useState, useRef} from 'react';
import firebaseUtil from './FirebaseUtil'
import { useParams, useHistory  } from "react-router-dom";
import Video from './Video';
import Capture from './Capture';
import styles from './CoinEdit.module.css'; 
import stylesForm from './Form.module.css'; 



const getCoin = docid => {
   return firebaseUtil.getDb()
       .collection('coins')
       .doc(docid)
       .get()
       .then(doc => doc.data())
       .catch(error => {
           console.log('Error getting document:', error);
       });
};

const updateData = (docid, coin, history) => {
      
      firebaseUtil.getDb()
           .collection('coins')
           .doc(docid)
           .set(coin)
           .then( ()=> {
              updateMetaData(coin.photoArr[0],coin.photoArr[1]);
              history.push('/coin/' + coin.id)
            })
           .catch(error => {
               console.log('Error getting document:', error);
           });
}


const updateMetaData = (img1,img2) => {
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

const CoinEdit = props => {

    let history = useHistory();
    let storage = firebaseUtil.getStorage();
    let storageRef = storage.ref();
    const {docid} = useParams();
    const [coin, setCoin] = useState({});
    const [images, addNew] = useState(false);
    const videoRef = useRef(null);
    const mainRef = useRef();
    document.title = 'Edit Coin | Cha-Ching Coin Database';

    useEffect(() => {
       getCoin(docid).then(setCoin);
       mainRef.current.focus();
    }, [docid]);


    const captureImage = props => {
      videoRef.current.takePicture(props);
    }

    const deleteImages = () => {
      let frontImage = storageRef.child(coin.photoArr[0]);
      let backImage = storageRef.child(coin.photoArr[1]);

      // Delete the file
      frontImage.delete().then(() => {
        // File deleted successfully
      }).catch((error) => {
        // Uh-oh, an error occurred!
         console.log(error);
      });
      backImage.delete().then(() => {
        // File deleted successfully
      }).catch((error) => {
        // Uh-oh, an error occurred!
        console.log(error);
      });
    }

    const deleteCoin = event => {
      event.preventDefault();
      deleteImages();
      
      firebaseUtil.getDb().collection('coins').doc(docid).delete().then(() => {
          history.push('/');
      }).catch((error) => {
          console.error("Error removing document: ", error);
      });
      
    }

    const uploadImage = docid => {

      let timestamp = Date.now();
      let frontRef = storageRef.child(timestamp + '_front.png');
      let backRef = storageRef.child(timestamp + '_back.png');
      let photoArr = [timestamp + '_front.png',timestamp + '_back.png'];
      let photoArrPaths = [];


      frontRef.putString(videoRef.current.state.front.replace('data:image/png;base64,',''), 'base64').then((snapshot) => {
            snapshot.ref.getDownloadURL().then((downloadURL) => {
                photoArrPaths.push(downloadURL);

                /// When Front is done upload back
                backRef.putString(videoRef.current.state.back.replace('data:image/png;base64,',''), 'base64').then((snapshot) => {
                        snapshot.ref.getDownloadURL().then((downloadURL) => {
                            photoArrPaths.push(downloadURL);
                            updateData(docid,{...coin,photoArr,photoArrPaths},history);
                        });
                });
             
            });
        });
    }

   

    const updateCoin = docid => {
        if( videoRef.current != null ) {
          deleteImages();
          uploadImage(docid);
        } else {
          updateData(docid,coin,history);
        }
    }

    const handleSubmit = event => {
      event.preventDefault();
      updateCoin(docid);
    }


   return (
      <main ref={mainRef} className={styles.coinEdit} aria-labelledby="mainHeading" tabIndex="-1">
        <h1 id="mainHeading">Editing: {coin.year} {coin.name}</h1>

        <div className={styles.flex}>
          {coin && coin.photoArrPaths &&
          <div className={styles.flexItem}>

            {images === false &&
            <div className={styles.currentImage}>
              <h2>Current Images</h2> 
              <img src={coin.photoArrPaths[0]} alt='Front' />
              <img src={coin.photoArrPaths[1]} alt='Back' />
              <button onClick={()=> addNew(true)}>Add New Images</button>
            </div>

            }

            {images === true &&
            <div className={styles.newImage}>
              <h2>New Images</h2>
              <Capture capture={captureImage} />
              <Video ref={videoRef} />
            </div>
            }


          </div>
          }

          {coin &&
          <div className={styles.flexItem}>
            <h2>Coin Details</h2>
            <form  className={stylesForm.form} onSubmit={handleSubmit}>
            

            <label htmlFor="id">ID</label>
            <input type="text" id="id" name="id" placeholder="0001" defaultValue={coin.id} onChange={e => setCoin({ ...coin, id: e.target.value })}  />

            <label htmlFor="favorite">Favorite</label>
            <select value={coin.favorite}  id="favorite" name="favorite" onChange={e => setCoin({ ...coin, favorite: e.target.value })} >
              <option value="false">false</option>
              <option value="true">true</option>
            </select>

            <label htmlFor="year">Year</label>
            <input type="text" id="year" name="year" placeholder="1999" defaultValue={coin.year} onChange={e => setCoin({ ...coin, year: e.target.value })}  />

            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" placeholder="Silver Dollar" defaultValue={coin.name} onChange={(e) => setCoin({ ...coin, name: e.target.value })}  />

            <label htmlFor="value">Value</label>
            <input type="text" id="value" name="value" placeholder="1" defaultValue={coin.value} onChange={(e) => setCoin({ ...coin, value: e.target.value })}  />

            <label htmlFor="uscoinbook">US Coin Book</label>
            <input type="text" id="uscoinbook" name="uscoinbook" placeholder="https://" defaultValue={coin.uscoinbook} onChange={(e) => setCoin({ ...coin, uscoinbook: e.target.value })}  />

            <label htmlFor="estimate">Estimate</label>
            <input type="text" id="estimate" name="estimate" placeholder="100" defaultValue={coin.estimate} onChange={(e) => setCoin({ ...coin, estimate: e.target.value })}  />

            <label htmlFor="grade">Grade</label>
            <select value={coin.grade}  id="grade" name="grade" onChange={e => setCoin({ ...coin, grade: e.target.value })} >
              <option value="Proof">Proof</option>
              <option value="Uncirculated">Uncirculated</option>
              <option value="Extra Fine">Extra Fine</option>
              <option value="Very Fine">Very Fine</option>
              <option value="Fine">Fine</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Bad">Bad</option>
            </select>


            <label htmlFor="mint">Mint</label>
            <select value={coin.mint}  id="mint" name="mint" onChange={e => setCoin({ ...coin, mint: e.target.value })} >
                <option value="P">Philadelphia</option>
                <option value="CC">Carson City</option>
                <option value="C">Charlotee</option>
                <option value="D">Denver</option>
                <option value="O">New Orleans</option>
                <option value="S">San Francisco</option>
                <option value="W">West Point</option>
                <option value="N">No Mint Mark</option>
              </select>

              <label htmlFor="notes">Notes</label>
              <textarea value={coin.notes} id="notes" name="notes" onChange={e => setCoin({ ...coin, notes: e.target.value })} />

            <div>
              <button>Submit</button>
            </div>

            <div>
              <button onClick={deleteCoin}>Delete</button>
            </div>

            </form>
          </div>
          }
        </div>

      </main>
   );
};

export default CoinEdit;




