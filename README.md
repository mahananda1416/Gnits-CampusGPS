# Complete Setup Guide for GNITS Campus Navigation

## Step-by-Step Installation in VS Code

### Prerequisites
Make sure you have installed:
- **Node.js** (v18 or higher) - Download from https://nodejs.org/
- **VS Code** - Download from https://code.visualstudio.com/

### Step 1: Create Project Directory

1. Open VS Code
2. Open Terminal (View → Terminal or `` Ctrl+` ``)
3. Navigate to where you want to create the project:
```bash
cd Desktop  # or wherever you want
```

### Step 2: Create the Project Structure

Create the folder structure:
```bash
mkdir gnits-campus-nav
cd gnits-campus-nav
mkdir public src
mkdir src/assets
```

### Step 3: Copy All Files

Copy the following files I provided into their respective locations:

#### Root Directory Files:
- `package.json`
- `vite.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `eslint.config.js`
- `index.html`
- `.gitignore`
- `README.md`

#### src/ Directory Files:
- `src/main.jsx`
- `src/App.jsx`
- `src/App.css`
- `src/index.css`
- `src/CampusNavigator.jsx`

### Step 4: Install Dependencies

In VS Code terminal, run:
```bash
npm install
```

This will install:
- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)
- All other dependencies

**Wait for installation to complete** (this may take 2-3 minutes)

### Step 5: Run the Application

Start the development server:
```bash
npm run dev
```

You should see output like:
```
  VITE v5.4.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 6: Open in Browser

1. Hold `Ctrl` and click on `http://localhost:5173/`
2. Or manually open your browser and go to `http://localhost:5173/`

## Troubleshooting

### Issue 1: "npm: command not found"
**Solution**: Install Node.js from https://nodejs.org/ and restart VS Code

### Issue 2: Port 5173 already in use
**Solution**: The terminal will suggest another port, use that one

### Issue 3: Tailwind styles not loading
**Solution**: 
```bash
npm install -D tailwindcss postcss autoprefixer
```

### Issue 4: Module not found errors
**Solution**: Delete node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

## File Checklist

Make sure you have all these files:

```
✓ package.json
✓ vite.config.js
✓ tailwind.config.js
✓ postcss.config.js
✓ eslint.config.js
✓ index.html
✓ .gitignore
✓ README.md
✓ src/main.jsx
✓ src/App.jsx
✓ src/App.css
✓ src/index.css
✓ src/CampusNavigator.jsx
```

## Testing the Application

1. **Select Starting Room**: 
   - Type "CL1" in the starting point search
   - Click on the result to select

2. **Select Destination**:
   - Use dropdown to select any room (e.g., "IT F3")

3. **Click "Find Shortest Path"**

4. **Verify Results**:
   - You should see route summary with distance and time
   - Turn-by-turn navigation steps
   - Floor plan visualizations

## Making Changes

### To modify room data:
Edit `src/CampusNavigator.jsx` → Look for `ROOM_DATABASE` constant

### To change colors:
Edit `tailwind.config.js` or use Tailwind utility classes

### To add new blocks:
Add entries to `ROOM_DATABASE` and `BLOCK_CONNECTIONS` in `CampusNavigator.jsx`

## Building for Production

When ready to deploy:

```bash
npm run build
```

This creates a `dist/` folder with optimized files that can be hosted on any web server.

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```



---


