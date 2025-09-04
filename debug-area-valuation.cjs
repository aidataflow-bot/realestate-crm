#!/usr/bin/env node

// Debug the area valuation function to see why it's not using Orlando rate
function debugAreaValuation() {
    console.log('🔍 Debugging Area Valuation Function...\n');
    
    // Exact copy of the getAreaBasedValue function from index.html
    const getAreaBasedValue = (city, state, sqft = 1800) => {
        const areaValueMap = {
            // Florida - Orlando Metro (FL abbreviation)
            'orlando,fl': { avgPrice: 399000, sqftPrice: 210 },
            'winter park,fl': { avgPrice: 520000, sqftPrice: 280 },
            'maitland,fl': { avgPrice: 450000, sqftPrice: 240 },
            'kissimmee,fl': { avgPrice: 320000, sqftPrice: 170 },
            'apopka,fl': { avgPrice: 340000, sqftPrice: 180 },
            
            // Florida - Orlando Metro (Full state name)
            'orlando,florida': { avgPrice: 399000, sqftPrice: 210 },
            'winter park,florida': { avgPrice: 520000, sqftPrice: 280 },
            'maitland,florida': { avgPrice: 450000, sqftPrice: 240 },
            'kissimmee,florida': { avgPrice: 320000, sqftPrice: 170 },
            'apopka,florida': { avgPrice: 340000, sqftPrice: 180 },
            
            // Florida - Other major cities
            'miami,fl': { avgPrice: 550000, sqftPrice: 300 },
            'tampa,fl': { avgPrice: 420000, sqftPrice: 220 },
            'jacksonville,fl': { avgPrice: 350000, sqftPrice: 180 },
            'fort lauderdale,fl': { avgPrice: 480000, sqftPrice: 260 },
            'miami,florida': { avgPrice: 550000, sqftPrice: 300 },
            'tampa,florida': { avgPrice: 420000, sqftPrice: 220 },
            'jacksonville,florida': { avgPrice: 350000, sqftPrice: 180 },
            'fort lauderdale,florida': { avgPrice: 480000, sqftPrice: 260 },
            
            // Default by state
            'fl': { avgPrice: 380000, sqftPrice: 190 },
            'florida': { avgPrice: 380000, sqftPrice: 190 },
            'ca': { avgPrice: 750000, sqftPrice: 400 },
            'california': { avgPrice: 750000, sqftPrice: 400 },
            'tx': { avgPrice: 320000, sqftPrice: 160 },
            'texas': { avgPrice: 320000, sqftPrice: 160 },
            'ny': { avgPrice: 480000, sqftPrice: 250 },
            'new york': { avgPrice: 480000, sqftPrice: 250 },
            'default': { avgPrice: 350000, sqftPrice: 175 }
        };
        
        const locationKey = `${city.toLowerCase()},${state.toLowerCase()}`;
        const stateKey = state.toLowerCase();
        
        console.log(`Input: city="${city}", state="${state}", sqft=${sqft}`);
        console.log(`Generated locationKey: "${locationKey}"`);
        console.log(`Generated stateKey: "${stateKey}"`);
        console.log(`Available keys in areaValueMap:`, Object.keys(areaValueMap));
        
        const locationMatch = areaValueMap[locationKey];
        const stateMatch = areaValueMap[stateKey];
        const defaultMatch = areaValueMap['default'];
        
        console.log(`locationMatch (${locationKey}):`, locationMatch);
        console.log(`stateMatch (${stateKey}):`, stateMatch);
        console.log(`defaultMatch:`, defaultMatch);
        
        const areaData = locationMatch || stateMatch || defaultMatch;
        console.log(`Final areaData used:`, areaData);
        
        // Calculate value based on square footage if available
        const calculatedValue = sqft ? Math.round(sqft * areaData.sqftPrice) : areaData.avgPrice;
        console.log(`Calculation: ${sqft} × $${areaData.sqftPrice} = $${calculatedValue.toLocaleString()}`);
        
        return {
            value: calculatedValue,
            source: `${city}, ${state} Area Estimate`,
            method: sqft ? `$${areaData.sqftPrice}/sqft × ${sqft} sqft` : 'Average area price',
            sqftPrice: areaData.sqftPrice
        };
    };
    
    // Test cases that should match Orlando
    const testCases = [
        { city: 'Orlando', state: 'FL', sqft: 2761 },
        { city: 'orlando', state: 'fl', sqft: 2761 },
        { city: 'Orlando', state: 'Florida', sqft: 2761 },
        { city: 'ORLANDO', state: 'FL', sqft: 2761 }
    ];
    
    testCases.forEach((test, index) => {
        console.log(`\n=== Test Case ${index + 1} ===`);
        const result = getAreaBasedValue(test.city, test.state, test.sqft);
        console.log(`Result: $${result.value.toLocaleString()}`);
        console.log(`Expected: $579,810 (2761 × $210)`);
        console.log(`Match: ${result.value === 579810 ? '✅ CORRECT' : '❌ WRONG'}`);
    });
}

debugAreaValuation();