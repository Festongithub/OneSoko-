// Test Shop Owner Registration
// This script simulates exactly what the frontend form does

const API_BASE_URL = 'http://localhost:8000/api';

async function testShopOwnerRegistration() {
  console.log('🧪 Testing Shop Owner Registration Form Submission...\n');

  // Simulate the exact data that the ShopOwnerRegister form sends
  const formData = {
    // Personal data
    username: `shopowner_${Date.now()}`,
    email: `shopowner_${Date.now()}@example.com`,
    password: 'testpass123',
    first_name: 'John',
    last_name: 'Doe',
    phone_number: '+1234567890',
    
    // Shop data
    shop_name: 'My Awesome Shop',
    shop_description: 'This is my awesome shop description',
    shop_address: '123 Business Street, City, State',
    shop_phone: '+1234567890',
    business_license: 'BL123456789',
    tax_id: 'TX987654321'
  };

  console.log('Form data to be sent:', JSON.stringify(formData, null, 2));

  try {
    console.log('\n📤 Sending registration request...');
    
    const response = await fetch(`${API_BASE_URL}/shopowners/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const responseData = await response.json();
      console.log('✅ Registration successful!');
      console.log('Response data:', responseData);
      
      // Test login with the created user
      console.log('\n🔐 Testing login with created user...');
      
      const loginResponse = await fetch(`${API_BASE_URL}/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log('Got access token');
        
        // Test getting user profile
        console.log('\n👤 Testing user profile fetch...');
        const profileResponse = await fetch(`${API_BASE_URL}/userprofiles/`, {
          headers: {
            'Authorization': `Bearer ${loginData.access}`,
          },
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ Profile fetch successful!');
          console.log('Profile data:', profileData);
        } else {
          console.log('⚠️ Profile fetch failed:', profileResponse.status);
        }
        
      } else {
        const loginError = await loginResponse.json();
        console.log('❌ Login failed:', loginError);
      }
      
    } else {
      const errorData = await response.text();
      console.log('❌ Registration failed!');
      console.log('Error response:', errorData);
      
      try {
        const jsonError = JSON.parse(errorData);
        console.log('Parsed error:', jsonError);
      } catch (e) {
        console.log('Raw error text:', errorData);
      }
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.error('Full error:', error);
  }

  console.log('\n🎯 Test completed!');
}

// Run the test
testShopOwnerRegistration();
