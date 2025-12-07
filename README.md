# PiePay Backend Assignment

## Overview
This is a backend service developed for the PiePay assignment. It simulates the ingestion of offers from Flipkart and calculates the maximum applicable discount for a user transaction.

## Setup Instructions

### 1. Prerequisites
-   Node.js (v18 or higher)
-   npm (Node Package Manager)

### 2. Environment Configuration
Create a `.env` file in the root directory. This project uses SQLite, so the setup is minimal.

**File:** `.env`
```env
DATABASE_URL="file:./dev.db"
```

### 3. Installation
Install the project dependencies.
```bash
npm install
```

### 4. Database Setup
Initialize the database and apply migrations.
```bash
npx prisma migrate dev --name init
```

### 5. Running the Server
Start the development server.
```bash
npm run dev
```
The server will be available at `http://localhost:3000`.

---

## Database Access

The project uses **SQLite**. The easiest way to view and edit the database contents is using **Prisma Studio**, a built-in GUI key.

Run the following command:
```bash
npx prisma studio
```
This will open a web interface at `http://localhost:5555` where you can inspect the `Offer`, `Bank`, and `Terms` tables.

---

## API Usage Guide

### 1. Ingest Offers (POST)
Populates the database with offers from a Flipkart-like JSON structure.
-   **URL**: `http://localhost:3000/offer`
-   **Method**: `POST`
-   **Body**: JSON (See `flipkart.json` for structure)

### 2. Get Highest Discount (GET)
Calculates the best discount for a transaction.
-   **URL**: `http://localhost:3000/highest-discount`
-   **Method**: `GET`
-   **Query Parameters**:
    -   `amountToPay`: (number) Total transaction amount.
    -   `bankName`: (string) e.g., "HDFC", "AXIS".
    -   `paymentInstrument`: (string) e.g., "CREDIT_CARD", "EMI".

**Example Request (cURL):**
```bash
curl "http://localhost:3000/highest-discount?amountToPay=5000&bankName=HDFC&paymentInstrument=CREDIT_CARD"
```

---

## Validation & Testing

We have provided scripts to validate the data ingestion and verify the discount calculations.

### 1. Ingest Sample Data
This script ingests all files from the `sampleData` directory (`flipkart.json`, `flipkart_2.json`) into the running server.
```bash
npx ts-node src/validate_sample_data.ts
```

### 2. Verify Calculations
This script runs a set of test cases against the `/highest-discount` endpoint to verify that the best offers are being selected correctly.
```bash
npx ts-node src/verify_calculations.ts
```

---

## Assumptions
-   **Regex Parsing**: The logic relies on regex patterns to parse offer descriptions ("10% off", "Flat ₹100").
-   **Case Insensitivity**: The API implements robust case-insensitive matching for Bank names and normalized matching for Payment Instruments.
-   **Partial Matches**: The system supports partial matching (e.g., "AXIS" maps to "FLIPKARTAXISBANK").

## Design Choices
-   **Express.js**: Lightweight framework for rapid API development.
-   **Prisma & SQLite**: Zero-config, file-based database setup ideal for portability and assignment evaluation.
-   **Separation of Concerns**: Modular architecture with separate Routes, Controllers, and Services.

## Scaling Strategy (1,000 RPS)
1.  **Caching**: Use Redis to cache the list of applicable offers for (Bank, Instrument) pairs, as offer data changes infrequently relative to read traffic.
2.  **Read Replicas**: If migrating to PostgreSQL, use read replicas to offload query traffic.
3.  **Horizontal Scaling**: Deploy multiple stateless Node.js containers behind a load balancer.

## Future Improvements
-   **NLP Parsing**: Replace Regex with NLP models for more accurate offer extraction.
-   **Validation**: Add schema validation (Zod/Joi) for API inputs.
-   **Testing**: Expand the test suite to include unit tests with mocked DB providers.
