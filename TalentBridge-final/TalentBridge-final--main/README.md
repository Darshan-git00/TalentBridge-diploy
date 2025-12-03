# TalentBridge

A modern platform connecting talent with opportunities through AI-powered interviews and smart matching algorithms.

## Project info

**URL**: https://lovable.dev/projects/9f33c347-7ecb-4584-9802-c12711f14153

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9f33c347-7ecb-4584-9802-c12711f14153) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Deploying to Vercel

You can deploy TalentBridge to Vercel directly from your GitHub repository.

#### Prerequisites
- GitHub repository with the TalentBridge code
- Vercel account (free tier is sufficient)

#### Required Environment Variables
Set these environment variables in your Vercel project settings:

```bash
VITE_API_URL=""           # API base URL (leave empty for mock data mode)
VITE_AUTH_SECRET=""       # Authentication secret for JWT tokens
VITE_ENV="production"     # Environment (development/staging/production)
```

#### Deployment Steps

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Node.js Version**: `18.x` or higher

3. **Set Environment Variables**
   - Go to project settings → Environment Variables
   - Add the required variables listed above
   - Make sure to include `VITE_` prefix for all variables

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application
   - You'll get a live URL once deployment is complete

#### Local Testing
```sh
# Build for production
npm run build

# Preview production build locally
npm run preview
```

#### Notes
- The application will work with mock data even if `VITE_API_URL` is empty
- No serverless configuration required - Vite React apps work out of the box
- All routing is handled client-side with React Router

### Lovable Deployment

Simply open [Lovable](https://lovable.dev/projects/9f33c347-7ecb-4584-9802-c12711f14153) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
