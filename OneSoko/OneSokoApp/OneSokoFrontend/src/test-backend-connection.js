// Backend Connection Test Script
// This script tests the connection between frontend and backend

const API_BASE_URL = 'http://localhost:8000/api';

async function testBackendConnection() {
  console.log('🔧 Testing Backend-Frontend Connection...\n');

  // Test 1: Basic API connectivity
  try {
    console.log('1. Testing basic API connectivity...');
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    console.log('✅ Basic API connection successful');
    console.log('Available endpoints:', Object.keys(data));
  } catch (error) {
    console.error('❌ Basic API connection failed:', error.message);
    return;
  }

  // Test 2: Categories endpoint
  try {
    console.log('\n2. Testing categories endpoint...');
    const response = await fetch(`${API_BASE_URL}/categories/`);
    const categories = await response.json();
    console.log('✅ Categories endpoint working');
    console.log(`Found ${categories.length} categories`);
  } catch (error) {
    console.error('❌ Categories endpoint failed:', error.message);
  }

  // Test 3: Tags endpoint
  try {
    console.log('\n3. Testing tags endpoint...');
    const response = await fetch(`${API_BASE_URL}/tags/`);
    const tags = await response.json();
    console.log('✅ Tags endpoint working');
    console.log(`Found ${tags.length} tags`);
  } catch (error) {
    console.error('❌ Tags endpoint failed:', error.message);
  }

  // Test 4: Products endpoint
  try {
    console.log('\n4. Testing products endpoint...');
    const response = await fetch(`${API_BASE_URL}/products/`);
    const products = await response.json();
    console.log('✅ Products endpoint working');
    console.log(`Found ${products.length} products`);
  } catch (error) {
    console.error('❌ Products endpoint failed:', error.message);
  }

  // Test 5: User registration endpoint
  try {
    console.log('\n5. Testing user registration endpoint...');
    const testUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'testpass123'
    };
    
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log('✅ User registration endpoint working');
      console.log('Created user:', userData);
    } else {
      const error = await response.json();
      console.log('⚠️ User registration response:', response.status, error);
    }
  } catch (error) {
    console.error('❌ User registration endpoint failed:', error.message);
  }

  // Test 6: JWT Token endpoint
  try {
    console.log('\n6. Testing JWT token endpoint...');
    // First create a user, then try to get a token
    const loginData = {
      username: 'testuser2', // Use the user we created earlier
      password: 'testpass123'
    };
    
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
    
    if (response.ok) {
      const tokenData = await response.json();
      console.log('✅ JWT token endpoint working');
      console.log('Token received successfully');
      
      // Test 7: Authenticated endpoint (shops)
      try {
        console.log('\n7. Testing authenticated shops endpoint...');
        const shopsResponse = await fetch(`${API_BASE_URL}/shops/`, {
          headers: {
            'Authorization': `Bearer ${tokenData.access}`,
          },
        });
        
        if (shopsResponse.ok) {
          const shops = await shopsResponse.json();
          console.log('✅ Authenticated shops endpoint working');
          console.log(`Found ${shops.length} shops`);
        } else {
          console.log('⚠️ Shops endpoint response:', shopsResponse.status);
        }
      } catch (error) {
        console.error('❌ Shops endpoint failed:', error.message);
      }
      
    } else {
      const error = await response.json();
      console.log('⚠️ JWT token response:', response.status, error);
    }
  } catch (error) {
    console.error('❌ JWT token endpoint failed:', error.message);
  }

  console.log('\n🎉 Backend connection test completed!');
}

// Run the test
testBackendConnection();
