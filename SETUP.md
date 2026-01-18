# Hear Me Out - Setup Guide

This guide will walk you through setting up the Hear Me Out application for local development.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB Atlas account** - [Sign up free](https://www.mongodb.com/atlas)
- **Auth0 account** - [Sign up free](https://auth0.com/)
- **Git** - [Download here](https://git-scm.com/)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/misterlinderman/hear-me-out.git
cd hear-me-out
```

---

## Step 2: Install Dependencies

```bash
npm run install:all
```

This installs dependencies for the root, client, and server packages.

---

## Step 3: Set Up MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new project (or use an existing one)
3. Click **"Build a Database"** and select the free M0 tier
4. Choose a cloud provider and region
5. Create a database user:
   - Go to **Database Access** → **Add New Database User**
   - Choose password authentication
   - Save the username and password
6. Configure network access:
   - Go to **Network Access** → **Add IP Address**
   - For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
7. Get your connection string:
   - Go to **Database** → Click **"Connect"**
   - Choose **"Connect your application"**
   - Copy the connection string
   - Replace `<password>` with your database user's password
   - Replace `myFirstDatabase` with `hearmeout`

---

## Step 4: Set Up Auth0

### Create Application

1. Log in to [Auth0 Dashboard](https://manage.auth0.com/)
2. Go to **Applications** → **Create Application**
3. Name it "Hear Me Out" and select **Single Page Application**
4. Click **Create**

### Configure Application Settings

In the application settings, configure:

**Allowed Callback URLs:**
```
http://localhost:5173
```

**Allowed Logout URLs:**
```
http://localhost:5173
```

**Allowed Web Origins:**
```
http://localhost:5173
```

Save your changes.

### Create API

1. Go to **Applications** → **APIs** → **Create API**
2. Configure:
   - **Name:** Hear Me Out API
   - **Identifier:** `http://localhost:3001/api`
   - **Signing Algorithm:** RS256
3. Click **Create**

### Note Your Credentials

From your Auth0 dashboard, collect:
- **Domain:** Found in Application Settings (e.g., `your-tenant.us.auth0.com`)
- **Client ID:** Found in Application Settings
- **API Identifier (Audience):** The identifier you set when creating the API

---

## Step 5: Configure Environment Variables

### Client Configuration

Create `client/.env`:

```bash
cp client/.env.example client/.env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id-here
VITE_AUTH0_AUDIENCE=http://localhost:3001/api
```

### Server Configuration

Create `server/.env`:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hearmeout?retryWrites=true&w=majority

AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=http://localhost:3001/api
```

---

## Step 6: Start Development Servers

```bash
npm run dev
```

This starts both the client (http://localhost:5173) and server (http://localhost:3001) concurrently.

Alternatively, run them separately:

```bash
# Terminal 1 - Server
npm run dev:server

# Terminal 2 - Client
npm run dev:client
```

---

## Step 7: Verify Setup

1. Open http://localhost:5173 in your browser
2. You should see the Hear Me Out landing page
3. Click "Sign In" to test Auth0 authentication
4. After logging in, try creating an idea from the dashboard

---

## Troubleshooting

### MongoDB Connection Issues

- **"Authentication failed"**: Double-check username and password in connection string
- **"Network timeout"**: Ensure your IP is whitelisted in Atlas Network Access
- **"Invalid connection string"**: Make sure you replaced all placeholders

### Auth0 Issues

- **"Callback URL mismatch"**: Verify callback URLs exactly match (including no trailing slashes)
- **"Invalid audience"**: Ensure the audience in client/.env matches the API Identifier in Auth0
- **"Token validation failed"**: Check that AUTH0_DOMAIN doesn't include `https://`

### Port Already in Use

If port 5173 or 3001 is in use:

```bash
# Find process using the port
lsof -i :5173
lsof -i :3001

# Kill the process
kill -9 <PID>
```

Or change ports in the respective .env files.

---

## Project Structure Overview

```
hear-me-out/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API integration
│   │   └── types/          # TypeScript types
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   └── routes/         # API endpoints
│   └── ...
├── docs/                   # Documentation
└── package.json            # Root scripts
```

---

## Next Steps

- Review the [README.md](./README.md) for feature overview
- Explore the API endpoints in `server/src/routes/`
- Customize the UI in `client/src/components/`
- Add your own features following the existing patterns

---

## Getting Help

If you run into issues:

1. Check the troubleshooting section above
2. Review console logs for error messages
3. Verify all environment variables are set correctly
4. Check Auth0 and MongoDB dashboards for any alerts

Happy building! 🚀
