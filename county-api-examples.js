// 🏛️ FREE COUNTY ASSESSOR API EXAMPLES
// 100% Free property data from government sources

// 📍 LOS ANGELES COUNTY (FREE)
const LA_COUNTY_API = {
  baseURL: 'https://portal.assessor.lacounty.gov/api/search',
  
  searchByAddress: async (address) => {
    try {
      const response = await fetch(`${this.baseURL}?address=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      return {
        address: data.properties[0]?.address,
        owner: data.properties[0]?.owner,
        assessedValue: data.properties[0]?.assessed_value,
        bedrooms: data.properties[0]?.bedrooms,
        bathrooms: data.properties[0]?.bathrooms,
        sqft: data.properties[0]?.square_feet,
        yearBuilt: data.properties[0]?.year_built,
        lotSize: data.properties[0]?.lot_size
      };
    } catch (error) {
      console.error('LA County API error:', error);
      return null;
    }
  }
};

// 📍 COOK COUNTY, CHICAGO (FREE)
const COOK_COUNTY_API = {
  baseURL: 'https://datacatalog.cookcountyil.gov/resource/bcnq-qi2z.json',
  
  searchByAddress: async (address) => {
    try {
      const response = await fetch(`${this.baseURL}?$where=property_address LIKE '%${address}%'`);
      const data = await response.json();
      
      return data.map(property => ({
        address: property.property_address,
        pin: property.pin,
        taxYear: property.tax_year,
        assessedValue: property.total_assessment,
        propertyClass: property.property_class
      }));
    } catch (error) {
      console.error('Cook County API error:', error);
      return null;
    }
  }
};

// 📍 NEW YORK CITY (FREE)
const NYC_API = {
  baseURL: 'https://data.cityofnewyork.us/resource/bc8t-ecyu.json',
  
  searchByAddress: async (address) => {
    try {
      const response = await fetch(`${this.baseURL}?$where=address LIKE '%${address}%'`);
      const data = await response.json();
      
      return data.map(property => ({
        address: property.address,
        borough: property.borough,
        block: property.block,
        lot: property.lot,
        assessedValue: property.assessed_total,
        landValue: property.assessed_land,
        buildingValue: property.assessed_building,
        yearBuilt: property.year_built
      }));
    } catch (error) {
      console.error('NYC API error:', error);
      return null;
    }
  }
};

// 📍 GENERIC COUNTY FINDER
const COUNTY_FINDER = {
  // Find county APIs by state/region
  findCountyAPI: async (state, county) => {
    const commonEndpoints = [
      `https://data.${state.toLowerCase()}.gov`,
      `https://opendata.${county.toLowerCase()}county.gov`,
      `https://data.${county.toLowerCase()}county.com`,
      `https://assessor.${county.toLowerCase()}.gov/api`
    ];
    
    for (let endpoint of commonEndpoints) {
      try {
        const response = await fetch(endpoint + '/api/properties');
        if (response.ok) {
          console.log(`Found county API: ${endpoint}`);
          return endpoint;
        }
      } catch (error) {
        // Try next endpoint
        continue;
      }
    }
    
    return null;
  },
  
  // Generic county data parser
  parseCountyData: (data, format = 'standard') => {
    // Most county APIs follow similar patterns
    return {
      address: data.address || data.property_address || data.full_address,
      owner: data.owner || data.owner_name || data.taxpayer_name,
      assessedValue: data.assessed_value || data.total_assessment || data.market_value,
      bedrooms: data.bedrooms || data.beds || data.bedroom_count,
      bathrooms: data.bathrooms || data.baths || data.bathroom_count,
      sqft: data.square_feet || data.sqft || data.building_area || data.total_area,
      yearBuilt: data.year_built || data.construction_year || data.built_year,
      lotSize: data.lot_size || data.land_area || data.parcel_size,
      propertyType: data.property_type || data.use_code || data.building_type,
      taxInfo: {
        taxYear: data.tax_year || data.assessment_year,
        taxAmount: data.tax_amount || data.annual_tax,
        exemptions: data.exemptions || data.tax_exemptions
      }
    };
  }
};

// 🔄 HOW TO USE COUNTY APIS:

// 1. Find your county's API:
//    - Google: "[your county] assessor API" 
//    - Check: data.gov for your area
//    - Look for: assessor, tax, property records APIs

// 2. Test the endpoints:
//    - Try the URLs in your browser
//    - Look for JSON responses
//    - Check for CORS headers

// 3. Integrate into your CRM:
//    - Add as secondary data source
//    - Combine with RapidAPI for complete data
//    - Use for property verification

// 🎯 EXAMPLE INTEGRATION:
const HYBRID_FREE_API = {
  // Use RapidAPI for listings, County for details
  searchProperties: async (query) => {
    // 1. Get listings from RapidAPI (10k free/month)
    const listings = await FREE_REALTOR_API.searchProperties(query);
    
    // 2. Enhance with county data (unlimited free)
    const enhancedListings = await Promise.all(
      listings.map(async (listing) => {
        const countyData = await this.getCountyData(listing.address);
        return {
          ...listing,
          assessorData: countyData,
          verified: !!countyData
        };
      })
    );
    
    return enhancedListings;
  },
  
  getCountyData: async (address) => {
    // Try multiple county sources
    const sources = [LA_COUNTY_API, COOK_COUNTY_API, NYC_API];
    
    for (let source of sources) {
      try {
        const data = await source.searchByAddress(address);
        if (data) return data;
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }
};

export { LA_COUNTY_API, COOK_COUNTY_API, NYC_API, COUNTY_FINDER, HYBRID_FREE_API };