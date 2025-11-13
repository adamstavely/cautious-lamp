#!/usr/bin/env node

/**
 * Script to enable all feature flags
 * Usage: node scripts/enable-all-features.js
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function enableAllFeatures() {
  try {
    console.log('Fetching all feature flags...');
    const response = await axios.get(`${API_BASE_URL}/api/v1/feature-flags`);
    const flags = response.data;
    
    console.log(`Found ${flags.length} feature flags`);
    
    let enabledCount = 0;
    let alreadyEnabledCount = 0;
    
    for (const flag of flags) {
      if (!flag.enabled) {
        try {
          await axios.put(`${API_BASE_URL}/api/v1/feature-flags/${flag.id}`, {
            enabled: true,
          });
          console.log(`✓ Enabled: ${flag.key}`);
          enabledCount++;
        } catch (error) {
          console.error(`✗ Failed to enable ${flag.key}:`, error.message);
        }
      } else {
        alreadyEnabledCount++;
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total flags: ${flags.length}`);
    console.log(`Already enabled: ${alreadyEnabledCount}`);
    console.log(`Newly enabled: ${enabledCount}`);
    console.log(`All features are now enabled!`);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Error: Could not connect to backend API.');
      console.error(`Make sure the backend is running on ${API_BASE_URL}`);
      process.exit(1);
    } else {
      console.error('Error enabling features:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
      process.exit(1);
    }
  }
}

enableAllFeatures();

