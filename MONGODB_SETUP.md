

## Setup Steps

### 1. Create `.env.local` file in the root directory

Create a file named `.env.local` with the following content:

```env
# MongoDB Connection String
# Replace <cluster-url> with your actual MongoDB Atlas cluster URL

# API URL - Points to local API routes
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Important**: Replace `<cluster-url>` with your actual MongoDB Atlas cluster URL. 


### 2. Install Dependencies

```bash
npm install mongoose
```

### 3. MongoDB Connection

The application uses Mongoose for MongoDB connection. The connection is handled in:
- `lib/mongoose.js` - Main connection handler
- `lib/mongodb.js` - Alternative MongoDB native driver (optional)

### 4. Database Models

Models are defined in the `models/` directory:
- `models/Post.js` - Blog posts/articles
- `models/Category.js` - Categories

### 5. API Routes

API routes are created in `pages/api/`:
- `pages/api/posts/index.js` - GET all posts, POST create post
- `pages/api/posts/[slug].js` - GET post by slug
- `pages/api/posts-by-slug/[slug].js` - Alternative route for post by slug
- `pages/api/categories/index.js` - GET all categories, POST create category

### 6. Update Frontend

The frontend will automatically use the local API routes when `NEXT_PUBLIC_API_URL` points to `/api`.



## Testing the Connection

After setting up, you can test the connection by:

1. Starting the development server: `npm run dev`
2. Creating a post through the admin panel
3. Checking MongoDB Atlas to see if the data was saved

## Notes

- The connection uses connection pooling for better performance
- In development, connections are cached to prevent multiple connections
- All models include timestamps (createdAt, updatedAt)
- Indexes are created for better query performance
