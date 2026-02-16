# Download Instructions for Prince Portfolio Website

## Option 1: Download via Emergent Platform (Recommended)

Use the **"Download Code"** button in the Emergent chat interface to download the complete project as a ZIP file.

---

## Option 2: Using SCP (Secure Copy)

If you have SSH access to a server where this is deployed:

```bash
# From your local machine
scp -r user@server:/path/to/app ./prince-portfolio
```

---

## Option 3: Using the Archive

A compressed archive has been created at `/tmp/prince-portfolio.tar.gz`

### To extract on your local machine:

```bash
# Create a directory for the project
mkdir prince-portfolio
cd prince-portfolio

# Extract the archive
tar -xzvf prince-portfolio.tar.gz
```

---

## After Download: Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies

```bash
cd frontend
yarn install  # or npm install
```

### 3. Configure Environment Variables

**Backend (`backend/.env`):**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=prince_portfolio
```

**Frontend (`frontend/.env`):**
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 4. Run the Application

**Start Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Start Frontend (in a new terminal):**
```bash
cd frontend
yarn start  # or npm start
```

The website will be available at `http://localhost:3000`

---

## Project Structure

```
prince-portfolio/
├── backend/           # FastAPI backend server
│   ├── server.py      # Main API server
│   ├── services/      # Google Scholar scraping service
│   └── requirements.txt
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── mockData.js  # Site content (edit this!)
│   │   └── App.js
│   └── package.json
├── local-deployment/  # Deployment scripts & configs
└── *.md               # Documentation files
```

## Key File to Edit

**`frontend/src/mockData.js`** - This file contains all your website content. Edit this file to update:
- Profile information
- News items
- Teaching content
- Research projects
- Lab members
- Contact information

See `CONTENT_UPDATE_GUIDE.md` for detailed instructions.
