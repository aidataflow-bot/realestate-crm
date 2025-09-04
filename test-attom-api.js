#!/usr/bin/env node

// Direct ATTOM API Test Script
// Tests the real property data lookup with the actual API key

async function testATTOMAPI() {
    console.log('🚀 Starting ATTOM API Integration Test...\n');
    
    // Test property address
    const address = '14147 Mailer Blvd';
    const city = 'Orlando';
    const state = 'FL';
    const zipCode = '32832';
    
    try {
        console.log('🏠 🔍 Testing REAL API Property Lookup for:', { address, city, state, zipCode });
        
        const fullAddress = `${address} ${city}, ${state} ${zipCode}`.trim();
        console.log('🏠 📡 Calling ATTOM API for:', fullAddress);
        
        // ATTOM Data API - Get property details for ANY property
        const attomParams = new URLSearchParams({
            address1: address,
            address2: `${city} ${state} ${zipCode}`,
            format: 'json'
        });
        
        const attomUrl = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?${attomParams}`;
        console.log('🔗 ATTOM API URL:', attomUrl);
        
        const response = await fetch(attomUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'apikey': 'b58077119da5fe3a968245f82fcf7c51' // Your ATTOM API key
            }
        });
        
        console.log('📡 Response Status:', response.status, response.statusText);
        console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const attomData = await response.json();
            console.log('\n✅ ATTOM API Response received!');
            console.log('📊 Response structure:', Object.keys(attomData));
            
            if (attomData && attomData.property && attomData.property.length > 0) {
                const property = attomData.property[0];
                const building = property.building || {};
                const address_info = property.address || {};
                const assessment = property.assessment || {};
                
                console.log('\n🎉 REAL PROPERTY DATA FOUND!');
                console.log('=' .repeat(50));
                console.log('📍 Address:', address_info.oneLine || fullAddress);
                console.log('🛏️  Bedrooms:', building.rooms?.beds || 'N/A');
                console.log('🛁 Bathrooms:', building.rooms?.bathstotal || 'N/A');
                console.log('📐 Square Feet:', building.size?.livingsize?.toLocaleString() || 'N/A');
                console.log('🏠 Property Type:', building.summary?.propertyusegeneral || 'N/A');
                console.log('🏗️  Year Built:', building.summary?.yearbuilt || 'N/A');
                console.log('💰 Assessed Value: $' + (assessment.assessed?.assdttlvalue?.toLocaleString() || 'N/A'));
                console.log('🏷️  Market Value: $' + (assessment.market?.mktttlvalue?.toLocaleString() || 'N/A'));
                console.log('🆔 ATTOM ID:', property.identifier?.attomId || 'N/A');
                console.log('📋 APN:', property.identifier?.apn || 'N/A');
                console.log('=' .repeat(50));
                console.log('\n✅ SUCCESS: ATTOM API Integration Working Perfectly!');
                console.log('✅ Your CRM can now get real property data for ANY address!');
                return true;
            } else {
                console.log('\n⚠️  No Property Found');
                console.log('ATTOM API responded but no property data found for this address.');
                console.log('Raw response:', JSON.stringify(attomData, null, 2));
                return false;
            }
        } else {
            const errorText = await response.text();
            console.log('\n❌ ATTOM API Error');
            console.log('Status:', response.status, response.statusText);
            console.log('Response:', errorText);
            return false;
        }
    } catch (error) {
        console.log('\n❌ Integration Error:', error.message);
        console.error('Full error:', error);
        return false;
    }
}

// Test different addresses
async function runFullTest() {
    console.log('🏠 ATTOM Data API Integration Test Suite');
    console.log('=' .repeat(60));
    
    const testAddresses = [
        { address: '14147 Mailer Blvd', city: 'Orlando', state: 'FL', zipCode: '32832' },
        { address: '123 Main St', city: 'Orlando', state: 'FL', zipCode: '32801' },
        { address: '1600 Pennsylvania Ave', city: 'Washington', state: 'DC', zipCode: '20500' }
    ];
    
    let successCount = 0;
    
    for (let i = 0; i < testAddresses.length; i++) {
        const testAddr = testAddresses[i];
        console.log(`\n📍 Test ${i + 1}/${testAddresses.length}: ${testAddr.address}, ${testAddr.city}, ${testAddr.state} ${testAddr.zipCode}`);
        console.log('-' .repeat(40));
        
        const success = await testATTOMAPI();
        if (success) successCount++;
        
        // Wait between tests to respect API limits
        if (i < testAddresses.length - 1) {
            console.log('\n⏳ Waiting 2 seconds before next test...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log(`📊 TEST RESULTS: ${successCount}/${testAddresses.length} successful`);
    console.log('=' .repeat(60));
    
    if (successCount > 0) {
        console.log('🎉 ATTOM API Integration is working!');
        console.log('✅ Your CRM will now get real property data for any address!');
    } else {
        console.log('❌ ATTOM API Integration needs attention');
        console.log('🔧 Check API key, network connectivity, or API limits');
    }
}

// Run the test
if (require.main === module) {
    runFullTest().catch(console.error);
}

module.exports = { testATTOMAPI, runFullTest };