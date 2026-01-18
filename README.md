# Rate My Contributor ⭐

A modern web platform for discovering, reviewing, and rating GitHub contributors based on their open-source contributions. Help the community identify quality contributors and build your reputation through peer reviews.

**🎨 [Live Demo](https://rate-my-contributor.vercel.app)** | **🐛 [Report Bug](https://github.com/AL1L/rate-my-contributor/issues)** | **✨ [Request Feature](https://github.com/AL1L/rate-my-contributor/issues)**

> Inspired by [@dan_ddyo on X](https://x.com/dan_ddyo/status/2012521016333947339)

---

## ✨ Features

### 🌐 Public Features
- **Search & Browse** - Discover GitHub contributors with intelligent search
- **Contributor Profiles** - View detailed profiles with ratings, pull requests, and commit history
- **Rating System** - See community ratings and average scores (1-5 stars)
- **GitHub Integration** - Real-time data from GitHub's API
- **Dark Mode** - Beautiful light and dark themes

### 🔐 Authenticated Features
- **OAuth Sign-in** - Secure authentication with GitHub
- **Leave Reviews** - Rate contributors with scores and comments
- **Personal Dashboard** - Track your ratings and notifications
- **Activity Feed** - See recent ratings you've received
- **Profile Management** - Customize your preferences

### 👑 Admin Features
- **User Management** - View and manage all platform users
- **Platform Analytics** - Monitor statistics (users, ratings, PRs)
- **Moderation Tools** - Delete inappropriate content or users
- **Protected Routes** - Secure admin-only pages and API endpoints

### 🔒 Security Features
- **CSRF Protection** - All state-changing operations protected
- **Input Sanitization** - XSS prevention with DOMPurify
- **SQL Injection Prevention** - Parameterized queries and input validation
- **Session Management** - 90-day JWT sessions with secure timeouts
- **HTTP Security Headers** - Frame protection, XSS guards, content policies
- **Database Authorization** - Role verification from database, not JWT
- **Route Protection** - Next.js middleware for edge-level security
- **IDOR Prevention** - Proper authorization checks on all resources

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database
- GitHub OAuth App ([Create one here](https://github.com/settings/developers))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AL1L/rate-my-contributor.git
   cd rate-my-contributor
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or: npm install
   # or: bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/rate_my_contributor"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"  # Generate with: openssl rand -base64 32
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   GITHUB_TOKEN="your-github-pat"  # Optional: for higher API limits
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed initial data (optional)**
   ```bash
   npm run seed
   ```

6. **Start development server**
   ```bash
   yarn dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

## Features

### For All Users
- 🏠 **Home Page** - Overview with statistics and top contributors
- 🔍 **Search Contributors** - Find and browse GitHub contributors
- 👤 **User Profiles** - View detailed profiles with ratings, PRs, and commits
- 🔐 **GitHub OAuth** - Secure authentication with GitHub

### For Authenticated Users
- ⭐ **Rate Contributors** - Leave ratings and comments
- 📊 **Personal Dashboard** - View your stats and activity
- 🔔 **Notifications** - Get notified when you receive ratings
- 🌓 **Dark Mode** - Toggle between light and dark themes

### For Admins
- 👥 **User Management** - View and manage all users
- 📈 **Platform Statistics** - Monitor site-wide metrics
- 🗑️ **Moderation** - Remove inappropriate content or users

---

## 🛠️ Technology Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router & React Server Components
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Tabler Icons](https://tabler.io/icons)** - 5000+ customizable icons
- **React Compiler** - Automatic memoization optimization

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Serverless API endpoints
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Production-grade database
- **[NextAuth.js](https://next-auth.js.org/)** - Complete authentication solution

### Security & Validation
- **[DOMPurify](https://github.com/cure53/DOMPurify)** - XSS prevention
- **CSRF Tokens** - Cross-site request forgery protection
- **Next.js Middleware** - Edge-level route protection
- **HTTP Security Headers** - Frame protection, content policies

### DevOps & Tools
- **[Prisma Studio](https://www.prisma.io/studio)** - Database GUI
- **[GitHub API](https://docs.github.com/en/rest)** - Real-time contributor data
- **[Vercel](https://vercel.com/)** - Deployment platform (recommended)

---

---

## 🔧 Development

### Available Scripts

```bash
# Development
yarn dev              # Start dev server (with hot reload)
yarn build            # Build for production
yarn start            # Start production server
yarn lint             # Run ESLint

# Database
npx prisma migrate dev    # Create & apply migrations
npx prisma generate       # Generate Prisma Client
npx prisma studio         # Open database GUI
npx prisma db push        # Push schema without migrations (dev only)
npx prisma db seed        # Run seed scripts

# Prisma Postgres (optional)
npx prisma postgres create  # Create cloud database
```

### Creating Your First Admin User

**Method 1: Using Prisma Studio**
```bash
npx prisma studio
```
Navigate to `User` table → Find your user → Change `role` to `"admin"` → Save

**Method 2: Using SQL**
```sql
UPDATE "User" 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

**Method 3: Using the make-admin script**
```bash
node scripts/make-admin.js your-github-username
```

### Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_URL` | Application URL | Yes | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | Yes | Generate: `openssl rand -base64 32` |
| `GITHUB_CLIENT_ID` | OAuth app client ID | Yes | From GitHub OAuth app settings |
| `GITHUB_CLIENT_SECRET` | OAuth app client secret | Yes | From GitHub OAuth app settings |
| `GITHUB_TOKEN` | Personal access token | No | For higher API rate limits (5000/hr) |

### Setting Up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in details:
   - **Application name**: Rate My Contributor (Dev)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy `Client ID` and `Client Secret` to your `.env` file

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AL1L/rate-my-contributor)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Manual Deployment

```bash
# Build the application
yarn build

# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="your-production-db-url"
export NEXTAUTH_URL="https://yourdomain.com"
# ... other env vars

# Start production server
yarn start
```

### Database Deployment

**Option 1: Prisma Postgres (Recommended)**
```bash
npx prisma postgres create
```

**Option 2: Other providers**
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)
- [Neon](https://neon.tech/)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Inspiration**: [@dan_ddyo on X](https://x.com/dan_ddyo/status/2012521016333947339)
- **Icons**: [Tabler Icons](https://tabler.io/icons)
- **Design System**: Heavily inspired by [Vercel Design](https://vercel.com/design)
- **Database Tooling**: [Prisma](https://www.prisma.io/)

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/AL1L/rate-my-contributor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/AL1L/rate-my-contributor/discussions)
- **Creator**: [AL1L on GitHub](https://github.com/AL1L)

---

<div align="center">

**[⬆ Back to Top](#rate-my-contributor-)**

Made with ❤️ by [AL1L](https://github.com/AL1L)

</div>
---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup and deployment guide
- **[WEBSITE_PLAN.md](WEBSITE_PLAN.md)** - Architecture and feature planning
- **[SECURITY_FIXES.md](SECURITY_FIXES.md)** - Security implementations

## Project Structure

```
rate-my-contributor/
├── src/
│   ├── app/              # Next.js pages and API routes
│   ├── components/       # Reusable React components
│   ├── lib/              # Utilities and configurations
│   └── types/            # TypeScript definitions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── .env.example          # Environment variables template
```

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth (generate with `openssl rand -base64 32`)
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `GITHUB_TOKEN` - (Optional) GitHub personal access token for API

## Development

```bash
# Start development server
npm run dev

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Build for production
npm run build

# Start production server
npm start
```

## Creating an Admin User

After signing in, update your user role in the database:

```sql
UPDATE "User" SET role = 'admin' WHERE username = 'your-username';
```

Or use Prisma Studio:
```bash
npx prisma studio
```

## License

MIT

## Support

For questions or issues, please open an issue on GitHub.
