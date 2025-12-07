import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/offer';

const ingestFile = async (filePath: string) => {
    try {
        console.log(`Reading file: ${filePath}`);
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(rawData);

        console.log(`Sending payload to ${API_URL}...`);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log(`SUCCESS: ${filePath}`);
        console.log('Response:', result);
    } catch (error) {
        console.error(`FAILED: ${filePath}`);
        console.error(error);
    }
};

const main = async () => {
    const sampleDir = path.join(__dirname, '../sampleData');

    // Ingest flipkart.json
    await ingestFile(path.join(sampleDir, 'flipkart.json'));

    // Ingest flipkart_2.json
    await ingestFile(path.join(sampleDir, 'flipkart_2.json'));
};

main();
