// Debug script to test ATTOM API for NC address
const fetch = require('node-fetch');

async function debugNCAddress() {
  const address = "4977 OLD TOWNE VILLAGE CIR";
  const city = "PFAFFTOWN";
  const state = "NC";
  const zipCode = "27040";
  
  console.log('🔍 Testing ATTOM API for NC address:');
  console.log(`Address: ${address} ${city}, ${state} ${zipCode}`);
  
  try {
    // Test the exact ATTOM API call
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
        'apikey': 'b58077119da5fe3a968245f82fcf7c51'
      }
    });
    
    console.log('📡 ATTOM Response Status:', response.status);
    console.log('📡 ATTOM Response Headers:', response.headers.raw());
    
    if (response.ok) {
      const attomData = await response.json();
      console.log('✅ ATTOM API Response Data:', JSON.stringify(attomData, null, 2));
      
      if (attomData && attomData.property && attomData.property.length > 0) {
        const property = attomData.property[0];
        const building = property.building || {};
        console.log('🏠 Building Data:', JSON.stringify(building, null, 2));
        
        const bedrooms = building.rooms?.beds || building.bedrooms || 'N/A';
        const bathrooms = building.rooms?.baths || building.bathrooms || 'N/A';
        const sqft = building.size?.livingsize || building.livingSize || 'N/A';
        const yearBuilt = building.summary?.yearbuilt || building.yearBuilt || 'N/A';
        
        console.log(`🏠 Property Details: ${bedrooms}br/${bathrooms}ba, ${sqft} sqft, built ${yearBuilt}`);
      } else {
        console.log('⚠️ No property data in ATTOM response');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ ATTOM API Error Response:', errorText);
    }
  } catch (error) {
    console.error('❌ ATTOM API Error:', error);
  }
}

// Also test with alternative address formats
async function testAlternativeFormats() {
  console.log('\n🔄 Testing alternative address formats...\n');
  
  const alternatives = [
    { address1: "4977 OLD TOWNE VILLAGE CIR", address2: "PFAFFTOWN NC 27040" },
    { address1: "4977 Old Towne Village Cir", address2: "Pfafftown NC 27040" },
    { address1: "4977 Old Towne Village Circle", address2: "Pfafftown NC 27040" },
  ];
  
  for (const alt of alternatives) {
    console.log(`Testing: ${alt.address1} ${alt.address2}`);
    
    const params = new URLSearchParams({
      address1: alt.address1,
      address2: alt.address2,
      format: 'json'
    });
    
    const url = `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?${params}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'apikey': 'b58077119da5fe3a968245f82fcf7c51'
        }
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.property && data.property.length > 0) {
          console.log('✅ Found property data!');
          const property = data.property[0];
          const building = property.building || {};
          const bedrooms = building.rooms?.beds || building.bedrooms || 'N/A';
          const bathrooms = building.rooms?.baths || building.bathrooms || 'N/A';
          const sqft = building.size?.livingsize || building.livingSize || 'N/A';
          const yearBuilt = building.summary?.yearbuilt || building.yearBuilt || 'N/A';
          console.log(`Details: ${bedrooms}br/${bathrooms}ba, ${sqft} sqft, built ${yearBuilt}`);
          break;
        }
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
    
    console.log('---');
  }
}

debugNCAddress().then(() => {
  return testAlternativeFormats();
}).then(() => {
  console.log('🏁 Debug complete');
});