// 🆓 FREE RapidAPI Real Estate Integration
// Drop-in replacement for Bridge API with 10,000 free requests/month

const FREE_REALTOR_API = {
  baseURL: 'https://realtor.p.rapidapi.com',
  apiKey: 'YOUR_RAPIDAPI_KEY_HERE', // Get from https://rapidapi.com/apidojo/api/realtor/
  
  searchProperties: async (query) => {
    try {
      console.log('🏠 Free Realtor API Search:', query);
      
      // Build search parameters
      const searchParams = new URLSearchParams({
        limit: 20,
        offset: 0
      });
      
      // Add location filters
      if (query.city && query.state) {
        searchParams.append('city', query.city);
        searchParams.append('state_code', query.state);
      }
      
      if (query.zipCode) {
        searchParams.append('postal_code', query.zipCode);
      }
      
      // Search for properties for sale
      const response = await fetch(`${this.baseURL}/properties/v2/list-for-sale?${searchParams}`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'realtor.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Realtor API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.properties && data.properties.length > 0) {
        let results = data.properties.map((property, index) => {
          const address = property.address || {};
          const fullAddress = `${address.line || ''} ${address.city || ''}, ${address.state_code || ''} ${address.postal_code || ''}`.trim();
          
          console.log(`🏠 Property ${index + 1}:`, {
            propertyId: property.property_id,
            address: fullAddress,
            price: property.price,
            beds: property.beds,
            baths: property.baths,
            sqft: property.building_size?.size
          });
          
          return {
            id: property.property_id,
            mlsId: property.mls?.abbreviation + property.mls?.number,
            address: fullAddress,
            streetAddress: address.line || '',
            city: address.city || '',
            state: address.state_code || '',
            zipCode: address.postal_code || '',
            price: property.price,
            status: property.status,
            bedrooms: property.beds,
            bathrooms: property.baths,
            sqft: property.building_size?.size,
            yearBuilt: property.year_built,
            propertyType: property.prop_type,
            coordinates: { 
              lat: address.lat, 
              lng: address.lon 
            },
            agent: { 
              name: property.branding?.[0]?.name,
              office: property.office?.name,
              phone: property.office?.phones?.[0]?.number
            },
            photos: property.photos ? property.photos.map(p => p.href) : [],
            remarks: property.description,
            matchScore: 0
          };
        });
        
        // Enhanced client-side filtering (same as your Bridge API logic)
        if (query.address || query.city || query.state || query.zipCode) {
          results = results.filter(prop => {
            let matchScore = 0;
            let matches = true;
            
            // Exact street address matching
            if (query.address && query.address.trim()) {
              const searchAddress = query.address.toLowerCase().trim();
              const propStreetAddress = (prop.streetAddress || '').toLowerCase().trim();
              const propFullAddress = prop.address.toLowerCase();
              
              if (propStreetAddress.includes(searchAddress) || propFullAddress.includes(searchAddress)) {
                matchScore += 10;
                if (propStreetAddress === searchAddress) {
                  matchScore += 20;
                }
              } else {
                matches = false;
              }
            }
            
            // City matching
            if (query.city && query.city.trim()) {
              const searchCity = query.city.toLowerCase().trim();
              const propCity = (prop.city || '').toLowerCase();
              
              if (propCity === searchCity) {
                matchScore += 5;
              } else if (propCity.includes(searchCity)) {
                matchScore += 2;
              } else {
                matches = false;
              }
            }
            
            // State matching
            if (query.state && query.state.trim()) {
              const searchState = query.state.toLowerCase().trim();
              const propState = (prop.state || '').toLowerCase();
              
              if (propState === searchState) {
                matchScore += 5;
              } else {
                matches = false;
              }
            }
            
            // Zip code matching
            if (query.zipCode && query.zipCode.trim()) {
              const searchZip = query.zipCode.trim();
              const propZip = (prop.zipCode || '').trim();
              
              if (propZip === searchZip) {
                matchScore += 8;
              } else if (propZip.startsWith(searchZip.substring(0, 3))) {
                matchScore += 3;
              } else {
                matches = false;
              }
            }
            
            prop.matchScore = matchScore;
            return matches;
          });
          
          // Sort by match score then by price
          results.sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
              return b.matchScore - a.matchScore;
            }
            return (a.price || 0) - (b.price || 0);
          });
          
          console.log(`🎯 Free API filtering: ${results.length} properties match criteria`);
          console.log('Top matches:', results.slice(0, 3).map(p => ({
            address: p.address,
            matchScore: p.matchScore,
            price: p.price
          })));
        }
        
        return results;
      }
      
      return [];
    } catch (error) {
      console.error('🏠 Free Realtor API Error:', error);
      return [];
    }
  },
  
  // Get property details by address
  getPropertyDetails: async (address) => {
    try {
      const response = await fetch(`${this.baseURL}/properties/v2/detail?address=${encodeURIComponent(address)}`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'realtor.p.rapidapi.com'
        }
      });
      
      return response.json();
    } catch (error) {
      console.error('Property details error:', error);
      return null;
    }
  }
};

// 🔄 How to integrate into your existing code:
// 1. Get free API key from https://rapidapi.com/apidojo/api/realtor/
// 2. Replace this line in index.html (around line 200):
//    bridge: { ... }
// 3. With:
//    bridge: FREE_REALTOR_API,
// 4. Update the API key with your free RapidAPI key
// 5. All your enhanced search features will work with real data!

export default FREE_REALTOR_API;