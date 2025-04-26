# Afya Yetu Health Information System

A comprehensive system for managing health programs and beneficiaries through Afya Yetu. This system helps track clients, health programs, and enrollments to facilitate better health service delivery.

## Features

- **Client Management**: Register, update, and track beneficiaries of health programs
- **Health Programs**: Create and manage various health programs with categories
- **Enrollment Tracking**: Enroll clients in health programs and track their status
- **Dashboard**: View analytics and statistics on program performance and client distribution
- **REST API**: Modern API for integration with other systems

## Technology Stack

### Backend
- Django (Python web framework)
- Django REST Framework (API)
- MySQL Database (via WAMP Server)

### Frontend
- React (JavaScript library)
- Material-UI (Component library)
- Chart.js (Data visualization)
- Axios (HTTP client)

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn
- WAMP Server (with MySQL)

### Backend Setup

1. Make sure WAMP Server is installed and running with MySQL service active

2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Create a virtual environment and activate it:
   ```
   # On Windows:
   python -m venv venv
   venv\Scripts\activate
   ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
   
   **Note**: If you encounter issues with `mysqlclient` installation on Windows:
   - Download the appropriate MySQL Connector wheel file from https://www.lfd.uci.edu/~gohlke/pythonlibs/#mysqlclient
   - Install it using: `pip install C:\path\to\downloaded\wheel\file.whl`

5. Set up MySQL Database using WAMP:
   
   Run the setup script:
   ```
   python setup_mysql.py
   ```
   
   This will:
   - Create the MySQL database in your WAMP installation
   - Update the Django settings with your WAMP MySQL credentials
   - Apply Django migrations
   - Optionally load sample data
   - Optionally create a superuser
   
   **Alternative**: You can also set up the database manually using phpMyAdmin:
   - Open phpMyAdmin from your WAMP dashboard
   - Create a new database named `afya_yetu_health_system`
   - Update settings.py with your database credentials
   - Run migrations with `python manage.py migrate`

6. Start the development server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   # or if using yarn
   yarn install
   ```

3. Start the development server:
   ```
   npm start
   # or if using yarn
   yarn start
   ```

## Development

### Backend Development
- API documentation is available at `/swagger/` when the backend server is running
- Admin interface is available at `/admin/`
- The system uses MySQL via WAMP for data storage

### Frontend Development
- The React development server will be available at `http://localhost:3000`
- The proxy is configured to forward API requests to the Django backend

## Sample Users

If you choose to load the sample data, the system will include these predefined users for testing:

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | Administrator |
| receptionist | password123 | Data Entry |
| nurse1 | password123 | Health Officer |
| officermanager | password123 | Health Officer |

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Nyamao Gregory Kaiser