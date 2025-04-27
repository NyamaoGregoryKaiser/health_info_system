# Afya Yetu External API Integration Guide

This guide explains how to set up and use the External API integration feature for the Afya Yetu Health Information System.

## Overview

The External API allows authorized third-party systems to access client profile data securely. This enables integration with other healthcare systems, reporting tools, and analytics platforms.

## Features

- Token-based authentication
- Retrieve individual client profiles by ID
- List and filter clients with pagination
- Detailed client information including enrollments
- Query filtering by ID number, phone number, and update timestamp

## Setup Instructions

### 1. Install Required Dependencies

Make sure your Django installation has the necessary packages:
```
pip install djangorestframework drf-yasg
```

### 2. Create API Tokens for External Systems

Use the provided management command to generate authentication tokens:

```bash
# Create a new token for a user
python manage.py create_api_token username

# Reset an existing token
python manage.py create_api_token username --reset
```

Save the generated token securely as it will only be displayed once.

### 3. Grant API Access Permissions

Ensure the user account associated with the token has the appropriate permissions in the Django admin:
- Can view client
- Can view enrollment

### 4. Configure External System

Provide the external system with:
- The API base URL
- The authentication token
- The API documentation

## Usage Examples

### Python Example

```python
import requests

API_URL = "https://your-afya-yetu-instance.com/api/external/clients/"
API_TOKEN = "your_api_token_here"

headers = {
    "Authorization": f"Token {API_TOKEN}"
}

# Get all clients updated since a specific date
params = {
    "updated_since": "2023-01-01T00:00:00"
}

response = requests.get(API_URL, headers=headers, params=params)
if response.status_code == 200:
    clients = response.json()
    print(f"Retrieved {clients['count']} clients")
    for client in clients['results']:
        print(f"Client: {client['full_name']}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)

# Get a specific client by ID
client_id = "f7854a3a-b8d4-4b90-8c29-c9d15fb402a5"
response = requests.get(f"{API_URL}{client_id}/", headers=headers)
if response.status_code == 200:
    client = response.json()
    print(f"Retrieved client: {client['full_name']}")
    print(f"Enrollments: {len(client['enrollments'])}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const API_URL = 'https://your-afya-yetu-instance.com/api/external/clients/';
const API_TOKEN = 'your_api_token_here';

const headers = {
  'Authorization': `Token ${API_TOKEN}`
};

// Get clients with ID number filter
async function getClientsByIdNumber(idNumber) {
  try {
    const response = await axios.get(API_URL, {
      headers,
      params: { id_number: idNumber }
    });
    
    console.log(`Found ${response.data.count} clients`);
    console.log(response.data.results);
    return response.data;
  } catch (error) {
    console.error('Error fetching clients:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Get specific client
async function getClientById(clientId) {
  try {
    const response = await axios.get(`${API_URL}${clientId}/`, { headers });
    console.log('Client details:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching client:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Example usage
getClientsByIdNumber('23456789');
getClientById('f7854a3a-b8d4-4b90-8c29-c9d15fb402a5');
```

## Security Considerations

1. **Token Security**: Store API tokens securely and never expose them in client-side code
2. **HTTPS**: Always use HTTPS for API requests to encrypt data in transit
3. **Minimal Access**: Create dedicated user accounts with minimal required permissions for API access
4. **Audit Logging**: Monitor and log all API access for security review
5. **Token Rotation**: Periodically reset API tokens using the management command

## Troubleshooting

### Common Issues

1. **Authentication Failed (401)**
   - Check that the token is valid
   - Verify the Authorization header format: `Token your_token_here`
   - Ensure the associated user account is active

2. **Permission Denied**
   - Verify the user has proper permissions assigned

3. **Client Not Found (404)**
   - Confirm the client UUID is correct
   - Check if the client exists in the system

## Additional Resources

- Complete API documentation can be found at `/api/external/docs/`
- For more examples and integration guides, see `backend/api/docs/external_api.md`

## Support

If you encounter any issues with the External API integration, please contact:
- Email: support@afyayetu.org
- Documentation: https://docs.afyayetu.org/api/ 