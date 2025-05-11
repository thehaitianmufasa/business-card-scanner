# Business Card Scanner

A web application that scans business cards, extracts information using OCR, and sends the data to Google Sheets.

## Features
- Upload business card images
- Extracts text using OCR (Tesseract.js)
- Sends extracted data to Google Sheets

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/thehaitianmufasa/business-card-scanner.git
   cd business-card-scanner
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   GOOGLE_SHEETS_ID=your_sheets_id
   GOOGLE_CLIENT_EMAIL=your_client_email
   GOOGLE_PRIVATE_KEY=your_private_key
   ```

## Development

Run the development server:
```bash
npm run dev
```

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add the following environment variables in Render:
   - `PORT`
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

## Environment Variables

- `PORT`: The port number for the server (default: 3000)
- `GOOGLE_SHEETS_ID`: Your Google Sheets document ID
- `GOOGLE_CLIENT_EMAIL`: Your Google service account email
- `GOOGLE_PRIVATE_KEY`: Your Google service account private key 