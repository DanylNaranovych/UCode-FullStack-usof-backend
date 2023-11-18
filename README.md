# USOF Backend

Made By Danyl Naranovych ("dnaranovyc")

It's a backend web API for a StackOverflow-style forum/website.
It makes registration, posting, commenting, liking and adding categories to posts possible.
It also has an Admin panel for CRUD operations on database.  

It sends data in a JSON format that can be seen later.

## Requirements
- NodeJS with ESM support
- NPM
- MySQL Database
  
## How to run
1. Configure db_config.json by setting your database name, user credentials and MySQL Server port (3036 Default)
2. Run "npm i" to install node modules
3. Run "npm run start" or "node index" in the usof_backend directory
4. Application will run on port 8000
   
## Admin panel
1. Configure "db_config.json" (Step 1 from How to Run)
2. Run "npm i" to install node modules
3. Run "npm run start" or "node index" in the admin_panel directory
4. Admin panel will run on port 8001

If no admins are registered and Admin Panel access is required, "node unauthed" will start it without authentication

## Endpoints

### /api/auth...
1. POST /register - register new User. Required parameters:
    1. login
    2. password
    3. password_confirm
    4. email
    5. fullName
    It will send confirmation email to included email with link for activating user
2. POST /email-confirmation/:token - Activate user with given token
3. POST /login - login User. Required:
    1. login
    2. email
    3. password
4. POST /logout - logout
5. POST /password-reset - send email with password reset link. Required:
   1. email
6. POST /password-reset/:token - reset password from link in email. Required:
   1. new_password
   
### /api/users...
1. GET / - get all users. Requires Admin privileges
2. GET /:id - get user by id. Requires Authentication
3. POST / - create new active User. Requires Admin privileges. Required:
   1. login
   2. password
   3. password_confirm
   4. email
   5. fullName
   6. role - "User" || "Admin"
4. PATCH /avathar - change your avathar. Requires Authentication. Required:
   1. profile_picture - file
5. PATCH /:id - change user info by id. Requires Admin privileges. Optional:
   1. login
   2. password
   3. password_confirm
   4. email
   5. fullName
   6. role - "User" || "Admin"
   7. active - boolean
6. DELETE /:id - delete user. Requires Admin privileges

### /api/posts...
1. GET / - get all posts. Optional:
   1. page - number of page. Each page - 25 posts. Starts with 1
   2. sort - sorting - "rating" || "date". Default is rating
   3. category - array of ids of categories for filtering
   4. showInactive - boolean
   5. maxDate - date
   6. minDate - date
2. GET /:id - get post
3. GET /:id/comments - get comments under the post
4. POST /:id/comment - create new Comment.  Requires Authentication. Required:
   1. content
5. GET /:id/categories - get categories of post
6. GET /:id/likes - get all Likes and dislikes of post
7. POST / - create new post. Requires Authentication. Required:
   1. content
   2. title
   3. categories - array of category ids
8. POST /:id/like - like/dislike post. Requires Authentication. Optional:
   1. dislike - boolean
9. PATCH /:id - change post. Requires being author of the post. Optional:
   1.  content
   2.  title
   3.  categories
10. DELETE /:id - delete post. Requires Admin privileges or being Author of post
11. DELETE /:id/like - remove your like/dislike from post. Requires Authentication

### /api/comments...
1. GET /:id - get comment
2. GET /:id/like - get likes on comment
3. POST /:id/like - like/dislike comment Requires Authentication. Optional:
   1. dislike - boolean
4. PATCH /:id - change comment. Requires Admin privileges or being Author. Optional:
   1. content
5. DELETE /:id - delete comment. Requires Admin privileges or being Author.
6. DELETE /:id/like - remove your like/dislike from comment. Requires Authentication
   
### /api/categories...
1. GET / - get all categories
2. GET /:id - get category
3. GET /:id/posts - get all posts associated with category
4. POST / - create new category. Requires Admin privileges Required:
   1. title
   
   Optional:
   1. description
5. PATCH /:id - change category. Requires Admin privileges Optional:
   1. title
   2. description
6. DELETE /:id - delete category. Requires Admin privileges
   


