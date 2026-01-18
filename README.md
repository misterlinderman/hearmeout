# 💡 Hear Me Out

**A platform where ideas become reality through community support and professional formalization.**

Hear Me Out is a web application that empowers creators, inventors, and entrepreneurs to submit their concepts, inventions, and business ideas with built-in assistance for creating official documentation like trademarks, copyrights, and patents. Users can seek investment, partnerships, or resources while contributing to and supporting others' ideas.

---

## 🎯 Core Features

### For Idea Creators
- **Idea Submission Portal** - Submit concepts with structured templates for different idea types
- **IP Protection Assistance** - Guided workflows for trademarks, copyrights, and patent applications
- **Resource Requests** - Specify what you need: funding, partnerships, expertise, equipment
- **Progress Tracking** - Monitor your idea's journey from concept to reality
- **Revenue Sharing Setup** - Configure compensation structures for contributors

### For Contributors
- **Idea Discovery** - Browse and search submissions by category, stage, or resource needs
- **Contribution Types** - Offer funding, expertise, labor, equipment, or partnerships
- **Portfolio Building** - Track your contributions and successful collaborations
- **Reputation System** - Build credibility through successful projects

### For Moderators
- **Submission Review Queue** - Evaluate new submissions for quality and legitimacy
- **Content Moderation** - Manage flagged content and community guidelines
- **IP Verification** - Assist with trademark/copyright submission verification
- **Analytics Dashboard** - Track platform health and user engagement

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Vite + React 18 | Fast development, optimized builds |
| Language | TypeScript | Full-stack type safety |
| Styling | Tailwind CSS | Utility-first responsive design |
| Routing | React Router v6 | Client-side navigation |
| Backend | Express.js | RESTful API server |
| Database | MongoDB + Mongoose | Document database with schemas |
| Authentication | Auth0 | Secure authentication with JWT |
| File Storage | AWS S3 (future) | Document and media uploads |
| Search | MongoDB Atlas Search | Full-text idea search |

---

## 📁 Project Structure

```
hear-me-out/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/          # Buttons, inputs, cards
│   │   │   ├── layout/          # Header, footer, sidebar
│   │   │   ├── ideas/           # Idea cards, forms, lists
│   │   │   ├── contributions/   # Contribution widgets
│   │   │   └── moderation/      # Admin components
│   │   ├── pages/               # Route-level components
│   │   │   ├── Home.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── IdeaSubmit.tsx
│   │   │   ├── IdeaDetail.tsx
│   │   │   ├── Explore.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── admin/
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API integration
│   │   ├── context/             # React context providers
│   │   ├── types/               # TypeScript interfaces
│   │   └── utils/               # Helper functions
│   └── public/
├── server/                      # Express backend
│   ├── src/
│   │   ├── config/              # Database, auth config
│   │   ├── middleware/          # Auth, validation, errors
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Idea.ts
│   │   │   ├── Contribution.ts
│   │   │   ├── IPFiling.ts
│   │   │   └── Comment.ts
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   └── types/               # TypeScript types
│   └── scripts/
├── docs/                        # Documentation
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── IP_GUIDE.md
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Auth0 account

### Installation

```bash
# Clone the repository
git clone https://github.com/misterlinderman/hear-me-out.git
cd hear-me-out

# Install all dependencies
npm run install:all

# Copy environment files
cp client/.env.example client/.env
cp server/.env.example server/.env

# Configure your environment variables (see below)

# Start development servers
npm run dev
```

### Environment Variables

**Client (`client/.env`):**
```
VITE_API_URL=http://localhost:3001/api
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=http://localhost:3001/api
```

**Server (`server/.env`):**
```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=http://localhost:3001/api
```

---

## 📖 Idea Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Invention** | Physical or digital products | Smart water bottle, mobile app |
| **Business** | Company or service concepts | Subscription box service |
| **Creative** | Art, media, entertainment | Film concept, game design |
| **Social** | Community or nonprofit ideas | Neighborhood app, charity |
| **Research** | Scientific or academic | Medical study, survey |
| **Technology** | Software or hardware | AI tool, IoT device |

---

## 🔒 IP Protection Services

Hear Me Out provides guided assistance for:

1. **Trademark Registration**
   - Name and logo protection
   - Step-by-step USPTO guidance
   - Document templates

2. **Copyright Filing**
   - Creative work protection
   - eCO registration assistance
   - Certificate tracking

3. **Patent Applications**
   - Provisional patent guidance
   - Prior art search tools
   - Attorney referral network

4. **NDA Generation**
   - Template library
   - Digital signatures
   - Secure sharing

---

## 🤝 Contribution Types

| Type | Description |
|------|-------------|
| **Funding** | Financial investment with equity/revenue share |
| **Expertise** | Professional skills and consulting |
| **Labor** | Hands-on work and development |
| **Equipment** | Physical resources and tools |
| **Partnership** | Strategic business collaboration |
| **Mentorship** | Guidance and industry connections |

---

## 📊 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server concurrently |
| `npm run dev:client` | Start only frontend (port 5173) |
| `npm run dev:server` | Start only backend (port 3001) |
| `npm run build` | Build both for production |
| `npm run install:all` | Install all dependencies |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm run test` | Run test suites |

---

## 🗺 Roadmap

### Phase 1 - MVP (Current)
- [x] User authentication
- [x] Idea submission and viewing
- [x] Basic contribution system
- [x] User profiles and dashboards

### Phase 2 - IP Services
- [ ] Trademark filing workflow
- [ ] Copyright registration guide
- [ ] NDA template generator
- [ ] Document storage

### Phase 3 - Financial Features
- [ ] Stripe integration for funding
- [ ] Revenue sharing contracts
- [ ] Escrow services
- [ ] Payment tracking

### Phase 4 - Community
- [ ] Messaging system
- [ ] Comment threads
- [ ] Reputation scores
- [ ] Achievement badges

### Phase 5 - Scale
- [ ] Mobile app (React Native)
- [ ] Advanced search with AI
- [ ] Partner API
- [ ] White-label solution

---

## 📄 License

MIT

---

## 👥 Contributors

Built with ❤️ by the Hear Me Out team.

---

*Have an idea? We want to hear you out.*
