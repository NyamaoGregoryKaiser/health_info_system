# Afya Yetu External API Documentation

This document outlines how to integrate with the Afya Yetu Health System using our External API. Our API provides access to client profiles and enrollment data for authorized external systems.

## Authentication

All external API endpoints require token authentication. You must include your API token in the Authorization header of all requests.

### Obtaining an API Token

Contact the Afya Yetu system administrator to request an API token for your integration. Tokens are generated for specific user accounts with appropriate permissions.

### Authentication Header Format

```
Authorization: Token your_api_token_here
```

## Endpoints

### 1. List All Clients

**Endpoint:** `GET /api/external/clients/`

**Description:** Retrieve a paginated list of all client profiles

**Query Parameters:**
- `id_number` - Filter clients by national ID number
- `phone` - Filter clients by phone number
- `updated_since` - Return only clients updated after this timestamp (ISO format: YYYY-MM-DDTHH:MM:SS)

**Example Request:**
```
GET /api/external/clients/?updated_since=2023-01-01T00:00:00
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Response:**
```json
{
  "count": 120,
  "next": "http://localhost:8000/api/external/clients/?page=2",
  "previous": null,
  "results": [
    {
      "client_id": "f7854a3a-b8d4-4b90-8c29-c9d15fb402a5",
      "full_name": "John Doe",
      "first_name": "John",
      "last_name": "Doe",
      "id_number": "23456789",
      "date_of_birth": "1985-04-12",
      "age": 38,
      "gender": "M",
      "phone_number": "+254712345678",
      "email": "john.doe@example.com",
      "county": "Nairobi",
      "sub_county": "Westlands",
      "ward": "Parklands",
      "blood_type": "O+",
      "allergies": "None",
      "enrollments": [
        {
          "program_name": "HIV/AIDS Support Program",
          "program_code": "HIV-004",
          "enrollment_date": "2023-05-15",
          "is_active": true,
          "facility_name": "Kenyatta National Hospital",
          "mfl_code": "KNH001"
        }
      ],
      "created_at": "2023-01-15 08:30:45",
      "updated_at": "2023-05-15 14:22:10"
    },
    // More client records...
  ]
}
```

### 2. Get Specific Client

**Endpoint:** `GET /api/external/clients/{client_id}/`

**Description:** Retrieve a specific client profile by their UUID

**Parameters:**
- `client_id` - UUID of the client to retrieve (in the URL path)

**Example Request:**
```
GET /api/external/clients/f7854a3a-b8d4-4b90-8c29-c9d15fb402a5/
Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b
```

**Response:**
```json
{
  "client_id": "f7854a3a-b8d4-4b90-8c29-c9d15fb402a5",
  "full_name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "id_number": "23456789",
  "date_of_birth": "1985-04-12",
  "age": 38,
  "gender": "M",
  "phone_number": "+254712345678",
  "email": "john.doe@example.com",
  "county": "Nairobi",
  "sub_county": "Westlands",
  "ward": "Parklands",
  "blood_type": "O+",
  "allergies": "None",
  "enrollments": [
    {
      "program_name": "HIV/AIDS Support Program",
      "program_code": "HIV-004",
      "enrollment_date": "2023-05-15",
      "is_active": true,
      "facility_name": "Kenyatta National Hospital",
      "mfl_code": "KNH001"
    }
  ],
  "created_at": "2023-01-15 08:30:45",
  "updated_at": "2023-05-15 14:22:10"
}
```

## Error Responses

### Authentication Errors (401 Unauthorized)

```json
{
  "detail": "Authentication credentials were not provided."
}
```

or

```json
{
  "detail": "Invalid token."
}
```

### Not Found Errors (404 Not Found)

```json
{
  "error": "Client with ID f7854a3a-b8d4-4b90-8c29-c9d15fb402a5 not found"
}
```

### Bad Request Errors (400 Bad Request)

```json
{
  "error": "Invalid date format for updated_since. Use ISO format (YYYY-MM-DDTHH:MM:SS)."
}
```

## Rate Limiting

External API access is subject to rate limiting of 100 requests per minute per token. If you exceed this limit, you'll receive a 429 Too Many Requests response.

## Support

For API integration support or to report issues, please contact:
- Email: api-support@afyayetu.org
- Phone: +254-20-123-4567

## Changelog

- 2023-06-01: Initial API release
- 2023-08-15: Added filtering by updated_since parameter 