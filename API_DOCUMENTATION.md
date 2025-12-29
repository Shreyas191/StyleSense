# API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Authentication

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

**Error Responses:**
- 400: Email already registered
- 422: Validation error

---

#### POST /api/auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

**Error Responses:**
- 401: Incorrect email or password
- 422: Validation error

---

### 2. Outfit Analysis

#### POST /api/outfit/analyze
Upload and analyze an outfit image.

**Authentication Required:** Yes

**Request:**
- Content-Type: multipart/form-data
- Body: file (image file, max 5MB, jpg/jpeg/png)

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "user_id": "507f1f77bcf86cd799439011",
  "image_filename": "abc123.jpg",
  "image_url": "/uploads/abc123.jpg",
  "analysis": {
    "detected_outfit_items": [
      {
        "item_name": "Blue Denim Jacket",
        "description": "Classic light wash denim jacket with button closure"
      },
      {
        "item_name": "White T-Shirt",
        "description": "Plain crew neck cotton t-shirt"
      }
    ],
    "style_description": "Casual street style with a modern edge",
    "outfit_rating": {
      "score": 8,
      "reason": "Well-coordinated casual outfit with good fit and complementary colors"
    },
    "improvement_suggestions": [
      "Add a statement accessory like a leather belt or watch",
      "Consider rolling up the jacket sleeves for a more relaxed look"
    ],
    "cheaper_alternatives": [
      {
        "original_item": "Blue Denim Jacket",
        "suggestion": "Look for similar denim jackets at H&M or Uniqlo",
        "estimated_price_range": "$30-$50",
        "where_to_buy": "H&M, Uniqlo, ASOS"
      }
    ],
    "color_matching_recommendations": {
      "current_colors": ["blue", "white"],
      "recommended_colors": ["beige", "brown", "olive green"],
      "reasoning": "Earth tones would complement the blue denim while maintaining the casual aesthetic"
    }
  },
  "created_at": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- 400: Invalid file type or size
- 401: Unauthorized
- 500: Analysis failed

---

#### GET /api/outfit/{outfit_id}
Get a specific outfit analysis by ID.

**Authentication Required:** Yes

**Path Parameters:**
- outfit_id: string (MongoDB ObjectId)

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "user_id": "507f1f77bcf86cd799439011",
  "image_filename": "abc123.jpg",
  "image_url": "/uploads/abc123.jpg",
  "analysis": { ... },
  "created_at": "2024-01-15T10:30:00"
}
```

**Error Responses:**
- 400: Invalid outfit ID
- 401: Unauthorized
- 404: Outfit not found

---

#### GET /api/outfit/user/all
Get all outfits for the authenticated user.

**Authentication Required:** Yes

**Query Parameters:**
- skip: integer (default: 0) - Number of items to skip
- limit: integer (default: 20, max: 100) - Number of items to return

**Example:**
```
GET /api/outfit/user/all?skip=0&limit=20
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "user_id": "507f1f77bcf86cd799439011",
    "image_filename": "abc123.jpg",
    "image_url": "/uploads/abc123.jpg",
    "analysis": { ... },
    "created_at": "2024-01-15T10:30:00"
  },
  {
    "id": "507f1f77bcf86cd799439013",
    "user_id": "507f1f77bcf86cd799439011",
    "image_filename": "def456.jpg",
    "image_url": "/uploads/def456.jpg",
    "analysis": { ... },
    "created_at": "2024-01-14T15:20:00"
  }
]
```

**Error Responses:**
- 401: Unauthorized

---

#### DELETE /api/outfit/{outfit_id}
Delete an outfit analysis.

**Authentication Required:** Yes

**Path Parameters:**
- outfit_id: string (MongoDB ObjectId)

**Response (200 OK):**
```json
{
  "message": "Outfit deleted successfully"
}
```

**Error Responses:**
- 400: Invalid outfit ID
- 401: Unauthorized
- 404: Outfit not found

---

### 3. Health Check

#### GET /api/health
Check API health status.

**Authentication Required:** No

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "AI Outfit Analyzer"
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 422: Validation Error
- 500: Internal Server Error

---

## Rate Limiting

Currently, there are no rate limits, but consider implementing them in production:
- Authentication endpoints: 5 requests per minute
- Upload endpoint: 10 requests per hour
- Other endpoints: 100 requests per minute

---

## File Upload Specifications

**Accepted Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)

**Maximum File Size:** 5MB

**Recommendations:**
- Use well-lit, clear images
- Ensure the full outfit is visible
- Avoid heavily filtered or edited images
- Higher resolution images yield better analysis

---

## Pagination

Endpoints that return lists support pagination using:
- `skip`: Number of items to skip
- `limit`: Maximum number of items to return

Example:
```
GET /api/outfit/user/all?skip=20&limit=20
```

This fetches items 21-40.

---

## CORS

The API supports CORS for the following origins:
- http://localhost:3000 (development)
- Configure production URLs in environment variables

---

## WebSocket Support

Not currently implemented, but could be added for real-time analysis updates.

---

## Versioning

Current API version: v1

Future versions will be accessible via:
```
/api/v2/...
```
