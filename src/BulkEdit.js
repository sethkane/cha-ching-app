import React, { useEffect, useState } from 'react';
import firebaseUtil from './FirebaseUtil';
import styles from './Home.module.css'; 
import stylesForm from './Form.module.css'; 

const BulkEdit = () => {
    const [coins, setCoins] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [selected, setSelected] = useState([]);
    const [hasQueried, setHasQueried] = useState(false);

    // Filter controls
    const [filterField, setFilterField] = useState('name');
    const [filterValue, setFilterValue] = useState('');

    // Bulk update controls
    const [updateField, setUpdateField] = useState('grade');
    const [updateValue, setUpdateValue] = useState('');

    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    document.title = 'Bulk Edit | Cha-Ching Coin Database';

    // Load all coins once on mount
    useEffect(() => {
        firebaseUtil.getDb()
            .collection('coins')
            .get()
            .then(snapshot => {
                const data = snapshot.docs.map(doc => ({
                    docid: doc.id,
                    ...doc.data()
                }));
                setCoins(data);
            })
            .catch(error => console.log('Error fetching coins:', error));
    }, []);

    // Filter runs locally against the already-loaded coins
    const handleQuery = () => {
	    if (!filterValue.trim()) return;
	    const results = coins.filter(coin =>
            (coin[filterField] ?? '').toString().toLowerCase().includes(filterValue.trim().toLowerCase())
        ).sort((a, b) => parseFloat(a.id) - parseFloat(b.id));
	    setFiltered(results);
	    setSelected([]);
	    setStatus('');
	    setHasQueried(true);
	};

    const toggleSelect = (docid) => {
        setSelected(prev =>
            prev.includes(docid)
                ? prev.filter(id => id !== docid)
                : [...prev, docid]
        );
    };

    const selectAll = () => setSelected(filtered.map(c => c.docid));
    const selectNone = () => setSelected([]);

    const handleBulkUpdate = async () => {
        if (!selected.length || !updateValue) return;

        setLoading(true);
        setStatus('Updating...');

        const db = firebaseUtil.getDb();
        let batch = db.batch();
        let count = 0;
        const batches = [];

        for (const docid of selected) {
            const ref = db.collection('coins').doc(docid);
            // .update() only touches this one field —
            // photoArr, photoArrPaths, and all other fields are untouched
            batch.update(ref, { [updateField]: updateValue });
            console.log(`docid: ${docid} | field: ${updateField} | new value: ${updateValue}`);
            count++;
            if (count === 500) {
                batches.push(batch.commit());
                batch = db.batch();
                count = 0;
            }
        }
        if (count > 0) batches.push(batch.commit());

        try {
            await Promise.all(batches);

            // Update local state to reflect changes without re-fetching
            const updatedCoins = coins.map(c =>
                selected.includes(c.docid) ? { ...c, [updateField]: updateValue } : c
            );
            setCoins(updatedCoins);
            setFiltered(prev =>
                prev.map(c => selected.includes(c.docid) ? { ...c, [updateField]: updateValue } : c)
            );
            setStatus(`✓ Updated ${selected.length} coin(s) successfully.`);
            setSelected([]);
            setUpdateValue('');
        } catch (error) {
            console.error('Batch update error:', error);
            setStatus('Error during update. Check the console.');
        }

        setLoading(false);
    };

    const filterFieldOptions = [
	    { value: 'name', label: 'Name' },
	    { value: 'year', label: 'Year' },
	    { value: 'grade', label: 'Grade' },
	    { value: 'mint', label: 'Mint' },
	    { value: 'favorite', label: 'Favorite' },
	    { value: 'value', label: 'Value' },
	    { value: 'estimate', label: 'Estimate' },
	    { value: 'notes', label: 'Notes' },
	];

    const updateFieldOptions = [
        { value: 'grade', label: 'Grade' },
        { value: 'mint', label: 'Mint' },
        { value: 'favorite', label: 'Favorite' },
        { value: 'estimate', label: 'Estimate' },
    ];

    const valueOptions = {
        grade: ['Proof','Uncirculated','Extra Fine','Very Fine','Fine','Very Good','Good','Bad'],
        mint: [
            { value: 'P', label: 'Philadelphia' },
            { value: 'CC', label: 'Carson City' },
            { value: 'C', label: 'Charlotte' },
            { value: 'D', label: 'Denver' },
            { value: 'O', label: 'New Orleans' },
            { value: 'S', label: 'San Francisco' },
            { value: 'W', label: 'West Point' },
            { value: 'N', label: 'No Mint Mark' },
        ],
        favorite: [
            { value: 'true', label: 'True' },
            { value: 'false', label: 'False' },
        ],
    };

    const renderValueOptions = () => {
        const opts = valueOptions[updateField];
        return opts.map(opt =>
            typeof opt === 'string'
                ? <option key={opt} value={opt}>{opt}</option>
                : <option key={opt.value} value={opt.value}>{opt.label}</option>
        );
    };

    return (
        <main className={styles.home} aria-labelledby="mainHeading" tabIndex="-1">
            <h1 id="mainHeading">Bulk Edit Coins</h1>

            <div className={styles.flex}>

                {/* Left column — all controls */}
                <section aria-label="Search and Filtering" className={styles.facets}>

                    <h2>Step 1: Query</h2>
                    <form className={stylesForm.form} onSubmit={e => e.preventDefault()}>

                        <div>
                            <label>Filter field</label>
                            <select value={filterField} onChange={e => { setFilterField(e.target.value); setFilterValue(''); }}>
                                {filterFieldOptions.map(f => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="value">Matches value</label>
                            <input
                                id="value"
                                type="text"
                                value={filterValue}
                                onChange={e => setFilterValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleQuery()}
                                placeholder="e.g. Lincoln Cent"
                            />
                        </div>
                        <div>
                            <button onClick={handleQuery} disabled={!filterValue.trim()}>
                                Run Query
                            </button>
                        </div>
                    </form>

                    {filtered.length > 0 && (
                        <>
                            <h2>Step 2: Select</h2>
                            <p>{selected.length} of {filtered.length} selected</p>
                            <button onClick={selectAll}>Select All</button>{' '}
                            <button onClick={selectNone}>Select None</button>
                        </>
                    )}

                    {selected.length > 0 && (
                        <>
                            <h2>Step 3: Update</h2>
                            <form className={stylesForm.form} onSubmit={e => e.preventDefault()}>
                                <div>
                                    <label>Field to update</label>
                                    <select
                                        value={updateField}
                                        onChange={e => { setUpdateField(e.target.value); setUpdateValue(''); }}
                                    >
                                        {updateFieldOptions.map(f => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label>New value</label>
                                    {updateField === 'estimate'
                                        ? <input
                                            type="text"
                                            value={updateValue}
                                            onChange={e => setUpdateValue(e.target.value)}
                                            placeholder="e.g. 100"
                                          />
                                        : <select value={updateValue} onChange={e => setUpdateValue(e.target.value)}>
                                            <option value="">-- Select a value --</option>
                                            {renderValueOptions()}
                                          </select>
                                    }
                                </div>

                                <div>
                                    <button onClick={handleBulkUpdate} disabled={!updateValue || loading}>
                                        {loading ? 'Updating...' : `Apply to ${selected.length} coin(s)`}
                                    </button>
                                </div>
                            </form>
                            {status && <p>{status}</p>}
                        </>
                    )}

                    {status && !selected.length && <p>{status}</p>}

                </section>

                {/* Right column — results table */}
                {hasQueried && (
                    <section aria-label="Coin Results Table" className={styles.data}>
                        <h2>
                            Query Results
                            {filtered.length > 0 && ` (${filtered.length})`}
                        </h2>

                        {filtered.length === 0 && (
                            <p>No coins matched. Try a different filter.</p>
                        )}

                        {filtered.length > 0 && (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>ID</th>
                                        <th>Year</th>
                                        <th>Name</th>
                                        <th>Grade</th>
                                        <th>Mint</th>
                                        <th>Estimate</th>
                                        <th>Favorite</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(coin => (
                                        <tr key={coin.docid}>
                                            <td className={styles.checkboxItem}>
                                                <input
                                                    type="checkbox"
                                                    checked={selected.includes(coin.docid)}
                                                    onChange={() => toggleSelect(coin.docid)}
                                                />
                                            </td>
                                            <td>{coin.id}</td>
                                            <td>{coin.year}</td>
                                            <td>{coin.name}</td>
                                            <td>{coin.grade}</td>
                                            <td>{coin.mint}</td>
                                            <td>{coin.estimate}</td>
                                            <td>{coin.favorite}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                )}

            </div>
        </main>
    );
};

export default BulkEdit;