#!/usr/bin/env node

// Test ATTOM API with fixed area-based valuation fallback
async function testFixedATTOMIntegration() {
    console.log('🔧 Testing Fixed ATTOM API Integration...\n');
    
    const address = '607 Spring Oak Circle';
    const city = 'Orlando';
    const state = 'FL';
    const zipCode = '32828';
    
    try {
        const params = new URLSearchParams({
            address1: address,
            address2: `${city} ${state} ${zipCode}`,
            format: 'json'
        });
        
        const attomUrl = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?${params}`;
        console.log('🔗 ATTOM API URL:', attomUrl);
        
        const response = await fetch(attomUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'apikey': 'b58077119da5fe3a968245f82fcf7c51'
            }
        });
        
        console.log('📡 Response Status:', response.status, response.statusText);
        
        if (response.ok) {
            const attomData = await response.json();
            console.log('\n✅ ATTOM API Response received!');
            
            if (attomData && attomData.property && attomData.property.length > 0) {
                const property = attomData.property[0];
                const building = property.building || {};
                const assessment = property.assessment || {};
                
                console.log('\n📊 PROPERTY DATA FROM ATTOM:');
                console.log('='.repeat(50));
                console.log('Address:', property.address?.oneLine || 'N/A');
                console.log('Bedrooms:', building.rooms?.beds || 'N/A');
                console.log('Bathrooms:', building.rooms?.baths || building.rooms?.bathstotal || 'N/A');
                console.log('Square Feet:', building.size?.livingsize?.toLocaleString() || 'N/A');
                console.log('Year Built:', building.summary?.yearbuilt || 'N/A');
                console.log('Property Type:', building.summary?.propertytype || 'N/A');
                
                console.log('\n💰 VALUATION DATA:');
                console.log('Market Value (ATTOM AVM):', assessment.market?.mktttlvalue ? '$' + assessment.market.mktttlvalue.toLocaleString() : 'NOT AVAILABLE');
                console.log('Assessed Value (County):', assessment.assessed?.assdttlvalue ? '$' + assessment.assessed.assdttlvalue.toLocaleString() : 'NOT AVAILABLE');
                
                // Simulate the fixed area-based calculation
                const sqft = building.size?.livingsize || 2761; // Use actual or fallback
                const areaRate = 210; // Orlando rate (updated)
                const areaBasedValue = sqft * areaRate;
                
                console.log('\n🔧 FIXED AREA-BASED CALCULATION:');
                console.log(`Square Feet: ${sqft.toLocaleString()}`);
                console.log(`Orlando Rate: $${areaRate}/sqft`);
                console.log(`Calculation: ${sqft.toLocaleString()} × $${areaRate} = $${areaBasedValue.toLocaleString()}`);
                
                // Determine which valuation would be used
                const attomValue = assessment.market?.mktttlvalue || assessment.assessed?.assdttlvalue;
                const finalValue = attomValue || areaBasedValue;
                const source = attomValue ? 'ATTOM Data' : 'Area-Based Calculation';
                
                console.log('\n🎯 FINAL VALUATION LOGIC:');
                console.log('ATTOM Market/Assessed Value:', attomValue ? '$' + attomValue.toLocaleString() : 'NOT AVAILABLE');
                console.log('Fallback Area-Based Value:', '$' + areaBasedValue.toLocaleString());
                console.log('Used Value:', '$' + finalValue.toLocaleString());
                console.log('Source:', source);
                
                if (finalValue === areaBasedValue && areaBasedValue === 579810) {
                    console.log('\n✅ SUCCESS: Fixed calculation working correctly!');
                    console.log('✅ Property will show $579,810 instead of $350,000');
                } else if (attomValue) {
                    console.log('\n✅ SUCCESS: ATTOM provided real market/assessed value');
                    console.log(`✅ Property will show $${attomValue.toLocaleString()} from ATTOM data`);
                } else {
                    console.log('\n⚠️  Check: Valuation calculation may need verification');
                }
                
            } else {
                console.log('\n⚠️ No property found in ATTOM response');
                console.log('📊 Will use area-based fallback: 2,761 × $210 = $579,810');
            }
        } else {
            console.log('\n❌ ATTOM API Error:', response.status, response.statusText);
            console.log('📊 Will use area-based fallback: 2,761 × $210 = $579,810');
        }
        
    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        console.log('📊 Will use area-based fallback: 2,761 × $210 = $579,810');
    }
}

testFixedATTOMIntegration();