#!/usr/bin/env node

// Test the fixed valuation calculation
function testAreaBasedValuation() {
    console.log('🧪 Testing Area-Based Valuation Calculations...\n');
    
    // Area-based valuation function (same as in the CRM)
    const getAreaBasedValue = (city, state, sqft = 1800) => {
        const areaValueMap = {
            // Florida - Orlando Metro
            'orlando,fl': { avgPrice: 399000, sqftPrice: 210 },
            'winter park,fl': { avgPrice: 520000, sqftPrice: 280 },
            'maitland,fl': { avgPrice: 450000, sqftPrice: 240 },
            'kissimmee,fl': { avgPrice: 320000, sqftPrice: 170 },
            'apopka,fl': { avgPrice: 340000, sqftPrice: 180 },
            
            // Florida - Other major cities
            'miami,fl': { avgPrice: 550000, sqftPrice: 300 },
            'tampa,fl': { avgPrice: 420000, sqftPrice: 220 },
            'jacksonville,fl': { avgPrice: 350000, sqftPrice: 180 },
            'fort lauderdale,fl': { avgPrice: 480000, sqftPrice: 260 },
            
            // Default by state
            'fl': { avgPrice: 380000, sqftPrice: 190 },
            'ca': { avgPrice: 750000, sqftPrice: 400 },
            'tx': { avgPrice: 320000, sqftPrice: 160 },
            'ny': { avgPrice: 480000, sqftPrice: 250 },
            'default': { avgPrice: 350000, sqftPrice: 175 }
        };
        
        const locationKey = `${city.toLowerCase()},${state.toLowerCase()}`;
        const stateKey = state.toLowerCase();
        
        const areaData = areaValueMap[locationKey] || 
                        areaValueMap[stateKey] || 
                        areaValueMap['default'];
        
        const calculatedValue = sqft ? Math.round(sqft * areaData.sqftPrice) : areaData.avgPrice;
        
        return {
            value: calculatedValue,
            source: `${city}, ${state} Area Estimate`,
            method: sqft ? `$${areaData.sqftPrice}/sqft × ${sqft} sqft` : 'Average area price',
            sqftPrice: areaData.sqftPrice
        };
    };
    
    // Test cases based on your screenshots
    const testCases = [
        { address: '14147 Mailer Blvd', city: 'Orlando', state: 'FL', sqft: 1878, expected: 394380 },
        { address: '607 Spring Oak Circle', city: 'Orlando', state: 'FL', sqft: 2761, expected: 579810 },
        { address: '123 Test St', city: 'Miami', state: 'FL', sqft: 2000, expected: 600000 },
        { address: '456 Example Ave', city: 'Winter Park', state: 'FL', sqft: 2500, expected: 700000 }
    ];
    
    console.log('📊 TEST RESULTS:');
    console.log('='.repeat(80));
    
    testCases.forEach((test, index) => {
        const result = getAreaBasedValue(test.city, test.state, test.sqft);
        const isCorrect = result.value === test.expected;
        
        console.log(`Test ${index + 1}: ${test.address}, ${test.city}, ${test.state}`);
        console.log(`   Square Feet: ${test.sqft.toLocaleString()}`);
        console.log(`   Rate: $${result.sqftPrice}/sqft`);
        console.log(`   Calculation: ${result.method}`);
        console.log(`   Expected: $${test.expected.toLocaleString()}`);
        console.log(`   Actual: $${result.value.toLocaleString()}`);
        console.log(`   Result: ${isCorrect ? '✅ CORRECT' : '❌ WRONG'}`);
        console.log('   ' + '-'.repeat(50));
    });
    
    console.log('\n🎯 SPECIFIC ISSUE FROM SCREENSHOT:');
    console.log('Property: 607 Spring Oak Circle Orlando, Florida 32828');
    const problemCase = getAreaBasedValue('Orlando', 'FL', 2761);
    console.log(`Square Feet: 2,761`);
    console.log(`Orlando Rate: $${problemCase.sqftPrice}/sqft`);
    console.log(`Calculation: 2,761 × $${problemCase.sqftPrice} = $${problemCase.value.toLocaleString()}`);
    console.log(`Expected in UI: $${problemCase.value.toLocaleString()} (NOT $350,000)`);
    
    if (problemCase.value === 579810) {
        console.log('✅ CALCULATION IS CORRECT - The fix should resolve the $350,000 issue!');
    } else {
        console.log('❌ CALCULATION IS WRONG - Need to debug further');
    }
}

testAreaBasedValuation();