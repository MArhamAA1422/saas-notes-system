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
      "fullName": "Test",
      "email": "test@go.com",
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
}
```

### Error Response
```
   {
      "error": "Unauthorized",
      "message": "Invalid credentials",
   }
```
```
{
    "errors": [
        {
            "message": "The email field must be a valid email address",
            "rule": "email",
            "field": "email"
        }
    ]
}
```

## GET /api/auth/me

### Success Response
```
{
   "user": {
      "fullName": "Test",
      "email": "test@go.com",
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
    "notes": [
        {
            "id": 1,
            "workspaceId": 2,
            "userId": 2,
            "title": "Tag Test",
            "content": "Tag Test Content",
            "status": "published",
            "visibility": "public",
            "voteCount": 0,
            "lastAutosaveAt": "2025-12-11T09:24:16.000+00:00",
            "deletedAt": null,
            "createdAt": "2025-12-11T06:42:48.000+00:00",
            "updatedAt": "2025-12-11T09:34:44.000+00:00",
            "tags": [
                {
                    "id": 12,
                    "name": "ezy"
                },
                {
                    "id": 13,
                    "name": "app"
                }
            ],
            "user": {
                "id": 2,
                "fullName": "Test"
            }
        }
    ]
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
        "workspaceId": 2,
        "userId": 2,
        "title": "TITLE",
        "content": "CONTENT",
        "status": "draft",
        "voteCount": 0,
        "tags": [],
    }
}
```

### Error Response

```
{
    "error": "Forbidden",
    "message": "This note is private"
}
```

## PUT /api/notes/:id

### Success Response

```
{
    "message": "Note updated successfully",
    "note": {
        "id": 4,
        "title": "note title"
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
}
```

### Error Response

```
{
    "error": "Bad Request",
    "message": "Note is already a draft"
}
```

## GET /api/public/notes
Pagination, sorting, search by TITLE information will be provided as query params.

### Success Response

```
{
    "notes": [
        {
            "id": 245006,
            "workspaceId": 77,
            "userId": 7,
            "title": "Sample Note 245002 - localhost",
            "content": "This is a generated test note used for performance and scaling tests.",
            "status": "published",
            "visibility": "public",
            "voteCount": 44,
            "lastAutosaveAt": null,
            "deletedAt": null,
            "createdAt": "2025-12-12T05:50:57.000+00:00",
            "updatedAt": "2025-12-12T05:50:57.000+00:00",
            "user": {
                "id": 7,
                "fullName": "Ezycomp User 1"
            },
            "tags": [],
            "workspace": {
                "id": 77,
                "name": "Design Workspace 72",
                "tenantId": 1,
                "company": {
                    "id": 1,
                    "name": "Localhost",
                    "hostname": "localhost"
                }
            }
        },
    ],
    "meta": {
        "total": 62376,
        "perPage": 20,
        "currentPage": 1,
        "lastPage": 3119,
        "firstPage": 1,
        "firstPageUrl": "/?page=1",
        "lastPageUrl": "/?page=3119",
        "nextPageUrl": "/?page=2",
        "previousPageUrl": null
    }
}
```

## GET /api/public/notes/:id

### Success Response

```
{
    "note": {
        "id": 8,
        "workspaceId": 4,
        "userId": 11,
        "title": "Sample Note 4 - localhost",
        "content": "This is a generated test note used for performance and scaling tests.",
        "status": "published",
        "visibility": "public",
        "voteCount": 35,
        "lastAutosaveAt": null,
        "deletedAt": null,
        "createdAt": "2025-12-12T05:50:10.000+00:00",
        "updatedAt": "2025-12-12T05:50:10.000+00:00",
        "user": {
            "id": 11,
            "fullName": "Ezycomp User 5"
        },
        "tags": [],
        "workspace": {
            "id": 4,
            "name": "Workspace D",
            "tenantId": 1,
            "company": {
                "id": 1,
                "name": "Localhost",
                "hostname": "localhost"
            }
        }
    }
}
```

## GET /api/notes/:id/vote

### Success Response

```
{
    "hasVoted": false,
    "voteType": null,
    "voteCount": 35
}
```

## GET /api/notes/:id/votes/stats

Get vote breakdown for a note

### Success Response

```
{
    "upvotes": 0,
    "downvotes": 0,
    "total": 0,
    "score": 0
}
```

## POST /api/notes/:id/vote

Vote on a note (upvote or downvote)

Body: { voteType: 'up' | 'down' }

### Success Response

```
{
    "message": "Vote changed to downvote",
    "vote": {
        "voteType": "down",
        "voteCount": 34
    }
}
```

### Error Response

```
{
    "error": "Bad Request",
    "message": "You have already upvoted this note"
}
```

## DELETE /api/notes/:id/vote

### Success Response

```
{
    "message": "Vote removed successfully",
    "voteCount": 35
}
```

### Error Response

```
{
    "error": "Not Found",
    "message": "You have not voted on this note"
}
```

## GET /api/workspaces

### Success Response

```
{
    "meta": {
        "total": 505,
        "perPage": 10,
        "currentPage": 1,
        "lastPage": 51,
        "firstPage": 1,
        "firstPageUrl": "/?page=1",
        "lastPageUrl": "/?page=51",
        "nextPageUrl": "/?page=2",
        "previousPageUrl": null
    },
    "data": [
        {
            "id": 138,
            "name": "Client Projects Workspace 133",
            "createdAt": "2025-12-12T05:35:47.000+00:00",
            "updatedAt": "2025-12-12T05:35:47.000+00:00",
            "notesCount": 495
        },
    ]
}
```

## GET /api/workspaces/:id

### Success Response

```

```