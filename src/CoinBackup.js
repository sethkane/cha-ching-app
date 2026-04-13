import React, { useState } from 'react';
import firebaseUtil from './FirebaseUtil';
import jsPDF from 'jspdf';
import styles from './CoinEdit.module.css';
import stylesForm from './Form.module.css';

const CoinBackup = () => {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [exportType, setExportType] = useState('json');

    document.title = 'Backup | Cha-Ching Coin Database';

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

    const handleJSONBackup = async () => {
        setLoading(true);
        setStatus('Loading coins from local cache...');

        try {
            const localCoins = localStorage.getItem('coins');
            let data;

            if (localCoins) {
                data = JSON.parse(localCoins).sort((a, b) =>
                    parseFloat(a.id) - parseFloat(b.id)
                );
                setStatus(`Found ${data.length} coins in cache.`);
            } else {
                setStatus('No local cache found, fetching from Firebase...');
                const snapshot = await firebaseUtil.getDb()
                    .collection('coins')
                    .orderBy('id')
                    .get();
                data = snapshot.docs.map(doc => ({
                    docid: doc.id,
                    ...doc.data()
                }));
            }

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

    const handlePDFBackup = async () => {
        setLoading(true);
        setStatus('Loading coins from local cache...');

        try {
            const localCoins = localStorage.getItem('coins');
            let coins;

            if (localCoins) {
                coins = JSON.parse(localCoins).sort((a, b) =>
                    parseFloat(a.id) - parseFloat(b.id)
                );
                setStatus(`Found ${coins.length} coins in cache. Building PDF...`);
            } else {
                setStatus('No local cache found, fetching from Firebase...');
                const snapshot = await firebaseUtil.getDb()
                    .collection('coins')
                    .orderBy('id')
                    .get();
                coins = snapshot.docs.map(doc => ({
                    docid: doc.id,
                    ...doc.data()
                }));
                setStatus(`Fetched ${coins.length} coins. Building PDF...`);
            }

            const chunkSize = 50;
            const totalChunks = Math.ceil(coins.length / chunkSize);
            const date = new Date().toISOString().split('T')[0];

            for (let chunk = 0; chunk < totalChunks; chunk++) {
                const start = chunk * chunkSize;
                const end = Math.min(start + chunkSize, coins.length);
                const chunkCoins = coins.slice(start, end);

                setStatus(`Building PDF ${chunk + 1} of ${totalChunks} (coins ${start + 1}–${end})...`);

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

                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('Cha-Ching Coin Database — Full Catalog', margin, 8);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `Part ${chunk + 1} of ${totalChunks} | Coins ${start + 1}–${end} | Exported: ${new Date().toLocaleDateString()}`,
                    pageWidth - margin, 8, { align: 'right' }
                );

                drawHeader();

                let y = 20;

                for (let i = 0; i < chunkCoins.length; i++) {
                    const coin = chunkCoins[i];

                    setStatus(`PDF ${chunk + 1} of ${totalChunks} — processing coin ${start + i + 1} of ${coins.length}...`);

                    if (y + rowHeight > pageHeight - margin) {
                        doc.addPage();
                        doc.setFontSize(16);
                        doc.setFont('helvetica', 'bold');
                        doc.text('Cha-Ching Coin Database — Full Catalog', margin, 8);
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'normal');
                        doc.text(
                            `Part ${chunk + 1} of ${totalChunks} | Coins ${start + 1}–${end} | Exported: ${new Date().toLocaleDateString()}`,
                            pageWidth - margin, 8, { align: 'right' }
                        );
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

                    const frontBase64 = await fetchImageAsBase64(coin.photoArrPaths[0]);
                    const backBase64 = await fetchImageAsBase64(coin.photoArrPaths[1]);

                    if (frontBase64) {
                        doc.addImage(frontBase64, 'PNG', x, y + 2, imgWidth, imgHeight);
                    }
                    x += colWidths.front;
                    if (backBase64) {
                        doc.addImage(backBase64, 'PNG', x, y + 2, imgWidth, imgHeight);
                    }

                    // Give browser a moment to breathe between images
                    await new Promise(resolve => setTimeout(resolve, 50));

                    doc.setDrawColor(180, 180, 180);
                    doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'S');

                    y += rowHeight;
                }

                // Save this chunk and free memory before starting the next
                doc.save(`coins-catalog-${date}-part${chunk + 1}of${totalChunks}.pdf`);

                // Small delay to let the browser breathe between chunks
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            setStatus(`✓ Done! ${totalChunks} PDF files saved successfully.`);

        } catch (error) {
            console.error('PDF export error:', error);
            setStatus('Error during PDF export. Check the console.');
        }

        setLoading(false);
    };

    const handleBackup = () => {
        if (exportType === 'json') {
            handleJSONBackup();
        } else {
            handlePDFBackup();
        }
    };

    return (
        <main className={styles.coinEdit} aria-labelledby="mainHeading" tabIndex="-1">
            <h1 id="mainHeading">Backup Coin Database</h1>

            <form className={stylesForm.form} onSubmit={e => e.preventDefault()}>
                <label>Export Format</label>
                <select
                    value={exportType}
                    onChange={e => setExportType(e.target.value)}
                    disabled={loading}
                >
                    <option value="json">JSON (Fast — data only)</option>
                    <option value="pdf">PDF Catalog (Slow — includes all images)</option>
                </select>

                {exportType === 'json' && (
                    <p>Downloads a complete JSON backup of all coins. Images are stored in Firebase Storage and are not included, but all coin data and image path references are backed up.</p>
                )}

                {exportType === 'pdf' && (
                    <p>Generates a full PDF catalog of all ~900 coins including front and back images. This will make nearly 1,800 image requests and may take several minutes to complete. Do not close the tab while it runs.</p>
                )}

                <button onClick={handleBackup} disabled={loading}>
                    {loading
                        ? 'Working...'
                        : exportType === 'json'
                            ? 'Download JSON Backup'
                            : 'Download PDF Catalog'
                    }
                </button>
            </form>

            {status && <p>{status}</p>}
        </main>
    );
};

export default CoinBackup;