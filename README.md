# Wild Dogs Hockey Club

Full-stack web application for managing an inline hockey club in Bogotá, Colombia.

## 🏒 Features

- **Player Management**: Registration, profiles, and document management
- **Category System**: Age-based divisions (Sub 8, 12, 14, 16, 18, Mayores)
- **Tournament Tracking**: Match schedules, results, and standings
- **Payment System**: Fees tracking and payment history
- **News & Gallery**: Club updates and photo galleries
- **Admin Dashboard**: Complete administrative control panel

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express, Node.js
- **Database**: InstantDB (real-time database with authentication)
- **Auth**: InstantDB Authentication
- **Deployment**: Netlify

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/wilddogs-hockey.git
cd wilddogs-hockey
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your InstantDB App ID:
```
VITE_INSTANT_APP_ID=27acc1e8-fce9-4800-a9cd-c769cea6844f
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 🔧 Configuration

### InstantDB Setup

This application uses InstantDB for real-time database and authentication.

**App ID**: `27acc1e8-fce9-4800-a9cd-c769cea6844f`

To view and manage your InstantDB app:
1. Go to [instantdb.com/dash](https://www.instantdb.com/dash)
2. Select the "WildDogs" app
3. Configure authentication providers
4. Manage schema and permissions

### Environment Variables

Required environment variables:

- `VITE_INSTANT_APP_ID`: Your InstantDB application ID

## 📱 Deployment to Netlify

### Option 1: Deploy from GitHub (Recommended)

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/public`
6. Add environment variables:
   - `VITE_INSTANT_APP_ID`: `27acc1e8-fce9-4800-a9cd-c769cea6844f`
7. Click "Deploy site"

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## 🏗️ Project Structure

```
wilddogs-hockey/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilities and config
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   └── routes.ts        # API routes
├── shared/              # Shared types and schema
└── netlify.toml         # Netlify configuration
```

## 🔒 Authentication

Authentication is handled by InstantDB. Users can sign in using:
- Email/Password
- Google OAuth
- Magic links

Configure authentication providers in the InstantDB dashboard.

## 👥 User Roles

- **Admin**: Full system access
- **Coach**: Manage team rosters and schedules
- **Player**: View profile, payments, and documents
- **Guardian**: Same as player (for minors)

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - TypeScript type checking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact

Wild Dogs Hockey Club - Bogotá, Colombia

Project Link: [https://github.com/YOUR_USERNAME/wilddogs-hockey](https://github.com/YOUR_USERNAME/wilddogs-hockey)
