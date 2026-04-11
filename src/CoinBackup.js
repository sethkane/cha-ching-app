import React, { useState } from 'react';
import firebaseUtil from './FirebaseUtil';

const CoinBackup = () => {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    document.title = 'Backup | Cha-Ching Coin Database';

    const handleBackup = async () => {
        setLoading(true);
        setStatus('Fetching coins...');

        try {
            const snapshot = await firebaseUtil.getDb()
                .collection('coins')
                .get();

            const data = snapshot.docs.map(doc => ({
                docid: doc.id,
                ...doc.data()
            }));

            // Build the JSON file and trigger a browser download
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const date = new Date().toISOString().split('T')[0];

            const link = document.createElement('a');
            link.href = url;
            link.download = `coins-backup-${date}.json`;
            link.click();

            URL.revokeObjectURL(url);
            setStatus(`✓ Backed up ${data.length} coins successfully.`);
        } catch (error) {
            console.error('Backup error:', error);
            setStatus('Error during backup. Check the console.');
        }

        setLoading(false);
    };

    return (
        <main>
            <h1>Backup Coin Database</h1>
            <p>Downloads a complete JSON backup of all coins to your computer. Images are stored in Firebase Storage and are not included, but all coin data and image path references are backed up.</p>
            <button onClick={handleBackup} disabled={loading}>
                {loading ? 'Backing up...' : 'Download Backup'}
            </button>
            {status && <p>{status}</p>}
        </main>
    );
};

export default CoinBackup;