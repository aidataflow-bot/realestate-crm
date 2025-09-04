# 🏠 Property Valuation Sources in ATTOM API Integration

## 💰 Where Does the Estimated Value Come From?

Looking at line 431 in index.html, here's the exact hierarchy:

```javascript
zestimate: assessment.market?.mktttlvalue || assessment.assessed?.assdttlvalue || 350000
```

### **Primary Source (Preferred): Market Value**
- **Field:** `assessment.market.mktttlvalue` 
- **Source:** ATTOM's **Automated Valuation Model (AVM)**
- **Description:** Computer-generated market value estimate
- **Similar to:** Zillow's Zestimate or Redfin's estimate
- **Updates:** Regular algorithmic updates based on market data

### **Secondary Source (Fallback): Assessed Value** 
- **Field:** `assessment.assessed.assdttlvalue`
- **Source:** **County Tax Assessor Records**
- **Description:** Official government assessment for tax purposes
- **Updates:** Annual or bi-annual by county assessors
- **Purpose:** Property tax calculations

### **Tertiary Source (Last Resort): Default Value**
- **Value:** $350,000
- **Purpose:** Prevents null values if both API sources fail
- **Usage:** Rare fallback for data integrity

## 📊 ATTOM Data Valuation Details

### **Market Value (mktttlvalue):**
- 🤖 **Algorithmic estimate** using comparative market analysis
- 📈 **Recent sales data** from surrounding properties  
- 🏠 **Property characteristics** (bed/bath/sqft/age)
- 📍 **Location factors** (neighborhood, schools, amenities)
- 📊 **Market trends** and seasonal adjustments

### **Assessed Value (assdttlvalue):**
- 🏛️ **Government official value** for tax purposes
- 📅 **Updated periodically** (usually annually)
- 💼 **Conservative estimates** (often below market value)
- 🧾 **Used for property tax calculations**
- 📋 **Public record data**

## 🎯 Which One You're Getting:

For **14147 Mailer Blvd, Orlando, FL 32828:**
- If ATTOM has **market value**: You get the AVM estimate
- If no market value: You get the **county assessed value**
- If neither exists: Default $350,000 (very rare)

## 🔍 How to See Which Source:

Check the browser console when testing property lookup:
- Look for `propertyData.source: 'ATTOM Data API - Real Property Records'`
- Market value will typically be higher than assessed value
- Assessed values are often 70-85% of market value

## 💡 Pro Tips:

1. **Market values** are more current and accurate for pricing
2. **Assessed values** are more conservative and stable
3. Both are **real data** from ATTOM's comprehensive database
4. Values update as ATTOM refreshes their data feeds
