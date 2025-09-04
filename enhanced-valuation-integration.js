// Enhanced Property Valuation Integration
// Multiple APIs for better valuation coverage

const PropertyValuation = {
  
  // Primary: ATTOM Data API
  async getATTOMValuation(address, city, state, zipCode) {
    try {
      const params = new URLSearchParams({
        address1: address,
        address2: `${city} ${state} ${zipCode}`,
        format: 'json'
      });
      
      const response = await fetch(`https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?${params}`, {
        headers: {
          'Accept': 'application/json',
          'apikey': 'b58077119da5fe3a968245f82fcf7c51'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const property = data.property?.[0];
        const assessment = property?.assessment || {};
        
        return {
          source: 'ATTOM Data',
          marketValue: assessment.market?.mktttlvalue,
          assessedValue: assessment.assessed?.assdttlvalue,
          confidence: assessment.market?.mktttlvalue ? 'high' : 'medium'
        };
      }
    } catch (error) {
      console.error('ATTOM valuation error:', error);
    }
    return null;
  },
  
  // Secondary: RealtyMole API (Free tier available)
  async getRealtyMoleValuation(address, city, state, zipCode) {
    try {
      const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
      const response = await fetch(`https://realty-mole-property-api.p.rapidapi.com/avm?address=${encodeURIComponent(fullAddress)}`, {
        headers: {
          'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY', // You'd need a RapidAPI key
          'X-RapidAPI-Host': 'realty-mole-property-api.p.rapidapi.com'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          source: 'RealtyMole AVM',
          marketValue: data.avm?.amount,
          confidence: 'medium',
          lastUpdated: data.avm?.date
        };
      }
    } catch (error) {
      console.error('RealtyMole valuation error:', error);
    }
    return null;
  },
  
  // Tertiary: Enhanced fallback with area-based estimation
  async getEnhancedFallbackValuation(address, city, state, zipCode) {
    const areaValueMap = {
      // Florida - Orlando area
      'orlando,fl': { avg: 380000, sqftPrice: 190 },
      'winter park,fl': { avg: 520000, sqftPrice: 240 },
      'maitland,fl': { avg: 450000, sqftPrice: 210 },
      
      // Default Florida
      'fl': { avg: 350000, sqftPrice: 180 },
      
      // Other states (add as needed)
      'ca': { avg: 650000, sqftPrice: 350 },
      'tx': { avg: 280000, sqftPrice: 140 },
      'ny': { avg: 450000, sqftPrice: 225 }
    };
    
    const locationKey = `${city.toLowerCase()},${state.toLowerCase()}`;
    const stateKey = state.toLowerCase();
    
    const areaData = areaValueMap[locationKey] || areaValueMap[stateKey] || areaValueMap['fl'];
    
    return {
      source: 'Enhanced Area Estimate',
      marketValue: areaData.avg,
      confidence: 'low',
      note: `Based on ${city}, ${state} area averages`
    };
  },
  
  // Master valuation function with multiple sources
  async getPropertyValuation(address, city, state, zipCode, sqft = null) {
    console.log('🏠 Getting property valuation from multiple sources...');
    
    const results = [];
    
    // Try ATTOM first
    const attomResult = await this.getATTOMValuation(address, city, state, zipCode);
    if (attomResult?.marketValue || attomResult?.assessedValue) {
      results.push(attomResult);
    }
    
    // Try RealtyMole as backup (if you get RapidAPI key)
    // const realtyMoleResult = await this.getRealtyMoleValuation(address, city, state, zipCode);
    // if (realtyMoleResult?.marketValue) {
    //   results.push(realtyMoleResult);
    // }
    
    // Always get area-based fallback
    const fallbackResult = await this.getEnhancedFallbackValuation(address, city, state, zipCode);
    results.push(fallbackResult);
    
    // Select best available value
    const primaryResult = results.find(r => r.confidence === 'high') || 
                         results.find(r => r.confidence === 'medium') ||
                         results[results.length - 1];
    
    const finalValue = primaryResult.marketValue || primaryResult.assessedValue || fallbackResult.marketValue;
    
    console.log('💰 Valuation results:', {
      finalValue,
      source: primaryResult.source,
      confidence: primaryResult.confidence,
      allResults: results
    });
    
    return {
      value: finalValue,
      source: primaryResult.source,
      confidence: primaryResult.confidence,
      allSources: results
    };
  }
};

// Usage example:
/*
const valuation = await PropertyValuation.getPropertyValuation(
  '14147 Mailer Blvd',
  'Orlando', 
  'FL',
  '32832',
  1878
);

console.log(`Estimated Value: $${valuation.value.toLocaleString()}`);
console.log(`Source: ${valuation.source} (${valuation.confidence} confidence)`);
*/