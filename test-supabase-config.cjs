#!/usr/bin/env node

// Test Supabase configuration with your project ID
console.log('🔍 Testing Supabase Configuration');
console.log('Project ID: kgezacvwtcetwdlxetji');
console.log('Project URL: https://kgezacvwtcetwdlxetji.supabase.co');

// Test environment variable loading
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

console.log('\n📋 Environment Check:');
console.log('SUPABASE_URL:', SUPABASE_URL || 'NOT SET');
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'SET (length: ' + SUPABASE_ANON_KEY.length + ')' : 'NOT SET');

// Test URL validation
if (SUPABASE_URL === 'https://kgezacvwtcetwdlxetji.supabase.co') {
    console.log('✅ URL correctly configured for your project');
} else {
    console.log('⚠️ URL needs configuration. Expected: https://kgezacvwtcetwdlxetji.supabase.co');
}

// Check if anon key looks valid (JWT format)
if (SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.startsWith('eyJ')) {
    console.log('✅ Anon key appears to be in correct JWT format');
    
    // Try to create Supabase client
    try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client created successfully');
        
        // Test basic connection (this might fail without proper permissions, but that's ok)
        supabase.from('clients').select('count').limit(1)
            .then(({ data, error }) => {
                if (error) {
                    console.log('⚠️ Connection test failed (expected if DB not set up yet):', error.message);
                } else {
                    console.log('✅ Database connection successful!');
                }
            })
            .catch(err => {
                console.log('⚠️ Connection test error (expected if DB not set up yet):', err.message);
            });
            
    } catch (error) {
        console.log('❌ Failed to create Supabase client:', error.message);
    }
} else {
    console.log('⚠️ Anon key not set or invalid format. Should start with "eyJ"');
}

console.log('\n📝 Next Steps:');
console.log('1. Get your anon key from: https://supabase.com/dashboard');
console.log('2. Update .env file with: SUPABASE_ANON_KEY=your_actual_key');
console.log('3. Run the database setup SQL in Supabase');
console.log('4. Test the CRM application');

process.exit(0);