# Netlify Deployment Guide for HoneyRoute

## ✅ Version Compatibility Validation

Your current setup is **compatible** for Netlify deployment:

| Package           | Version | Status                                      |
| ----------------- | ------- | ------------------------------------------- |
| **React**         | 19.1.0  | ✅ Required for react-leaflet v5            |
| **react-leaflet** | 5.0.0   | ✅ Requires React 19+                       |
| **leaflet**       | 1.9.4   | ✅ Stable, compatible with react-leaflet v5 |
| **Next.js**       | 15.5.3  | ✅ Latest stable                            |
| **Node.js**       | 20      | ✅ Configured in netlify.toml               |

## 🔧 Netlify Configuration

The `netlify.toml` file has been configured with:

1. **Build Settings**:
   - Base directory: `.` (monorepo root)
   - Build command: `cd frontend && pnpm install && pnpm build`
   - Publish directory: `frontend/.next` (handled by Netlify plugin)

2. **Environment Variables**:
   - `NODE_VERSION=20`
   - `PNPM_VERSION=9.7.0`
   - `ENABLE_PNPM=true`
   - `NPM_FLAGS=--legacy-peer-deps` (handles React 19 peer dependency issues)
   - `NODE_ENV=production`

3. **Netlify Next.js Plugin**:
   - `@netlify/plugin-nextjs` (auto-installed by Netlify)
   - Handles Next.js 15 routing and serverless functions

4. **Caching Headers**:
   - Leaflet assets cached for 1 year
   - Next.js static assets cached for 1 year

## 📋 Next.js Configuration

The `frontend/next.config.mjs` includes:

1. **Leaflet Transpilation**:
   - `transpilePackages: ['leaflet', 'react-leaflet']` - Required for Next.js 15

2. **Webpack Configuration**:
   - Client-side fallbacks for Node.js modules (fs, etc.)

3. **PWA Configuration**:
   - Service worker only in production
   - Offline fallback support

## 🗺️ Map Component Setup

The map component is correctly configured:

1. **Dynamic Import with SSR Disabled**:

   ```tsx
   const MapClient = dynamic(() => import('./MapClient'), { ssr: false });
   ```

   - Prevents server-side rendering issues
   - Ensures Leaflet only runs in the browser

2. **CSS Import**:
   - `leaflet/dist/leaflet.css` imported in both `layout.tsx` and `MapClient.tsx`

3. **Icon Configuration**:
   - Custom Leaflet icons configured in `leaflet.setup.ts`
   - Icons available in `public/leaflet/` directory

## 🚀 Deployment Steps

1. **Commit the changes**:

   ```bash
   git add netlify.toml frontend/next.config.mjs
   git commit -m "fix: configure Netlify for Next.js 15 and Leaflet compatibility"
   git push
   ```

2. **In Netlify Dashboard**:
   - Go to Site settings → Build & deploy
   - Verify build command: `cd frontend && pnpm install && pnpm build`
   - Verify publish directory: `frontend/.next`
   - Ensure Node.js version is set to 20

3. **Environment Variables** (if needed):
   - Add any required environment variables in Netlify dashboard
   - Example: `NEXT_PUBLIC_API_URL`, etc.

4. **Important**: Netlify will automatically install `@netlify/plugin-nextjs` during build.

## ⚠️ Troubleshooting

If the map still doesn't render after deployment:

1. **Check Build Logs**:
   - Look for errors related to Leaflet or react-leaflet
   - Verify all dependencies installed correctly

2. **Check Browser Console**:
   - Open DevTools → Console
   - Look for errors like "window is not defined" or missing CSS

3. **Verify Assets**:
   - Check Network tab for Leaflet CSS and icon files
   - Ensure `/leaflet/*` assets are loading correctly

4. **Clear Cache**:
   - Clear Netlify build cache
   - Clear browser cache

5. **Check Map Container**:
   - Verify the map container has explicit height/width
   - Check for CSS conflicts hiding the map

## 📝 Version Recommendations

**Current versions are correct and recommended:**

- ✅ **DO NOT downgrade** React to 18 (react-leaflet v5 requires React 19)
- ✅ **DO NOT downgrade** react-leaflet to v4 (you're on React 19)
- ✅ **Leaflet 1.9.4** is the latest stable version

If you encounter peer dependency warnings during build, they should be handled by `NPM_FLAGS=--legacy-peer-deps` in the Netlify configuration.

## 🔗 Resources

- [Netlify Next.js Plugin Docs](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [React-Leaflet v5 Docs](https://react-leaflet.js.org/)
- [Leaflet Docs](https://leafletjs.com/)
