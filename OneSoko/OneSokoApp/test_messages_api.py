#!/usr/bin/env python3
"""
Test script for Messages API
"""
import requests
import json

# API base URL
BASE_URL = "http://localhost:8000/api"

def test_messages_api():
    print("Testing Messages API...")
    
    # Test data
    test_data = {
        "recipient": 1,  # Assuming user ID 1 exists
        "content": "Hello! This is a test message from the API."
    }
    
    try:
        # Test message creation
        print("1. Testing message creation...")
        response = requests.post(f"{BASE_URL}/messages/", json=test_data)
        
        if response.status_code == 201:
            print("✅ Message created successfully!")
            message_data = response.json()
            print(f"   Message ID: {message_data.get('id')}")
            print(f"   Content: {message_data.get('content')}")
        else:
            print(f"❌ Failed to create message. Status: {response.status_code}")
            print(f"   Response: {response.text}")
        
        # Test getting conversations
        print("\n2. Testing get conversations...")
        response = requests.get(f"{BASE_URL}/messages/conversations/")
        
        if response.status_code == 200:
            print("✅ Conversations retrieved successfully!")
            conversations = response.json()
            print(f"   Number of conversations: {len(conversations)}")
        else:
            print(f"❌ Failed to get conversations. Status: {response.status_code}")
            print(f"   Response: {response.text}")
        
        # Test getting unread count
        print("\n3. Testing get unread count...")
        response = requests.get(f"{BASE_URL}/messages/unread_count/")
        
        if response.status_code == 200:
            print("✅ Unread count retrieved successfully!")
            count_data = response.json()
            print(f"   Unread count: {count_data.get('unread_count', 0)}")
        else:
            print(f"❌ Failed to get unread count. Status: {response.status_code}")
            print(f"   Response: {response.text}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server. Make sure Django is running on localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_messages_api() 