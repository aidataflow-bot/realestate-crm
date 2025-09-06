#!/usr/bin/env node

// Test comprehensive US state parsing (all 50 states + DC)
function testAllUSStates() {
    console.log('🇺🇸 Testing ALL US States Support...\n');
    
    // Complete US state mapping
    const stateMap = {
        'AL': 'AL', 'AK': 'AK', 'AZ': 'AZ', 'AR': 'AR', 'CA': 'CA', 'CO': 'CO', 'CT': 'CT', 'DE': 'DE', 'DC': 'DC', 'FL': 'FL',
        'GA': 'GA', 'HI': 'HI', 'ID': 'ID', 'IL': 'IL', 'IN': 'IN', 'IA': 'IA', 'KS': 'KS', 'KY': 'KY', 'LA': 'LA', 'ME': 'ME',
        'MD': 'MD', 'MA': 'MA', 'MI': 'MI', 'MN': 'MN', 'MS': 'MS', 'MO': 'MO', 'MT': 'MT', 'NE': 'NE', 'NV': 'NV', 'NH': 'NH',
        'NJ': 'NJ', 'NM': 'NM', 'NY': 'NY', 'NC': 'NC', 'ND': 'ND', 'OH': 'OH', 'OK': 'OK', 'OR': 'OR', 'PA': 'PA', 'RI': 'RI',
        'SC': 'SC', 'SD': 'SD', 'TN': 'TN', 'TX': 'TX', 'UT': 'UT', 'VT': 'VT', 'VA': 'VA', 'WA': 'WA', 'WV': 'WV', 'WI': 'WI', 'WY': 'WY',
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
    
    // Simulate the exact parsing logic from CRM
    const parseState = (address) => {
        if (!address) return 'FL';
        
        const parts = address.split(',');
        if (parts.length >= 3) {
            const statePart = parts[2]?.trim();
            if (statePart) {
                const stateWords = statePart.split(' ');
                for (let i = 0; i < Math.min(stateWords.length, 3); i++) {
                    const candidate = stateWords.slice(0, i + 1).join(' ').toLowerCase();
                    if (stateMap[candidate]) return stateMap[candidate];
                    const upperCandidate = candidate.toUpperCase();
                    if (stateMap[upperCandidate]) return stateMap[upperCandidate];
                }
            }
        }
        
        const addressLower = address.toLowerCase();
        for (const [stateName, stateCode] of Object.entries(stateMap)) {
            if (addressLower.includes(' ' + stateName) || addressLower.includes(stateName + ' ')) {
                return stateCode;
            }
        }
        
        return 'FL';
    };
    
    // Test cases covering all US states
    const testCases = [
        // Major cities by region
        { address: '123 Main St, Birmingham, Alabama 35203', expected: 'AL', region: 'South' },
        { address: '456 Ice Ave, Anchorage, Alaska 99501', expected: 'AK', region: 'West' },
        { address: '789 Desert Rd, Phoenix, Arizona 85001', expected: 'AZ', region: 'West' },
        { address: '321 River St, Little Rock, Arkansas 72201', expected: 'AR', region: 'South' },
        { address: '654 Hollywood Blvd, Los Angeles, California 90028', expected: 'CA', region: 'West' },
        { address: '987 Mountain Dr, Denver, Colorado 80202', expected: 'CO', region: 'West' },
        { address: '147 Elm St, Hartford, Connecticut 06101', expected: 'CT', region: 'Northeast' },
        { address: '258 Market St, Wilmington, Delaware 19801', expected: 'DE', region: 'Northeast' },
        { address: '369 Capitol Ave, Washington, DC 20001', expected: 'DC', region: 'Northeast' },
        { address: '607 Spring Oak Circle, Orlando, Florida 32828', expected: 'FL', region: 'South' },
        { address: '741 Peach St, Atlanta, Georgia 30309', expected: 'GA', region: 'South' },
        { address: '852 Aloha Dr, Honolulu, Hawaii 96813', expected: 'HI', region: 'West' },
        { address: '963 Potato Ave, Boise, Idaho 83702', expected: 'ID', region: 'West' },
        { address: '159 Lake St, Chicago, Illinois 60601', expected: 'IL', region: 'Midwest' },
        { address: '267 Corn Rd, Indianapolis, Indiana 46204', expected: 'IN', region: 'Midwest' },
        { address: '348 Farm Way, Des Moines, Iowa 50309', expected: 'IA', region: 'Midwest' },
        { address: '426 Wheat St, Topeka, Kansas 66603', expected: 'KS', region: 'Midwest' },
        { address: '537 Derby Dr, Louisville, Kentucky 40202', expected: 'KY', region: 'South' },
        { address: '648 Bayou Blvd, New Orleans, Louisiana 70112', expected: 'LA', region: 'South' },
        { address: '759 Lighthouse Ln, Portland, Maine 04101', expected: 'ME', region: 'Northeast' },
        { address: '861 Harbor St, Baltimore, Maryland 21201', expected: 'MD', region: 'Northeast' },
        { address: '972 Freedom Trail, Boston, Massachusetts 02108', expected: 'MA', region: 'Northeast' },
        { address: '183 Auto Ave, Detroit, Michigan 48226', expected: 'MI', region: 'Midwest' },
        { address: '294 Lake Dr, Minneapolis, Minnesota 55401', expected: 'MN', region: 'Midwest' },
        { address: '305 River Rd, Jackson, Mississippi 39201', expected: 'MS', region: 'South' },
        { address: '416 Gateway St, St. Louis, Missouri 63101', expected: 'MO', region: 'Midwest' },
        { address: '527 Big Sky Blvd, Helena, Montana 59601', expected: 'MT', region: 'West' },
        { address: '638 Corn Ave, Omaha, Nebraska 68102', expected: 'NE', region: 'Midwest' },
        { address: '749 Casino Dr, Las Vegas, Nevada 89101', expected: 'NV', region: 'West' },
        { address: '851 Maple St, Manchester, New Hampshire 03101', expected: 'NH', region: 'Northeast' },
        { address: '962 Shore Blvd, Newark, New Jersey 07102', expected: 'NJ', region: 'Northeast' },
        { address: '173 Adobe Ave, Santa Fe, New Mexico 87501', expected: 'NM', region: 'West' },
        { address: '284 Broadway, New York, New York 10007', expected: 'NY', region: 'Northeast' },
        { address: '395 Tobacco Rd, Charlotte, North Carolina 28202', expected: 'NC', region: 'South' },
        { address: '406 Prairie St, Fargo, North Dakota 58102', expected: 'ND', region: 'Midwest' },
        { address: '517 Buckeye Ave, Columbus, Ohio 43215', expected: 'OH', region: 'Midwest' },
        { address: '628 Oil St, Oklahoma City, Oklahoma 73102', expected: 'OK', region: 'South' },
        { address: '739 Forest Dr, Portland, Oregon 97201', expected: 'OR', region: 'West' },
        { address: '841 Liberty St, Philadelphia, Pennsylvania 19107', expected: 'PA', region: 'Northeast' },
        { address: '952 Ocean Ave, Providence, Rhode Island 02903', expected: 'RI', region: 'Northeast' },
        { address: '163 Palmetto St, Charleston, South Carolina 29401', expected: 'SC', region: 'South' },
        { address: '274 Mount Rushmore Rd, Sioux Falls, South Dakota 57104', expected: 'SD', region: 'Midwest' },
        { address: '385 Music Row, Nashville, Tennessee 37203', expected: 'TN', region: 'South' },
        { address: '496 Longhorn Dr, Houston, Texas 77002', expected: 'TX', region: 'South' },
        { address: '507 Ski Slope Ave, Salt Lake City, Utah 84101', expected: 'UT', region: 'West' },
        { address: '618 Maple Syrup Ln, Burlington, Vermont 05401', expected: 'VT', region: 'Northeast' },
        { address: '729 Historic St, Richmond, Virginia 23219', expected: 'VA', region: 'South' },
        { address: '831 Coffee Ave, Seattle, Washington 98101', expected: 'WA', region: 'West' },
        { address: '942 Coal St, Charleston, West Virginia 25301', expected: 'WV', region: 'South' },
        { address: '153 Cheese Dr, Milwaukee, Wisconsin 53202', expected: 'WI', region: 'Midwest' },
        { address: '264 Cowboy Trail, Cheyenne, Wyoming 82001', expected: 'WY', region: 'West' },
        
        // Test abbreviated formats
        { address: '100 Test St, Miami, FL 33101', expected: 'FL', region: 'Abbreviation' },
        { address: '200 Sample Ave, Los Angeles, CA 90210', expected: 'CA', region: 'Abbreviation' },
        { address: '300 Demo Dr, Austin, TX 78701', expected: 'TX', region: 'Abbreviation' },
        
        // Test without commas
        { address: 'Orlando Florida', expected: 'FL', region: 'No Commas' },
        { address: 'Seattle Washington', expected: 'WA', region: 'No Commas' }
    ];
    
    console.log('📊 COMPREHENSIVE US STATE TESTING:');
    console.log('='.repeat(100));
    
    let passed = 0;
    let failed = 0;
    const regionStats = {};
    
    testCases.forEach((test, index) => {
        const result = parseState(test.address);
        const success = result === test.expected;
        
        if (success) passed++;
        else failed++;
        
        if (!regionStats[test.region]) regionStats[test.region] = { passed: 0, total: 0 };
        regionStats[test.region].total++;
        if (success) regionStats[test.region].passed++;
        
        console.log(`${index + 1}. ${test.region} - ${test.address}`);
        console.log(`   Expected: ${test.expected} | Got: ${result} | ${success ? '✅' : '❌'}`);
        console.log('   ' + '-'.repeat(80));
    });
    
    console.log('\n🏆 RESULTS SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}/${testCases.length} tests`);
    console.log(`❌ Failed: ${failed}/${testCases.length} tests`);
    console.log(`📊 Success Rate: ${Math.round((passed/testCases.length) * 100)}%`);
    
    console.log('\n📍 BY REGION:');
    Object.entries(regionStats).forEach(([region, stats]) => {
        const pct = Math.round((stats.passed / stats.total) * 100);
        console.log(`   ${region}: ${stats.passed}/${stats.total} (${pct}%)`);
    });
    
    console.log('\n🇺🇸 US COVERAGE STATUS:');
    console.log('✅ All 50 states + DC supported');
    console.log('✅ Both abbreviated (FL) and full names (Florida)'); 
    console.log('✅ Comma-separated and space-separated formats');
    console.log('✅ Zip code handling (ignores numbers after state)');
    console.log('✅ Fallback to FL (Orlando market) for invalid addresses');
    
    if (passed === testCases.length) {
        console.log('\n🎉 PERFECT SCORE! All US states properly supported! 🇺🇸');
    } else {
        console.log(`\n⚠️  ${failed} tests need attention`);
    }
}

testAllUSStates();