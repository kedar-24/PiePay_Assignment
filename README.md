# PiePay Backend Assignment

## Overview
This is a backend service developed for the PiePay assignment. It simulates the ingestion of offers from Flipkart and calculates the maximum applicable discount for a user transaction.

## Setup Instructions
1.  **Prerequisites**: Ensure Node.js (v18+) is installed.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Database Migration**:
    Initialize the SQLite database using Prisma.
    ```bash
    npx prisma migrate dev --name init
    ```
4.  **Start Server**:
    Run the development server.
    ```bash
    npm run dev
    ```
    The server listens on `http://localhost:3000`.

## Assumptions
-   **Limited Regex Handling**: The offer description parsing logic uses Regular Expressions to extract discount values (Percentage/Flat) and constraints (Min Purchase, Max Discount). It assumes Flipkart's offer text follows simpler patterns like "10% off", "Flat ₹100 off", etc. Complex or non-standard descriptions might not be parsed correctly.
-   **Single Bank/Instrument per Offer**: The current ingestion logic mainly targeted extracting the *first* detected bank or payment instrument if multiple are mentioned, though the data model supports many-to-many.
-   **Case Insensitivity**: Bank names and payment instruments are treated with simple string matching (often case-sensitive in DB, though logic tries to be robust).

## Design Choices
-   **Framework (Express.js)**: Chosen for its minimalist approach and high speed of development for REST APIs.
-   **Database (SQLite)**: Selected for the ease of setup (file-based) for this specific take-home assignment, avoiding the need for the evaluator to install comprehensive DB servers like Postgres/MySQL.
-   **ORM (Prisma)**: Used for type-safe database interactions and easy schema management.
-   **Separation of Concerns**: Code is structured into `routes` (API definition), `controllers` (request/response handling), and `services` (business logic), ensuring maintainability.

## Scaling to 1,000 RPS (GET /highest-discount)
To handle high concurrency:
1.  **In-Memory Caching (Redis)**: The set of offers for a specific `bankName` and `paymentInstrument` changes infrequently. We can cache the list of candidate offers in Redis. The calculation (Math.max) is CPU-cheap and can be done on the fly, or the result for specific `amountToPay` ranges could also be cached.
2.  **Database Indexing**: Ensure there are indexes on `Bank.name` and `PaymentMethod.name` to speed up the initial filtering of offers.
3.  **Horizontal Scaling**: Run multiple instances of the Node.js server behind a load balancer (e.g., NGINX or AWS ALB).
4.  **Connection Pooling**: Verify Prisma connection pool settings to handle concurrent DB queries without bottlenecking.

## Future Improvements
-   **Better NLP/LLM Parsing**: Instead of Regex, integrating a small LLM or NLP library would significantly improve the accuracy of extracting offer terms from unstructured text descriptions.
-   **Validation Middleware**: Add strict request validation using libraries like `zod` or `joi` to handle edge case inputs gracefully.
-   **Unit Tests**: Add a comprehensive test suite (Jest/Mocha) with mocked database calls to ensure logic stability during refactors.
-   **Swagger Documentation**: Auto-generate API documentation for better developer experience.
