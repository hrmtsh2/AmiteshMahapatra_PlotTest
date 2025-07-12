# CSV Data Plotter - Full-Stack Web Application
Full-stack web app to load and plot .csv files with numeric data.
Demo project for internship at SBI Lab IIT Delhi.

[Demonstration video link](https://www.loom.com/share/de249463061140078a28719fe60ac365?sid=16754c8c-f5e9-41ca-b437-b5e10e7affb6)

## Process overview
Configuration files (.config, .env, .env.local) have been provided separately via email for evaluation.
1. **Set up PostgreSQL database** (see Database Setup section below)
2. **Clone and install dependencies** (see Installation section below)
3. **Place the provided configuration files** in their respective directories
   - `.config` and `.env` in the `backend/` directory
   - `.env.local` in the `frontend/` directory
4. **Run the applications** using the commands in the Installation section
5. **Access the app** at http://localhost:3000

## Database Setup
### Install PostgreSQL (skip if already present)
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql` or download from official site
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`
### Create Database
```sql
-- Connect to PostgreSQL
-- Default user is often 'postgres', but may be your system username
psql -U postgres
# OR
psql -U your_username
-- Create database
CREATE DATABASE sbilab_db;
-- Exit psql
\q
```
**Note**: I used the interactive GUI of pgAdmin4 for this purpose, so the psql method is untested on my end. Kindly feel free to complete those steps using any tool of your choosing.

### Update database configuration
```bash
# Edit the provided backend/.env file with your PostgreSQL credentials:
# Option 1: Using default postgres user
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sbilab_db"
# Option 2: Using your system username
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/sbilab_db"
```

## Installation
### 1. Clone the repository
```bash
git clone https://github.com/hrmtsh2/AmiteshMahapatra_PlotTest.git
cd AmiteshMahapatra_PlotTest
```
### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend
# Create virtual environment
python -m venv venv
# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
# Install dependencies
python -m pip install -r requirements.txt
# Generate Prisma client
python -m prisma generate
# Push database schema
python -m prisma db push
# Start the backend server
python -m uvicorn main:app --reload --port 4040
```
### 3. Frontend Setup
```bash
# Navigate to frontend directory (in new terminal)
cd frontend
# Install dependencies
npm install
# Start the development server
npm run dev
```

## Usage
### 1. Access the Application
- Open http://localhost:3000 in your browser.
- If not logged in, you'll be redirected to Auth0 login page.
### 2. Authentication
- **Login**: Enter credentials for existing account.
- **Sign Up**: Create a new account (first-time users)
- After authentication, you'll be redirected to the main application.
### 3. Upload and Plot CSV Data
- **Upload OR Load Saved**: Click "Choose File" or drag and drop a CSV file OR click "Load Saved CSV" to use previously saved configurations.
- **Select Axes**: Choose columns to set as X and Y axes from the detected numeric columns.
- **Configure**: Use data controls to:
  - Choose number of rows of .csv file considered
  - Set custom X/Y axis ranges
### 4. Save Configurations
- Click "Save CSV Configuration" to store:
  - CSV file content
  - Column selections
  - Range settings
  - TExt description
- This configurations is saved in the database for future use
### 5. Manage Saved Files
- View all saved CSV files in the "Load Saved CSV" dialog.
- Delete unwanted configurations by pressing red bin icon.

## CSV File Requirements
- **Header Row**: First row must contain column names.
- **Numeric Columns**: At least 2 numeric columns are required for plotting.

## API Endpoints
### Authentication
- `GET /login` - Redirect to Auth0 login
- `GET /signup` - Redirect to Auth0 signup
- `GET /logout` - Logout and clear session
- `GET /callback` - Auth0 callback handler
- `GET /api/auth/status` - Check authentication status
### CSV Management
- `POST /api/csv/save-csv` - Save CSV file with configuration
- `GET /api/csv/csv-files` - Get user's saved CSV files
- `GET /api/csv/csv-file/{id}` - Get specific CSV file
- `PUT /api/csv/csv-file/{id}` - Update CSV configuration
- `DELETE /api/csv/csv-file/{id}` - Delete CSV file

Please reach out to amiteshm0101@gmail.com to receive the required files to setup and run the entire web app.