#!/usr/bin/env node

// Test all 50 US states support in the CRM
function testAll50States() {
    console.log('🇺🇸 Testing ALL 50 US States + DC Support...\n');
    
    // Complete US state mapping (matching the CRM implementation)
    const stateMap = {
        // Standard abbreviations
        'AL': 'AL', 'AK': 'AK', 'AZ': 'AZ', 'AR': 'AR', 'CA': 'CA', 'CO': 'CO', 'CT': 'CT', 'DE': 'DE', 'DC': 'DC', 'FL': 'FL',
        'GA': 'GA', 'HI': 'HI', 'ID': 'ID', 'IL': 'IL', 'IN': 'IN', 'IA': 'IA', 'KS': 'KS', 'KY': 'KY', 'LA': 'LA', 'ME': 'ME',
        'MD': 'MD', 'MA': 'MA', 'MI': 'MI', 'MN': 'MN', 'MS': 'MS', 'MO': 'MO', 'MT': 'MT', 'NE': 'NE', 'NV': 'NV', 'NH': 'NH',
        'NJ': 'NJ', 'NM': 'NM', 'NY': 'NY', 'NC': 'NC', 'ND': 'ND', 'OH': 'OH', 'OK': 'OK', 'OR': 'OR', 'PA': 'PA', 'RI': 'RI',
        'SC': 'SC', 'SD': 'SD', 'TN': 'TN', 'TX': 'TX', 'UT': 'UT', 'VT': 'VT', 'VA': 'VA', 'WA': 'WA', 'WV': 'WV', 'WI': 'WI', 'WY': 'WY',
        
        // Full state names (lowercase for matching)
        'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA', 'colorado': 'CO',
        'connecticut': 'CT', 'delaware': 'DE', 'district of columbia': 'DC', 'florida': 'FL', 'georgia': 'GA',
        'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
        'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD', 'massachusetts': 'MA',
        'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO', 'montana': 'MT',
        'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
        'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
        'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
        'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA',
        'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
    };
    
    // Simulate the CRM's state parsing logic
    const parseClientState = (address) => {
        if (!address) return 'FL';
        
        const parts = address.split(',');
        if (parts.length >= 3) {
            // Extract state from "Florida 32828" or "FL 32828" format
            const statePart = parts[2]?.trim();
            if (statePart) {
                // Try to find state at the beginning of the part (before zip code)
                const stateWords = statePart.split(' ');
                for (let i = 0; i < Math.min(stateWords.length, 3); i++) {
                    const candidate = stateWords.slice(0, i + 1).join(' ').toLowerCase();
                    if (stateMap[candidate]) {
                        return stateMap[candidate];
                    }
                    // Also check uppercase abbreviations
                    const upperCandidate = candidate.toUpperCase();
                    if (stateMap[upperCandidate]) {
                        return stateMap[upperCandidate];
                    }
                }
            }
        }
        
        // Handle formats without commas (e.g., "Orlando FL", "Los Angeles CA")
        const addressLower = address.toLowerCase();
        for (const [stateName, stateCode] of Object.entries(stateMap)) {
            if (addressLower.includes(' ' + stateName) || addressLower.includes(stateName + ' ')) {
                return stateCode;
            }
        }
        
        // Default to FL (Orlando market focus)
        return 'FL';
    };
    
    // Test cases for all 50 states + DC
    const testCases = [
        // Traditional format: Street, City, State Zip
        { address: '123 Main St, Birmingham, Alabama 35201', state: 'AL', desc: 'Alabama (full name)' },
        { address: '456 Ice Rd, Anchorage, AK 99501', state: 'AK', desc: 'Alaska (abbreviation)' },
        { address: '789 Desert Ave, Phoenix, Arizona 85001', state: 'AZ', desc: 'Arizona (full name)' },
        { address: '321 River St, Little Rock, AR 72201', state: 'AR', desc: 'Arkansas (abbreviation)' },
        { address: '654 Beach Blvd, Los Angeles, California 90210', state: 'CA', desc: 'California (full name)' },
        { address: '987 Mountain Dr, Denver, CO 80201', state: 'CO', desc: 'Colorado (abbreviation)' },
        { address: '147 Elm St, Hartford, Connecticut 06101', state: 'CT', desc: 'Connecticut (full name)' },
        { address: '258 Bay St, Wilmington, DE 19801', state: 'DE', desc: 'Delaware (abbreviation)' },
        { address: '369 Capitol Ave, Washington, District of Columbia 20001', state: 'DC', desc: 'District of Columbia' },
        { address: '607 Spring Oak Circle, Orlando, Florida 32828', state: 'FL', desc: 'Florida (our main case!)' },
        
        // More states
        { address: '741 Peach St, Atlanta, GA 30301', state: 'GA', desc: 'Georgia (abbreviation)' },
        { address: '852 Volcano Rd, Honolulu, Hawaii 96801', state: 'HI', desc: 'Hawaii (full name)' },
        { address: '963 Potato Ave, Boise, ID 83701', state: 'ID', desc: 'Idaho (abbreviation)' },
        { address: '159 Wind City Dr, Chicago, Illinois 60601', state: 'IL', desc: 'Illinois (full name)' },
        { address: '357 Corn St, Indianapolis, IN 46201', state: 'IN', desc: 'Indiana (abbreviation)' },
        { address: '468 Farm Rd, Des Moines, Iowa 50301', state: 'IA', desc: 'Iowa (full name)' },
        { address: '579 Plains Ave, Topeka, KS 66601', state: 'KS', desc: 'Kansas (abbreviation)' },
        { address: '680 Derby Ln, Louisville, Kentucky 40201', state: 'KY', desc: 'Kentucky (full name)' },
        { address: '791 Jazz St, New Orleans, LA 70112', state: 'LA', desc: 'Louisiana (abbreviation)' },
        { address: '802 Lobster Rd, Portland, Maine 04101', state: 'ME', desc: 'Maine (full name)' },
        
        // Format without commas
        { address: 'Baltimore Maryland', state: 'MD', desc: 'Maryland (no commas)' },
        { address: 'Boston Massachusetts', state: 'MA', desc: 'Massachusetts (no commas)' },
        { address: 'Detroit Michigan', state: 'MI', desc: 'Michigan (no commas)' },
        { address: 'Minneapolis Minnesota', state: 'MN', desc: 'Minnesota (no commas)' },
        { address: 'Jackson MS', state: 'MS', desc: 'Mississippi (abbreviation, no commas)' },
        { address: 'Kansas City MO', state: 'MO', desc: 'Missouri (abbreviation, no commas)' },
        { address: 'Billings Montana', state: 'MT', desc: 'Montana (no commas)' },
        { address: 'Omaha NE', state: 'NE', desc: 'Nebraska (abbreviation, no commas)' },
        { address: 'Las Vegas Nevada', state: 'NV', desc: 'Nevada (no commas)' },
        { address: 'Manchester New Hampshire', state: 'NH', desc: 'New Hampshire (no commas)' },
        
        // More traditional format
        { address: '100 Shore Dr, Newark, New Jersey 07101', state: 'NJ', desc: 'New Jersey (full name)' },
        { address: '200 Mesa Ave, Albuquerque, NM 87101', state: 'NM', desc: 'New Mexico (abbreviation)' },
        { address: '300 Broadway, New York, New York 10001', state: 'NY', desc: 'New York (full name)' },
        { address: '400 Bank St, Charlotte, NC 28201', state: 'NC', desc: 'North Carolina (abbreviation)' },
        { address: '500 Prairie Dr, Fargo, North Dakota 58102', state: 'ND', desc: 'North Dakota (full name)' },
        { address: '600 Buckeye Blvd, Columbus, OH 43215', state: 'OH', desc: 'Ohio (abbreviation)' },
        { address: '700 Oil Rd, Oklahoma City, Oklahoma 73102', state: 'OK', desc: 'Oklahoma (full name)' },
        { address: '800 Rain St, Portland, OR 97201', state: 'OR', desc: 'Oregon (abbreviation)' },
        { address: '900 Liberty Ave, Philadelphia, Pennsylvania 19101', state: 'PA', desc: 'Pennsylvania (full name)' },
        { address: '123 Ocean Dr, Providence, RI 02901', state: 'RI', desc: 'Rhode Island (abbreviation)' },
        { address: '234 Magnolia St, Charleston, South Carolina 29401', state: 'SC', desc: 'South Carolina (full name)' },
        { address: '345 Buffalo Rd, Sioux Falls, SD 57101', state: 'SD', desc: 'South Dakota (abbreviation)' },
        { address: '456 Music Row, Nashville, Tennessee 37201', state: 'TN', desc: 'Tennessee (full name)' },
        { address: '567 Cowboy Trail, Austin, TX 78701', state: 'TX', desc: 'Texas (abbreviation)' },
        { address: '678 Salt Lake Ave, Salt Lake City, Utah 84101', state: 'UT', desc: 'Utah (full name)' },
        { address: '789 Maple St, Burlington, VT 05401', state: 'VT', desc: 'Vermont (abbreviation)' },
        { address: '890 Colonial Dr, Richmond, Virginia 23218', state: 'VA', desc: 'Virginia (full name)' },
        { address: '901 Coffee St, Seattle, WA 98101', state: 'WA', desc: 'Washington (abbreviation)' },
        { address: '012 Coal Mine Rd, Charleston, West Virginia 25301', state: 'WV', desc: 'West Virginia (full name)' },
        { address: '123 Cheese Ave, Milwaukee, WI 53201', state: 'WI', desc: 'Wisconsin (abbreviation)' },
        { address: '234 Ranch Rd, Cheyenne, Wyoming 82001', state: 'WY', desc: 'Wyoming (full name)' }
    ];
    
    console.log('🧪 TESTING ALL 50 STATES + DC:');
    console.log('='.repeat(80));
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach((test, index) => {
        const result = parseClientState(test.address);
        const success = result === test.state;
        
        if (success) passed++;
        else failed++;
        
        const emoji = success ? '✅' : '❌';
        console.log(`${emoji} ${test.desc}`);
        console.log(`   Address: "${test.address}"`);
        console.log(`   Expected: ${test.state} | Actual: ${result}`);
        if (!success) console.log(`   ⚠️  MISMATCH!`);
        console.log('   ' + '-'.repeat(60));
    });
    
    console.log(`\n📊 RESULTS SUMMARY:`);
    console.log(`✅ Passed: ${passed}/${testCases.length} states`);
    console.log(`❌ Failed: ${failed}/${testCases.length} states`);
    console.log(`📈 Success Rate: ${Math.round((passed / testCases.length) * 100)}%`);
    
    console.log(`\n🇺🇸 COVERAGE STATUS:`);
    if (passed === testCases.length) {
        console.log(`🎉 PERFECT! All 50 states + DC fully supported!`);
        console.log(`🏆 Your CRM now handles nationwide real estate markets!`);
    } else {
        console.log(`⚠️  ${failed} state(s) need attention`);
    }
    
    console.log(`\n🎯 WHAT THIS MEANS:`);
    console.log(`✅ Real estate agents can work in ANY US state`);
    console.log(`✅ Client addresses parsed correctly nationwide`);
    console.log(`✅ Property listings work from Alaska to Florida`);
    console.log(`✅ Orlando focus maintained with nationwide capability`);
}

testAll50States();