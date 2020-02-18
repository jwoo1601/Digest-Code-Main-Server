# Digest-Code-Main-Server
An Express and Node.js based Web Server

## Features
### 1. OAuth 2.0 Conformant
- Routes:
  - `GET /api/v1/oauth2/authorize`
  : accepts incoming request for new OAuth 2.0 session
  - `POST /api/v1/oauth2/decision`
  : accepts user's decision on whether or not to accept/deny the client's access
  - `POST /api/v1/oauth2/token/client`
  : exchanges the given client token with new access token
  - `POST /api/v1/oauth2/token/refresh`
  : exchanges the given refresh token with new access token
          
### 2. Support for Various APIs
- User routes:
  - `GET /api/v1/user/profile`
  : retrieves profiles of all the existing users
  - `GET /api/v1/user/profile/:username`
  : retrieves the profile of the given user
  - `PUT /api/v1/user/profile/edit/:username`
  : modifies the profile of the given user
  - `GET /api/v1/user/payment/:username`
  : retrieves payment history of the given user
  - `POST /api/v1/user/register`
  : registers a new user
  - `DELETE /api/v1/user/unregister/:username`
  : unregisters the given user
  
- Post routes:
  - `GET /api/v1/post`
  - `GET /api/v1/post/:postId`
  - `POST /api/v1/post/add`
  - `PUT /api/v1/post/edit/:postId`
  - `DELETE /api/v1/post/delete/:postId`
  
  - `GET /api/v1/post/comment/:commentId`
  - `POST /api/v1/post/comment/add`
  - `PUT /api/v1/post/comment/edit/:commentId`
  - `DELETE /api/v1/post/comment/delete/:commentId`
  
- Course routes:
  - `GET /api/v1/course`
  - `GET /api/v1/course/:code`
  - `POST /api/v1/course/add`
  - `PUT /api/v1/course/edit/:code`
  - `DELETE /api/v1/course/delete/:code`
  
  - `GET /api/v1/course/chapter/:chapterIndex?course=<string>`
  - `POST /api/v1/course/chapter/add`
  - `PUT /api/v1/course/chapter/edit/:chapterIndex`
  - `DELETE /api/v1/course/chapter/delete/:chapterIndex`
  
  - `GET /api/v1/course/comment/:commentId`
  - `POST /api/v1/course/comment/add`
  - `PUT /api/v1/course/comment/edit/:commentId`
  - `DELETE /api/v1/course/comment/delete/:commentId`
  
- Client routes:
  - `GET /api/v1/client/profile`
  - `GET /api/v1/client/profile/:clientId`
  - `POST /api/v1/client/register`
  - `DELETE /api/v1/client/delete/:clientId`
  
- Login routes:
  - `GET /api/v1/login/dialog`
  - `POST /api/v1/login`
  
- Sandbox routes:
  - `GET /api/v1/sandbox/profile`
  - `GET /api/v1/sandbox/profile/:sandboxId`
  - `PUT /api/v1/sandbox/profile/edit/:sandboxId`
  - `POST /api/v1/sandbox/create`
  - `DELETE /api/v1/sandbox/destroy/:sandboxId`
  
- Static resources:
  - `GET static.digest-code.azurewebsites.net/scripts`
  - `GET static.digest-code.azurewebsites.net/styles`

- Content Delivery Network:
  - `GET cdn.digest-code.azurewebsites.net/resource`
  
### 3. Built-in Security Supports
- One-time request id
  - `GET /api/v1/requestSession/key`
