# Music Library Application with Micro-Frontend Architecture

## 📌 Deliverables

### 🌐 Live Demo Links
- **Main Application**: [https://gleeful-meringue-48137e.netlify.app/](https://gleeful-meringue-48137e.netlify.app/)
- **Music Library Micro-Frontend**: [https://microfrontendmusic.netlify.app/](https://microfrontendmusic.netlify.app/)

## 🚀 Getting Started

### 🔧 How to Run Locally

#### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- Git

#### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone [your-repository-url]
   cd final-assignment
Run the Music Library Micro-Frontend

bash
cd music-library-mf
npm install
npm run dev
Access at: http://localhost:5174

Run the Main Application

bash
cd ../main-app
npm install
npm run dev
Access at: http://localhost:5173

🛠️ Deployment
Music Library Micro-Frontend Deployment
Build the project:

bash
cd music-library-mf
npm run build
Deploy to Netlify:

bash
npx netlify deploy --prod --dir=dist
Main Application Deployment
Build the project:

bash
cd main-app
npm run build
Deploy to Netlify:

bash
npx netlify deploy --prod --dir=dist


🔐 Demo Credentials
#Role	Email               	Password	                          Permissions
Admin	admin@musicapp.com	SecureAdmin@123	             Full access (add/edit/delete songs)
User	user@musicapp.com  	MusicLover@456	             View-only access




Music Library Application Architecture
1. Micro-Frontend Structure
Main Application (Host Container)
Serves as the entry point for the entire application.

Manages authentication (login/logout) and user roles.

Dynamically loads the Music Library micro-frontend.

Controls the layout (header, navigation, etc.).

Music Library (Micro-Frontend)
A standalone app that handles all music-related features.

Exposes its UI components to the Main App via Module Federation.

Receives the user’s role (admin/user) from the Main App.

Renders different features based on permissions (e.g., admin can add/delete songs).

2. Module Federation Integration
How the Apps Connect
Music Library "Exposes" Its Components

Configured in vite.config.js:

javascript
exposes: {
  './MusicLibrary': './src/MusicLibrary.jsx'
}
This allows the Main App to dynamically import it.

Main App "Consumes" the Music Library

Uses lazy loading to fetch the micro-frontend only when needed:

javascript
const MusicLibrary = lazy(() => import('musicLibrary/MusicLibrary'));
Shared Dependencies

Both apps use the same React version to avoid duplication:

javascript
shared: ['react', 'react-dom']
3. Role-Based Authentication Flow
Step-by-Step Login Process
User Logs In

Enters email & password (e.g., admin@musicapp.com / SecureAdmin@123).

The app checks credentials against a predefined list.

Role is Stored

If login succeeds, the user’s role (admin/user) is saved in:

React Context (for real-time UI updates).

LocalStorage (to persist login after refresh).

Music Library Receives the Role

The Main App passes the role as a prop:

jsx
<MusicLibrary userRole={authState.role} />
The Music Library adjusts its UI (shows/hides admin features).

4. Deployment Strategy
Independent Deployment
Music Library deploys first (must be live before Main App).

Main App points to the Music Library’s production URL:

javascript
remotes: {
  musicLibrary: 'https://microfrontendmusic.netlify.app/assets/remoteEntry.js'
}
Network & Security
CORS Headers ensure cross-origin requests work.

Assets are cached for faster loading.



