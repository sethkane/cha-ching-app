import {useEffect, useState, useRef} from 'react';
import firebaseUtil from './FirebaseUtil'
import {Link, useParams } from "react-router-dom";
import styles from './CoinDetail.module.css'; 
import Magnifier from './Magnifier';


const getCoin = id => {
  // console.log('Firebase Get One');
  return firebaseUtil.getDb().collection('coins').where('id', '==', id)
    .get()
    .then((querySnapshot) => {
        const docs = [];
        querySnapshot.forEach(doc => docs.push(({docid: doc.id, ...doc.data()})));
        return docs;
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
};


const getAllCoins = () => {
  console.log('Firebase Get All');
   return firebaseUtil.getDb()
      .collection('coins')
      .orderBy('id')
      //.limit(5) // Use this for Development
      .get()
      .then(querySnapshot => {
      return querySnapshot.docs.map(doc => ({docid: doc.id, ...doc.data()}));
    })
      .catch(error => {
           console.log('Error getting document:', error);
       });
};


const CoinDetail = props => {

    let user;
    if(props.auth.auth.user && props.auth.auth.user.uid === '0UTyRK7o0sNu8EFN5J8xqHiiV5q2'){
      user = props.auth.auth.user;
    }



    const {id} = useParams();
    const [coin, setCoin] = useState({});
    const [title, setTitle] = useState('Cha-Ching Coin Database');
    const [image, setImage] = useState();
    const [fave, setFave] = useState();
    const [allCoins, setAllCoins] = useState({});
    const localCoins = localStorage.getItem('filtered');
    const heading = useRef();
    document.title = title;


    // Set Meta Date For This page
    /// Change Name
    document.querySelector('meta[itemprop="name"]').setAttribute("content", title)
    document.querySelector('meta[property="og:title"]').setAttribute("content", title)
    document.querySelector('meta[name="twitter:title"').setAttribute("content", title)

    /// Change Images
    document.querySelector('meta[itemprop="image"]').setAttribute("content", image)
    document.querySelector('meta[property="og:image"]').setAttribute("content", image)
    document.querySelector('meta[name="twitter:image"]').setAttribute("content", image)

    /// Change URL
    document.querySelector('link[rel="canonical"]').setAttribute("href", window.location.href)
    document.querySelector('meta[property="og:url"]').setAttribute("content", window.location.href)
    

    const getPrevNext = () => {
        if(allCoins.length){
        let index = allCoins.findIndex(item => coin[0].id === item.id);
        return index;
        }
    };

    const setFavorite = () => {
        let val;
        if(fave === 'true') {
          setFave('false');
          val = 'false';
        } else {
          setFave('true');
          val = 'true';
        }
        firebaseUtil.getDb()
          .collection('coins')
          .doc(coin[0].docid)
          .set({...coin[0],favorite:val})
          .then( ()=> {
              console.log(val)
          })
          .catch(error => {
             console.log('Error getting document:', error);
          });
    }

    const FavoriteButton = props => {
      return (
        <button id="favorite" className={styles.favorite} onClick={setFavorite}>
            {fave === 'true' 
              ? <img src="/images/favorite-filled.svg" alt="Favorite" />
              : <img src="/images/favorite.svg" alt="Not a Favorite" />
            }
            </button>
        )
    }

    const FavoriteIcon = props => {
      return (
        <span id="favorite" className={styles.favorite}>
            {fave === 'true' 
              ? <img src="/images/favorite-filled.svg" alt="Favorite" />
              : <img src="/images/favorite.svg" alt="Not a Favorite" />
            }
            </span>
        )
    }

    const Favorite = () => {
      let element;
      if(user) {
        element =  <FavoriteButton />;
      } else {
        element =  <FavoriteIcon />
      }
      return (
        element
      )
    }

    useEffect(()=> {

      if(coin?.length){
        setTitle(coin[0].year + '-' + coin[0].mint + ' ' + coin[0].name + ' | Coin #' + coin[0].id + ' | Cha-Ching Coin Database');
        setImage(coin[0].photoArrPaths[0]);
        setFave(coin[0].favorite);
        heading.current.focus();
      }
    },[coin]);

    useEffect(() => {
      getCoin(id).then(setCoin);

      

      if(localCoins !== null){
        // console.log('Local');
        setAllCoins(JSON.parse(localCoins));
      } else {
        getAllCoins().then(response => {
          setAllCoins(response);
          localStorage.setItem('coins', JSON.stringify(response));
          console.log('Firebase');
        });
      }
    }, [id]);

   return (

      <main className={styles.coinDetail}>
      {coin?.length &&
        <div>

        <div className={styles.flex}>
          <h1 ref={heading} tabIndex="-1" aria-describedby="favorite"><span>Coin #{coin[0].id}</span> {coin[0].year} {coin[0].name}</h1>
          <Favorite />
        </div>


          <ul className={styles.advance}>
          {allCoins[getPrevNext()-1] &&
            <li className={styles.prev} ><Link to={'/coin/' + allCoins[getPrevNext()-1].id}><img src="/images/back-arrow.svg" alt="Go to Previous Coins" /></Link></li>
          }
          {allCoins[getPrevNext()+1] &&
            <li className={styles.next}><Link to={'/coin/' + allCoins[getPrevNext()+1].id}><img src="/images/forward-arrow.svg" alt="Go to Next Coin" /></Link></li>
          }
          </ul>

            <div className={styles.flex}>

              <div className={styles.flexItem}>
                <Magnifier src={coin[0].photoArrPaths[0]} alt={'Front - ' + coin[0].year +'-' + coin[0].mint + ' ' + coin[0].name} />
              </div>
              <div className={styles.flexItem}>
                <Magnifier src={coin[0].photoArrPaths[1]} alt={'Back - ' + coin[0].year +'-' + coin[0].mint + ' ' + coin[0].name} />
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Mint</th>
                  <th>Grade*</th>
                  <th>Est. Val</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${coin[0].value}</td>
                  <td>{coin[0].mint}</td>
                  <td>{coin[0].grade}</td>
                  <td>${coin[0].estimate}</td>
                  <td>
                    <ul className={styles.actions}>
                      <li><a href={coin[0].uscoinbook} rel='noopener noreferrer' target='_blank'><img src="/images/book.svg" title="Reference Materials" alt="Read More" /></a></li>
                      <li> <Link to={'/public/' + coin[0].docid} rel='noopener noreferrer' target='_blank'><img src="/images/share.svg" title="Share this coin to a public URL" alt="Public Share Coin" /></Link></li>
                      {user &&<li> <Link to={'/coin/edit/' + coin[0].docid}><img src="/images/edit.svg" alt="Edit Coin" /></Link></li>}
                    </ul>
                    </td>
                </tr>
              </tbody>
            </table>
          {coin[0].notes &&
          <div>
            <h2>Notes</h2><p>{coin[0].notes}</p>
          </div>
          }

          <div className={styles.disclaimer}>
            <p>* Not an accurate grade, just an idea</p>
          </div>

        </div>
      }
      </main>
   );
};

export default CoinDetail;




