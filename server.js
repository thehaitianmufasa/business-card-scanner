const express = require('express');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const upload = multer();

// Initialize Google Cloud Vision client using environment variables
const visionClient = new vision.ImageAnnotatorClient({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }
});

// Initialize Google Sheets using environment variables
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;

// Serve static files from the public directory
app.use(express.static('public'));

// Handle image upload and processing
app.post('/scan', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No image file provided');
        }

        console.log('Processing image...');

        // Perform OCR using Google Cloud Vision
        const [result] = await visionClient.textDetection({
            image: { content: req.file.buffer.toString('base64') }
        });

        if (!result.textAnnotations || result.textAnnotations.length === 0) {
            throw new Error('No text detected in the image');
        }

        const text = result.textAnnotations[0].description;
        console.log('Extracted text:', text);
        
        // Extract information using regex
        const email = text.match(/[\w\.-]+@[\w\.-]+/)?.[0] || 'Not found';
        const phone = text.match(/(\(?\d{3}\)?[\s\.-]?\d{3}[\s\.-]?\d{4})/)?.[0] || 'Not found';
        const website = text.match(/(www\.[\w\.-]+\.\w+)/)?.[0] || 'Not found';
        
        // Name is usually the first line that's not an email, phone, or website
        const lines = text.split('\n');
        const name = lines.find(line => 
            line.trim() && 
            !line.includes('@') && 
            !line.match(/\d{3}/) && 
            !line.includes('www')
        ) || 'Not found';

        console.log('Extracted data:', { name, phone, email, website });

        // Save to Google Sheets (all columns: Name, Phone, Email, Website, Raw text)
        try {
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Sheet1!A:E', // A: Name, B: Phone, C: Email, D: Website, E: Raw text
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [[name, phone, email, website, text]]
                }
            });
            console.log('Data saved to Google Sheets');
        } catch (sheetsError) {
            console.error('Error saving to Google Sheets:', sheetsError);
            // Continue even if Google Sheets fails
        }

        res.json({ name, phone, email, website });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
}); 