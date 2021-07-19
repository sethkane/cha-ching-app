import {useEffect, useState} from 'react';
import firebaseUtil from './FirebaseUtil'
import {useParams } from "react-router-dom";
import styles from './CoinDetail.module.css'; 

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


const CoinDetail = props => {

    const {id} = useParams();
    const [coin, setCoin] = useState({});
    const [title, setTitle] = useState('Cha-Ching Coin Database');
    const [image, setImage] = useState();
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
    

    const FavoriteIcon = props => {
      return (
        <span className={styles.favorite}>
            {coin.favorite === 'true'
              ? <img src="/images/favorite-filled.svg" alt="Favorite" />
              : <img src="/images/favorite.svg" alt="Not a Favorite" />
            }
            </span>
        )
    }

    useEffect(()=> {
      if(coin && coin.photoArrPaths){
        setTitle(coin.year + '-' + coin.mint + ' ' + coin.name + ' | Coin #' + coin.id + ' | Cha-Ching Coin Database')
        setImage(coin.photoArrPaths[0]);
      }
    },[coin]);

    useEffect(() => {
       getCoin(id).then(setCoin);
    }, [id]);

   return (

      <main className={styles.coinDetail}>
      {coin && coin.photoArrPaths &&
        <div>

          <span>Coin #{coin.id}</span>
          <h1>{coin.year} {coin.name} <FavoriteIcon /></h1>

            <div className={styles.flex}>
              <div className={styles.flexItem}><img src={coin.photoArrPaths[0]} alt={'Front - ' + coin.year +'-' + coin.mint + ' ' + coin.name} /></div>
              <div className={styles.flexItem}><img src={coin.photoArrPaths[1]} alt={'Back - ' + coin.year +'-' + coin.mint + ' ' + coin.name} /></div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Mint</th>
                  <th>Grade*</th>
                  <th>Est. Val</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${coin.value}</td>
                  <td>{coin.mint}</td>
                  <td>{coin.grade}</td>
                  <td>${coin.estimate}</td>
                </tr>
              </tbody>
            </table>

          <div className={styles.disclaimer}>
            <p>* Not an accurate grade, just an idea</p>
          </div>

        </div>
      }
      </main>
   );
};

export default CoinDetail;




