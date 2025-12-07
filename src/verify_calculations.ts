// Native fetch is available in Node 18+

const BASE_URL = 'http://localhost:3000/highest-discount';

const testCases = [
    {
        name: 'HDFC Credit Card - Extra ₹2500 Off (from flipkart_2.json)',
        params: {
            amountToPay: '10000',
            bankName: 'HDFC',
            paymentInstrument: 'CREDIT_CARD'
        },
        expectedMin: 2500
    },
    {
        name: 'SBI Credit Card - 10% upto 750 (from flipkart.json)',
        params: {
            amountToPay: '5000',
            bankName: 'SBI',
            paymentInstrument: 'CREDIT_CARD'
        },
        expectedMin: 500 // 10% of 5000
    },
    {
        name: 'SBI Credit Card - High Value (Best of Multiple)',
        params: {
            amountToPay: '30000',
            bankName: 'SBI',
            paymentInstrument: 'CREDIT_CARD'
        },
        // Offer 1: Extra 500 off (Min 24990)
        // Offer 2: 10% upto 750 (Min 4990)
        // Max should be 750
        expectedMin: 750
    }
];

async function runTests() {
    console.log('Running Verification Tests...\n');
    let passed = 0;

    for (const test of testCases) {
        const query = new URLSearchParams(test.params).toString();
        const url = `${BASE_URL}?${query}`;

        try {
            const res = await fetch(url);
            const data = await res.json();

            console.log(`Test: ${test.name}`);
            console.log(`Params: ${JSON.stringify(test.params)}`);
            console.log(`Result: ${JSON.stringify(data)}`);

            if (data.highestDiscountAmount >= test.expectedMin) {
                console.log('✅ PASS');
                passed++;
            } else {
                console.log(`❌ FAIL (Expected >= ${test.expectedMin})`);
            }
            console.log('-------------------');
        } catch (e: any) {
            console.log(`❌ ERROR: ${e.message}`);
        }
    }

    console.log(`\nSummary: ${passed}/${testCases.length} Passed`);
}

runTests();
