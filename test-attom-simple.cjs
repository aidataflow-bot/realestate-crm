#!/usr/bin/env node

// Simple ATTOM API Test Script using fetch
const https = require('https');
const { URL, URLSearchParams } = require('url');

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
                const address_info = property.address || {};
                const assessment = property.assessment || {};
                
                console.log('\n🎉 REAL PROPERTY DATA FOUND!');
                console.log('='.repeat(50));
                console.log('📍 Address:', address_info.oneLine || fullAddress);
                console.log('🛏️  Bedrooms:', building.rooms?.beds || 'N/A');
                console.log('🛁 Bathrooms:', building.rooms?.bathstotal || 'N/A');
                console.log('📐 Square Feet:', building.size?.livingsize?.toLocaleString() || 'N/A');
                console.log('🏠 Property Type:', building.summary?.propertyusegeneral || 'N/A');
                console.log('🏗️  Year Built:', building.summary?.yearbuilt || 'N/A');
                console.log('💰 Assessed Value: $' + (assessment.assessed?.assdttlvalue?.toLocaleString() || 'N/A'));
                console.log('🏷️  Market Value: $' + (assessment.market?.mktttlvalue?.toLocaleString() || 'N/A'));
                console.log('🆔 ATTOM ID:', property.identifier?.attomId || 'N/A');
                console.log('='.repeat(50));
                console.log('\n✅ SUCCESS: ATTOM API Integration Working Perfectly!');
                console.log('✅ Your CRM can now get real property data for ANY address!');
                return true;
            } else {
                console.log('\n⚠️  ATTOM API Response (no properties found):');
                console.log(JSON.stringify(attomData, null, 2));
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

// Just run one test
testATTOMAPI().then(success => {
    if (success) {
        console.log('\n🎯 INTEGRATION STATUS: ✅ WORKING');
    } else {
        console.log('\n🎯 INTEGRATION STATUS: ❌ NEEDS ATTENTION');
    }
}).catch(error => {
    console.error('\n💥 Test failed:', error);
});