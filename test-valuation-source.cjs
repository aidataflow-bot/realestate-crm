#!/usr/bin/env node

// Test which valuation source ATTOM API is providing
async function testValuationSources() {
    console.log('🏠 Testing ATTOM API Valuation Sources...\n');
    
    const address = '14147 Mailer Blvd';
    const city = 'Orlando';
    const state = 'FL';
    const zipCode = '32832';
    
    try {
        const params = new URLSearchParams({
            address1: address,
            address2: `${city} ${state} ${zipCode}`,
            format: 'json'
        });
        
        const attomUrl = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?${params}`;
        
        const response = await fetch(attomUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'apikey': 'b58077119da5fe3a968245f82fcf7c51'
            }
        });
        
        if (response.ok) {
            const attomData = await response.json();
            
            if (attomData && attomData.property && attomData.property.length > 0) {
                const property = attomData.property[0];
                const assessment = property.assessment || {};
                
                console.log('📊 VALUATION SOURCE ANALYSIS');
                console.log('='.repeat(60));
                console.log('🏠 Property:', `${address}, ${city}, ${state} ${zipCode}`);
                console.log('-'.repeat(60));
                
                // Check Market Value (AVM)
                const marketValue = assessment.market?.mktttlvalue;
                console.log('🤖 MARKET VALUE (AVM):');
                console.log('   Source: ATTOM Automated Valuation Model');
                console.log('   Field: assessment.market.mktttlvalue');
                console.log('   Value:', marketValue ? `$${marketValue.toLocaleString()}` : 'NOT AVAILABLE');
                console.log('   Status:', marketValue ? '✅ AVAILABLE (PRIMARY SOURCE)' : '❌ Not Available');
                
                console.log();
                
                // Check Assessed Value (Tax Assessment)
                const assessedValue = assessment.assessed?.assdttlvalue;
                console.log('🏛️  TAX ASSESSED VALUE:');
                console.log('   Source: County Tax Assessor Records');
                console.log('   Field: assessment.assessed.assdttlvalue');
                console.log('   Value:', assessedValue ? `$${assessedValue.toLocaleString()}` : 'NOT AVAILABLE');
                console.log('   Status:', assessedValue ? '✅ AVAILABLE (SECONDARY SOURCE)' : '❌ Not Available');
                
                console.log();
                
                // Show which one is being used
                const usedValue = marketValue || assessedValue || 350000;
                const usedSource = marketValue ? 'Market Value (AVM)' : 
                                 assessedValue ? 'Tax Assessed Value' : 
                                 'Default Fallback';
                
                console.log('🎯 CURRENT IMPLEMENTATION:');
                console.log('   Used Value: $' + usedValue.toLocaleString());
                console.log('   Used Source:', usedSource);
                console.log('   Primary Source:', marketValue ? '✅ Available' : '❌ Using Fallback');
                
                console.log();
                
                // Show all assessment data available
                console.log('📋 ALL ASSESSMENT DATA AVAILABLE:');
                console.log('   Raw assessment object:', JSON.stringify(assessment, null, 2));
                
                console.log();
                console.log('=' .repeat(60));
                
                if (marketValue) {
                    console.log('✅ YOU ARE GETTING: ATTOM Market Value (AVM Estimate)');
                    console.log('📊 This is similar to Zillow\'s Zestimate - algorithmic market estimate');
                } else if (assessedValue) {
                    console.log('✅ YOU ARE GETTING: County Tax Assessed Value');
                    console.log('🏛️  This is the official government assessment for tax purposes');
                } else {
                    console.log('⚠️  YOU ARE GETTING: Default fallback value ($350,000)');
                }
                
            } else {
                console.log('❌ No property found in ATTOM response');
            }
        } else {
            console.log('❌ ATTOM API Error:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ Error testing valuation sources:', error);
    }
}

testValuationSources();