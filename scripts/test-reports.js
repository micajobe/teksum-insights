const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Get the base URL from the command line arguments or use a default
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
console.log('Testing reports with base URL:', baseUrl);

// Function to make an HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to test the available reports endpoint
async function testAvailableReports() {
  console.log('\nTesting /api/reports/available endpoint...');
  
  try {
    const response = await makeRequest(`${baseUrl}/api/reports/available`);
    console.log('Status code:', response.statusCode);
    
    if (response.statusCode === 200) {
      const reports = JSON.parse(response.data);
      console.log('Available reports:', reports);
      console.log('Number of reports:', reports.length);
      
      if (reports.length > 0) {
        return reports[0]; // Return the first report for further testing
      }
    } else {
      console.error('Failed to get available reports');
    }
  } catch (error) {
    console.error('Error testing available reports:', error);
  }
  
  return null;
}

// Function to test a specific report
async function testReport(filename) {
  console.log(`\nTesting /api/reports/${filename} endpoint...`);
  
  try {
    const response = await makeRequest(`${baseUrl}/api/reports/${filename}`);
    console.log('Status code:', response.statusCode);
    
    if (response.statusCode === 200) {
      const report = JSON.parse(response.data);
      console.log('Report timestamp:', report.timestamp);
      console.log('Number of headlines:', report.headlines?.length || 0);
      console.log('Analysis sections:', Object.keys(report.analysis || {}));
      
      return true;
    } else {
      console.error('Failed to get report');
    }
  } catch (error) {
    console.error('Error testing report:', error);
  }
  
  return false;
}

// Function to test the direct reports endpoint
async function testDirectReport(filename) {
  console.log(`\nTesting /reports/${filename} endpoint...`);
  
  try {
    const response = await makeRequest(`${baseUrl}/reports/${filename}`);
    console.log('Status code:', response.statusCode);
    
    if (response.statusCode === 200) {
      console.log('Successfully retrieved report directly');
      return true;
    } else {
      console.error('Failed to get report directly');
    }
  } catch (error) {
    console.error('Error testing direct report:', error);
  }
  
  return false;
}

// Main function
async function main() {
  console.log('Starting reports test...');
  
  // Test the available reports endpoint
  const firstReport = await testAvailableReports();
  
  if (firstReport) {
    // Test the specific report endpoint
    await testReport(firstReport);
    
    // Test the direct report endpoint
    await testDirectReport(firstReport);
  }
  
  console.log('\nReports test completed');
}

// Run the main function
main().catch(console.error); 