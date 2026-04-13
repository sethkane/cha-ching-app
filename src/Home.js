import React, {useEffect, useState, useMemo, useRef} from 'react';
import { Link, useHistory, useLocation  } from "react-router-dom";
import firebaseUtil from './FirebaseUtil';
import styles from './Home.module.css'; 
import { mintArray } from './MintArray';
import jsPDF from 'jspdf';


const getCoins = () => {
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


const dateCompare = (d1, d2) => {
    const date1 = new Date(d1); // NOW
    const date2 = new Date(d2); // Compared
    if(date1 > date2){
        // console.log('${d1} is greater than ${d2}')
        // console.log('Fetch New Data')
        return true;
    } else if(date1 < date2){
        // console.log('${d2} is greater than ${d1}')
        // console.log('Use Local Storage')
        return false;
    } else{
        // console.log('Both dates are equal')
        return false;
    }
}

const SortIcon = ({sort, dir, sortItem, ...props}) => {
	return (
		<span aria-hidden="true">
		{ props.props === sort
			? <img src="images/sort.svg" className={`${dir === 'asc' ? styles.asc : styles.desc}`} alt="" />
			: ''
		}
		</span>

	);
};

const SortHeading = ({sort, dir, sortItem, ...props}) => {
	if(dir === 'desc') {
		dir = 'descending'
	} else {
		dir = 'ascending'
	}
	return (
		<th aria-sort={sort === props.id ? dir : 'none'} className={props.showmodbile === 'false'? styles.showDesktop : ''} onClick={() => sortItem(props.id)}><button aria-label={props.arialabel} className={styles.clickDisabled} onClick={() => sortItem(props.id)}>{props.name}<SortIcon props={props.id} sort={sort} /></button></th>
	);
}


const FavoriteIcon = props => {
  return (
    <span className={styles.favorite}>
        {props.fave === 'true' 
          ? <img src="/images/favorite-filled-white.svg" alt="Favorite" />
          : ''
        }
        </span>
    )
}

const Home = props => {

		const [exportImages, setExportImages] = useState(false);
		const [exporting, setExporting] = useState(false);
		const [search, setSearch] = useState('');
		const [fave, setFave] = useState('');
		const [filter, setFilter] = useState('');
		const [mints, setMints] = useState([]);
		const [coins, setCoins] = useState([]);
		const [items, setMore] = useState(10);
		const [sort, setSort] = useState('id');
		const [dir, setDir] = useState('asc');
		const localCoins = localStorage.getItem('coins');
		const localDir = localStorage.getItem('dir');
		const localSort = localStorage.getItem('sort');
		const localFave = localStorage.getItem('fave');
		const localSearch = localStorage.getItem('search');
		const localFilter = localStorage.getItem('filter');
		const localItems = localStorage.getItem('items');
		const localMints = localStorage.getItem('mints');
		const searchField = React.createRef();
		const linkRef = useRef({});
		const mainRef = useRef();
		const history = useHistory();
		const hash = useLocation().hash;
		const title = 'Cha-Ching Coin Database';
		const image = 'https://firebasestorage.googleapis.com/v0/b/cha-ching-7e248.appspot.com/o/1620405863007_front.png?alt=media&token=59ed6929-8b4e-4150-a0ab-bf70cf1f9dfb';
		const date = new Date();
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
	    

		let user;
		if(props.auth.auth.user && props.auth.auth.user.uid === '0UTyRK7o0sNu8EFN5J8xqHiiV5q2'){
			user = props.auth.auth.user;
		}


		useEffect(() => {
			if(localDir !== null || localSort !== null){
				setDir(localStorage.getItem('dir'));
				setSort(localStorage.getItem('sort'));	
			}
			if(localFave !== null){
				setFave(localStorage.getItem('fave'));
			}

			if(localMints !== null){
				setMints(JSON.parse(localStorage.getItem('mints')));
			} else {
				setMints([]);
			}

			if(localItems !== null){
				setMore(parseFloat(localStorage.getItem('items')));
			}

			if(localFilter !== null){
				setFilter(localStorage.getItem('filter'));
			}

			if(localCoins !== null && dateCompare(date,localStorage.getItem('ttl')) === false){
				setCoins(JSON.parse(localCoins));
				// console.log('Local');
			} else {
				getCoins().then(response => {
					setCoins(response);
					localStorage.setItem('coins', JSON.stringify(response));
					// Set TTL to 10 Days From the Fetch
					date.setDate(date.getDate() + 7);
					localStorage.setItem('ttl', date);
					console.log('Firebase');
				});
			}
			if(hash) {
				let temp_hash = decodeURIComponent(hash);
				setSearch(temp_hash.replace('#',''))
			}
			if(localSearch !== null) {
				setSearch(localStorage.getItem('search').replace('#',''))
			}
		},[]);

		const getCoinTypes = (coins) => {
			const result = [];
				const map = new Map();
				for (const item of coins) {
				    if(!map.has(item.name)){
				        map.set(item.name, true);    // set any value to Map
				        result.push({
				            name: item.name
				        });
				    }
				}
				
			return result;
		}

		const coinTypes = getCoinTypes(coins);

		const filtered = useMemo(() => {

			return coins.filter(coin => {

				// Mints
				if(mints.length){
					if (mints.indexOf(coin.mint) === -1) {
						return false
					}
				}

				// Favorites
				if (fave) {
					if(coin.favorite === 'false') {
						return false
					}
				}

				/// Filter Drop Down
				if (coin.name.toLowerCase().indexOf(filter.toLowerCase()) === -1) {
					return false
				}

				/// Search Query
				if( coin.notes) {
					if (coin.id.toLowerCase().indexOf(search.toLowerCase()) === -1 && coin.name.toLowerCase().indexOf(search.toLowerCase()) === -1 && coin.year.toLowerCase().indexOf(search.toLowerCase()) === -1 && coin.notes.toLowerCase().indexOf(search.toLowerCase()) === -1) {
						return false
					}
				} else {
					if (coin.id.toLowerCase().indexOf(search.toLowerCase()) === -1 && coin.name.toLowerCase().indexOf(search.toLowerCase()) === -1 && coin.year.toLowerCase().indexOf(search.toLowerCase()) === -1 ) {
						return false
					}
				}

				return true

				// return   (fullName.toLowerCase().indexOf(search.toLowerCase()) !== -1 || coin.id.indexOf(search) !== -1 ) && coin.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1 && fullName.toLowerCase().indexOf(fave.toLowerCase()) !== -1 
			});
		}, [coins, fave, search, filter, mints]);

	
		useEffect(() => {
			localStorage.setItem('filtered', JSON.stringify(filtered));
		}, [filtered,sort,dir]);


		useEffect(() => {
			localStorage.setItem('mints', JSON.stringify(mints));
		}, [mints]);
			    

		const total = '$' + Object.values(filtered).reduce((t, {estimate}) => t + parseFloat(estimate), 0).toFixed(2);
	
		const sortItem = (props) => {	
			//console.log(props);	
			if(dir === 'asc' && sort === props){
				setDir('desc');
				localStorage.setItem('dir', 'desc');
			}else{
				setDir('asc');
				localStorage.setItem('dir', 'asc');
			}
			localStorage.setItem('sort', props);
			setSort(props);

		}

		
		const returnSort = (a,b) => {
			switch(sort) {
			  	case 'id':
				  	case 'year':
				  	if(dir === 'asc') {
				  		return parseFloat(a[sort]) - parseFloat(b[sort]);
				  	} else {
				  		return parseFloat(b[sort]) - parseFloat(a[sort]);
				  	}
				  	case 'estimate	':
				  	if(dir === 'asc') {
				  		return parseFloat(a[sort]) - parseFloat(b[sort]);
				  	} else {
				  		return parseFloat(b[sort]) - parseFloat(a[sort]);
				  	}
			  	default:
				  	let nameA = (a[sort] ?? '').toLowerCase();
				  	let nameB = (b[sort] ?? '').toLowerCase();

				  	if(dir === 'asc'){
				  	 	if (nameA < nameB) {
					  		return -1;
					  	}
					  	if (nameA > nameB) {
					   		return 1;
					  	}
					 	// names must be equal
					  	return 0;
					} else {
						if (nameA > nameB) {
					    	return -1;
					  	}
					  	if (nameA < nameB) {
					    	return 1;
					  	}
					  	// names must be equal
					  	return 0;
					}
			}
		}


		const returnFilterSort = (a,b) => {
			
		  	let nameA = a.name.toLowerCase();
		  	let nameB = b.name.toLowerCase();

	  	 	if (nameA < nameB) {
		  		return -1;
		  	}
		  	if (nameA > nameB) {
		   		return 1;
		  	}
		 	// names must be equal
		  	return 0;
					
		}
		

		// This is only used as needed
		// const massUpdate = event => {
		// 	coins.forEach(coin => {

		// 		if(coin.favorite === '') {
		// 			var update = firebaseUtil.getDb().collection("coins").doc(coin.docid);
		// 			return update.update({
		// 			    favorite: 'false'
		// 			})
		// 			.then(() => {
		// 			    console.log("Document successfully updated!");
		// 			})
		// 			.catch((error) => {
		// 			    // The document probably doesn't exist.
		// 			    console.error("Error updating document: ", error);
		// 			});
		// 		} else {
		// 			console.log('skip');
		// 		}
					
		// 	});
		// }

		
		const checkUrl = props => {
			let url = '#' + props;
			history.push(url)
		}


		const handleMore = event => {
			if(items >= filtered.length) {
				setMore( items );
				localStorage.setItem('items', items);
			} else {
				setMore( items + 10 );
				localStorage.setItem('items', parseFloat(items + 10));
			}

			setTimeout(function(){
				linkRef.current[(items-1)+1].focus();
			},500)
		}
		
		
		const handleSearch = event => {
			setSearch(event.target.value);
			localStorage.setItem('search', event.target.value);
			checkUrl(event.target.value);
		};

		const handleFilter = event => {
			setFilter(event.target.value);
			localStorage.setItem('filter', event.target.value);
		};

		const handleCheckBox = event => {
			if( event.target.checked === true ){
				setFave(':favorite');
				localStorage.setItem('fave', ':favorite');

			} else {
				setFave('')
				localStorage.setItem('fave', '');
			}
		}

		const handleMints = (event,checkbox) => {
			if (event.target.checked) {
		    	setMints([...mints, checkbox]);
		    } else {
				setMints(prevState => {
					return prevState.filter((currItem) => currItem !== checkbox)
				});
		    }
		}

		const goTo = props => {
			history.push(props)
		}

		const handleExportPDF = async () => {
			setExporting(true);
		    const visibleCoins = filtered.sort((a, b) => returnSort(a, b)).slice(0, items);
		    const doc = new jsPDF({ orientation: 'landscape' });

		    const pageWidth = doc.internal.pageSize.getWidth();
		    const pageHeight = doc.internal.pageSize.getHeight();
		    const margin = 10;
		    const rowHeight = 40;
		    const imgWidth = 47;
		    const imgHeight = 35;
		    const colWidths = {
		        id: 15,
		        year: 20,
		        name: 50,
		        mint: 20,
		        estimate: 25,
		        front: imgWidth + 5,
		        back: imgWidth + 5,
		    };

		    const drawHeader = () => {
		        doc.setFillColor(204, 204, 204);
		        doc.rect(margin, 10, pageWidth - margin * 2, 8, 'F');
		        doc.setFontSize(9);
		        doc.setFont('helvetica', 'bold');
		        let x = margin + 2;
		        doc.text('Coin #', x, 16); x += colWidths.id;
		        doc.text('Year', x, 16); x += colWidths.year;
		        doc.text('Name', x, 16); x += colWidths.name;
		        doc.text('Mint', x, 16); x += colWidths.mint;
		        doc.text('Estimate', x, 16); x += colWidths.estimate;
		        doc.text('Front', x, 16); x += colWidths.front;
		        doc.text('Back', x, 16);
		    };

		    const fetchImageAsBase64 = async (url) => {
		        try {
		            const response = await fetch(url);
		            const blob = await response.blob();
		            return await new Promise(resolve => {
		                const reader = new FileReader();
		                reader.onloadend = () => resolve(reader.result);
		                reader.readAsDataURL(blob);
		            });
		        } catch (err) {
		            console.log('Image fetch error:', err);
		            return null;
		        }
		    };

		    doc.setFontSize(16);
		    doc.setFont('helvetica', 'bold');
		    doc.text('Cha-Ching Coin Database', margin, 8);
		    doc.setFontSize(10);
		    doc.setFont('helvetica', 'normal');
		    doc.text(`Exported: ${new Date().toLocaleDateString()} | ${visibleCoins.length} coins`, pageWidth - margin, 8, { align: 'right' });

		    drawHeader();

		    let y = 20;

		    for (let i = 0; i < visibleCoins.length; i++) {
		        const coin = visibleCoins[i];

		        if (y + rowHeight > pageHeight - margin) {
		            doc.addPage();
		            doc.setFontSize(16);
		            doc.setFont('helvetica', 'bold');
		            doc.text('Cha-Ching Coin Database', margin, 8);
		            doc.setFontSize(10);
		            doc.setFont('helvetica', 'normal');
		            doc.text(`Exported: ${new Date().toLocaleDateString()} | ${visibleCoins.length} coins`, pageWidth - margin, 8, { align: 'right' });
		            drawHeader();
		            y = 20;
		        }

		        if (i % 2 === 0) {
		            doc.setFillColor(236, 236, 236);
		            doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'F');
		        }

		        doc.setFontSize(9);
		        doc.setFont('helvetica', 'normal');
		        let x = margin + 2;
		        const textY = y + rowHeight / 2;

		        doc.text(String(coin.id ?? ''), x, textY); x += colWidths.id;
		        doc.text(String(coin.year ?? ''), x, textY); x += colWidths.year;

		        const nameLines = doc.splitTextToSize(String(coin.name ?? ''), colWidths.name - 2);
		        doc.text(nameLines, x, textY - ((nameLines.length - 1) * 3)); x += colWidths.name;

		        doc.text(String(coin.mint ?? ''), x, textY); x += colWidths.mint;
		        doc.text(coin.estimate ? '$' + coin.estimate : '', x, textY); x += colWidths.estimate;

		        if (exportImages) {
		            const frontBase64 = await fetchImageAsBase64(coin.photoArrPaths[0]);
		            const backBase64 = await fetchImageAsBase64(coin.photoArrPaths[1]);

		            if (frontBase64) {
		                doc.addImage(frontBase64, 'PNG', x, y + 2, imgWidth, imgHeight);
		            }
		            x += colWidths.front;
		            if (backBase64) {
		                doc.addImage(backBase64, 'PNG', x, y + 2, imgWidth, imgHeight);
		            }
		        } else {
		            doc.setFontSize(6);
		            doc.setTextColor(0, 0, 255);
		            doc.text(coin.photoArrPaths[0] ?? '', x, textY, { maxWidth: colWidths.front - 2 });
		            x += colWidths.front;
		            doc.text(coin.photoArrPaths[1] ?? '', x, textY, { maxWidth: colWidths.back - 2 });
		            doc.setTextColor(0, 0, 0);
		            doc.setFontSize(9);
		        }

		        doc.setDrawColor(180, 180, 180);
		        doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'S');

		        y += rowHeight;
		    }

		    doc.save(`coins-export-${new Date().toISOString().split('T')[0]}.pdf`);
		    setExporting(false);
		};
    
		const reset = () => {
			setMints([]);
			localStorage.setItem('mints', []);
			setMore(10);
			localStorage.setItem('items', 10);
			setSearch('');
			localStorage.setItem('search', '');
			setFilter('');
			localStorage.setItem('filter', '');
			setFave('');
			localStorage.setItem('fave', '');
			setDir('asc');
			localStorage.setItem('dir', 'asc');
			setSort('id');
			localStorage.setItem('sort', 'id');
			history.push('')
		};



		return (
			<main ref={mainRef} className={styles.home} aria-labelledby="mainHeading" tabIndex="-1">
				<h1 id="mainHeading">Cha-Ching Coins</h1> 

				<section aria-label="Information Bar" className={styles.results}>
				{filtered &&
		    		<div aria-live="polite" aria-atomic="true" className={styles.push}>
		    			{ user
		    			? <p>Results: {filtered.length} Coins | Est. {total}</p>
		    			: <p>Results: {filtered.length} Coins</p>
		    			}
		    		</div>
					}
				</section>
				<div className={styles.flex}>
					
					<section aria-label="Search and Filtering" className={styles.facets}>
						<div>
							<label htmlFor="search">Search</label>
							<input
								ref={searchField}
								id="search"
						        type="text"
						        value={search}
						        placeholder="Eg. 0019 or 1884 or Morgan"
						        onChange={handleSearch}
						      />

						</div>
						<div>
							<label htmlFor="filter">Name Filter</label>
							<select
								id="filter"
								value={filter}
								onChange={handleFilter}>
								<option></option>
								{ coinTypes.sort((a, b) => returnFilterSort(a,b)).map((types, index) =>
								<option key={'filter_' + index}  value={types.name}>{types.name}</option>
								)}
							</select>
						</div>

						<div className={styles.checkboxItem}>
							<fieldset>
								<legend>Special</legend>

								<div className={styles.checkboxItem}>
									<label htmlFor="favorite">
									<input type="checkbox" 
										name="favorite"
										id="favorite"
										checked={fave}
										onChange={handleCheckBox} />
										Favorites</label>
								</div>
							</fieldset>
						</div>


						<div className={styles.checkboxItem}>
							<fieldset>
							<legend>Mints</legend>


							{mintArray.map(({ name, value }, index) => {
								return (
									<label key={index} htmlFor={'mint-' + value}>
									<input type="checkbox" 
										name="mints"
										id={'mint-' + value}
										value={value}
										checked={mints.indexOf(value) !== -1}
										onChange={(event) => handleMints(event, value)} />
									 	{name}</label>
									 );
	        					})}
							</fieldset>
						</div>

						<div>
							<button className={styles.reset} onClick={()=> {reset()}}><img src="/images/clear.svg" alt="" /> Reset</button>
						</div>

						{user &&
						    <div>
						        <label>
						            <input
						                type="checkbox"
						                checked={exportImages}
						                onChange={e => setExportImages(e.target.checked)}
						            />
						            {' '}Include images
						        </label>
						        <button onClick={handleExportPDF} disabled={exporting}>
								    {exporting ? 'Exporting...' : `Export to PDF (${Math.min(items, filtered.length)} coins)`}
								</button>
						    </div>
						}


					</section>

					<section aria-label="Coin Results Table" className={styles.data}>

						<table className={styles.table}>
							<thead>
								<tr>
									<SortHeading sort={sort} dir={dir} sortItem={sortItem} name="Coin #" id="id" showmodbile="true" arialabel="Sort by Coin #" />
									<SortHeading sort={sort} dir={dir} sortItem={sortItem} name="Year" id="year" showmodbile="true" arialabel="Sort by Year" />
									<SortHeading sort={sort} dir={dir} sortItem={sortItem} name="Name" id="name" showmodbile="false" arialabel="Sort by Name" />
									<SortHeading sort={sort} dir={dir} sortItem={sortItem} name="Mint" id="mint" showmodbile="false" arialabel="Sort by Mint" />
									<SortHeading sort={sort} dir={dir} sortItem={sortItem} name="Est" id="estimate" showmodbile="false" arialabel="Sort by Estimate" />
									<th className={styles.noPointer}>Front</th>
								</tr>
							</thead>

							{filtered?.length ? (
							<tbody>
								{ filtered.sort((a, b) => returnSort(a,b)).slice(0, items).map( (coin,index) => 
									<tr key={coin.docid}  onClick={()=> {goTo('/coin/' + coin.id)}}>
										<td><Link 
											ref={(element) => linkRef.current[index]=element}
											aria-label={'View details Coin #' + coin.id + ' ' + coin.year + '-' + coin.mint + ' ' + coin.name } 
											className={styles.clickDisabled} 
											to={'/coin/' + coin.id}>{coin.id}</Link></td>
										<td>{coin.year}</td>
										<td className={styles.showDesktop}>{coin.name}</td>
										<td className={styles.showDesktop}>{coin.mint}</td>
										<td className={styles.showDesktop}>${coin.estimate}</td>
										<td><FavoriteIcon fave={coin.favorite} /> <img src={coin.photoArrPaths[0]} alt={'Front - ' + coin.year +'-' + coin.mint + ' ' + coin.name} /> </td>
									</tr>
								) }

							</tbody>

							) : (
							<tbody>
								<tr><td colSpan="5">No Results</td></tr>
							</tbody>
							)}
						</table>
					</section>
				</div>


				<div className={styles.actions}>
					{filtered.length>items &&
					<button onClick={handleMore}>Show More</button>
					}
				</div>



			</main>
		);

}


export default Home; // Don’t forget to use export default!