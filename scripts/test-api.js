// Test script for API endpoints
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_ENDPOINTS = [
  '/api/generate-report',
  '/api/reports/check?filename=tech_business_report_20250402_latest.html'
];

// Helper function to make API requests
async function testEndpoint(endpoint, method = 'GET') {
  console.log(`\nTesting ${method} ${endpoint}...`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${contentType}`);
    
    if (isJson) {
      const data = await response.json();
      console.log('Response (JSON):', JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      const text = await response.text();
      console.log('Response (Text):', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
      return { success: false, error: 'Response is not JSON' };
    }
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Test file system access
function testFileSystem() {
  console.log('\nTesting file system access...');
  
  try {
    const docsDir = path.join(process.cwd(), 'docs');
    console.log(`Docs directory: ${docsDir}`);
    
    if (!fs.existsSync(docsDir)) {
      console.log('Docs directory does not exist, creating it...');
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    const testFilePath = path.join(docsDir, 'test.txt');
    console.log(`Test file path: ${testFilePath}`);
    
    // Write a test file
    fs.writeFileSync(testFilePath, 'This is a test file');
    console.log('Successfully wrote test file');
    
    // Read the test file
    const content = fs.readFileSync(testFilePath, 'utf-8');
    console.log(`Successfully read test file: ${content}`);
    
    // List files in the docs directory
    const files = fs.readdirSync(docsDir);
    console.log('Files in docs directory:', files);
    
    return { success: true, files };
  } catch (error) {
    console.error('File system error:', error.message);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runTests() {
  console.log('Starting API tests...');
  console.log(`Base URL: ${BASE_URL}`);
  
  // Test file system access
  const fsResult = testFileSystem();
  
  // Test API endpoints
  for (const endpoint of API_ENDPOINTS) {
    await testEndpoint(endpoint);
  }
  
  // Test POST to generate-report
  await testEndpoint('/api/generate-report', 'POST');
  
  console.log('\nTests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
}); 