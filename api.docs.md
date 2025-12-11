## POST /api/auth/register

### Request Body
```
{
   "fullName": "Test",
   "email": "test@go.com",
   "password": "1234",
}
```

### Success Response
```
{
   "message": "Registration successful",
   "user": {
      "id": 1,
      "fullName": "Test",
      "email": "test@go.com",
      "companyId": 1,
   },
}
```

### Error Response
```
   {
      "error": "Conflict",
      "message": "Email already taken",
   }
```

## POST /api/auth/login

### Request Body
```
{
   "email": "test@go.com",
   "password": "1234",
}
```

### Success Response
```
{
   "message": "Login successful",
   "user": {
      "id": 1,
      "fullName": "Test",
      "email": "test@go.com",
      "companyId": 1,
   },
}
```

### Error Response
```
   {
      "error": "Unauthorized",
      "message": "Invalid credentials",
   }
```

## GET /api/auth/me

### Success Response
```
{
   "user": {
      "id": 1,
      "fullName": "Test",
      "email": "test@go.com",
      "companyId": 1,
      "company": {
         "id": 1,
         "name": "Localhost",
         "hostname": "localhost",
      },
   },
}
```

### Error Response
```
   {
      "error": "Unauthorized",
      "message": "Please login to continue"
   }
```

## POST /api/auth/logout

### Success Response
```
{
   "message": "Logout successful",
}
```

### Error Response
```
   {
      "error": "Unauthorized",
      "message": "Please login to continue"
   }
```

## GET /api/workspaces/:workspacesId/notes

### Success Response
```
{
   "message": "Logout successful",
}
```

### Error Response
```
   {
      "error": "Unauthorized",
      "message": "Please login to continue"
   }
```
```
{
    "error": "Unauthorized",
    "message": "Authentication required"
}
```

## POST /api/workspaces/:workspacesId/notes

### Success Response
```
{
    "message": "Note created successfully",
    "note": {
        "workspaceId": 2,
        "userId": 2,
        "title": "TITLE",
        "content": "CONTENT",
        "status": "draft",
        "visibility": "private",
        "createdAt": "2025-12-11T06:42:48.385+00:00",
        "updatedAt": "2025-12-11T06:42:48.386+00:00",
        "id": 1,
        "tags": [],
        "user": {
            "id": 2,
            "tenantId": 1,
            "fullName": "Test",
            "email": "test@go.com",
            "createdAt": "2025-12-11T05:15:34.000+00:00",
            "updatedAt": "2025-12-11T05:15:34.000+00:00"
        }
    }
}
```

### Error Response
```
{
    "errors": [
        {
            "message": "The title field must have at least 1 characters",
            "rule": "minLength",
            "field": "title",
            "meta": {
                "min": 1
            }
        }
    ]
}
```
{
    "errors": [
        {
            "message": "The content field must have at least 1 characters",
            "rule": "minLength",
            "field": "content",
            "meta": {
                "min": 1
            }
        }
    ]
}
```
```
{
    "errors": [
        {
            "message": "The content field must be defined",
            "rule": "required",
            "field": "content"
        }
    ]
}
```
{
    "errors": [
        {
            "message": "The title field must be defined",
            "rule": "required",
            "field": "title"
        }
    ]
}
```


## GET /api/notes/:id

### Success Response

```
{
    "note": {
        "id": 1,
        "workspaceId": 2,
        "userId": 2,
        "title": "TITLE",
        "content": "CONTENT",
        "status": "draft",
        "visibility": "private",
        "voteCount": 0,
        "lastAutosaveAt": null,
        "deletedAt": null,
        "createdAt": "2025-12-11T06:42:48.000+00:00",
        "updatedAt": "2025-12-11T06:42:48.000+00:00",
        "workspace": {
            "id": 2,
            "tenantId": 1,
            "name": "Workspace B",
            "deletedAt": null,
            "createdAt": "2025-12-10T12:55:58.000+00:00",
            "updatedAt": "2025-12-10T12:55:58.000+00:00"
        },
        "tags": [],
        "user": {
            "id": 2,
            "fullName": "Test",
            "email": "test@go.com"
        }
    }
}
```

## PUT /api/notes/:id

### Success Response

```
{
    "message": "Note updated successfully",
    "note": {
        "id": 2,
        "workspaceId": 3,
        "userId": 2,
        "title": "New Title",
        "content": "public content",
        "status": "published",
        "visibility": "public",
        "voteCount": 0,
        "lastAutosaveAt": null,
        "deletedAt": null,
        "createdAt": "2025-12-11T07:02:58.000+00:00",
        "updatedAt": "2025-12-11T07:11:09.992+00:00",
        "workspace": {
            "id": 3,
            "tenantId": 1,
            "name": "Workspace C",
            "deletedAt": null,
            "createdAt": "2025-12-10T12:55:58.000+00:00",
            "updatedAt": "2025-12-10T12:55:58.000+00:00"
        },
        "tags": [],
        "user": {
            "id": 2,
            "tenantId": 1,
            "fullName": "Test",
            "email": "test@go.com",
            "createdAt": "2025-12-11T05:15:34.000+00:00",
            "updatedAt": "2025-12-11T05:15:34.000+00:00"
        }
    }
}
```

### Error Response

```
{
    "errors": [
        {
            "message": "The title field must be defined",
            "rule": "required",
            "field": "title"
        },
        {
            "message": "The content field must be defined",
            "rule": "required",
            "field": "content"
        }
    ]
}
```
```
{
    "errors": [
        {
            "message": "The title field must have at least 1 characters",
            "rule": "minLength",
            "field": "title",
            "meta": {
                "min": 1
            }
        },
        {
            "message": "The content field must have at least 1 characters",
            "rule": "minLength",
            "field": "content",
            "meta": {
                "min": 1
            }
        }
    ]
}
```
```
{
    "errors": [
        {
            "message": "The selected status is invalid",
            "rule": "enum",
            "field": "status",
            "meta": {
                "choices": [
                    "draft",
                    "published"
                ]
            }
        },
        {
            "message": "The selected visibility is invalid",
            "rule": "enum",
            "field": "visibility",
            "meta": {
                "choices": [
                    "private",
                    "public"
                ]
            }
        },
        {
            "message": "The tags field must be an array",
            "rule": "array",
            "field": "tags"
        }
    ]
}
```
```
{
    "errors": [
        {
            "message": "The selected status is invalid",
            "rule": "enum",
            "field": "status",
            "meta": {
                "choices": [
                    "draft",
                    "published"
                ]
            }
        },
        {
            "message": "The selected visibility is invalid",
            "rule": "enum",
            "field": "visibility",
            "meta": {
                "choices": [
                    "private",
                    "public"
                ]
            }
        }
    ]
}
```

## DELETE /api/notes/:id

### Success Response

```
{
    "message": "Note deleted successfully"
}
```

## PATCH /api/notes/:id/autosave

### Success Response

```
{
    "message": "Auto-saved",
    "lastAutosaveAt": "2025-12-11T09:24:16.323+00:00"
}
```

## POST /api/notes/:id/publish

### Success Response

```
{
    "message": "Note published successfully",
    "note": {
        "id": 1,
        "workspaceId": 2,
        "userId": 2,
        "title": "Test Note Titie",
        "content": "some test content",
        "status": "published",
        "visibility": "private",
        "voteCount": 0,
        "lastAutosaveAt": "2025-12-11T09:24:16.000+00:00",
        "deletedAt": null,
        "createdAt": "2025-12-11T06:42:48.000+00:00",
        "updatedAt": "2025-12-11T09:25:56.351+00:00"
    }
}
```

### Error Response

```
{
    "error": "Bad Request",
    "message": "Note is already published"
}
```

## POST /api/notes/:id/unpublish

### Success Response

```
{
    "message": "Note unpublished successfully",
    "note": {
        "id": 1,
        "workspaceId": 2,
        "userId": 2,
        "title": "Test Note Titie",
        "content": "some test content",
        "status": "draft",
        "visibility": "private",
        "voteCount": 0,
        "lastAutosaveAt": "2025-12-11T09:24:16.000+00:00",
        "deletedAt": null,
        "createdAt": "2025-12-11T06:42:48.000+00:00",
        "updatedAt": "2025-12-11T09:26:27.911+00:00"
    }
}
```

### Error Response

```
{
    "error": "Bad Request",
    "message": "Note is already a draft"
}
```