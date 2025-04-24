# Kenya Health Information System

A comprehensive system for managing health programs and beneficiaries in Kenya. This system helps track clients, health programs, and enrollments to facilitate better health service delivery.

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
- SQLite (Development) / PostgreSQL (Production)

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

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```
   # On Windows:
   python -m venv venv
   venv\Scripts\activate
   
   # On macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
   
   **Note for Windows users**: If you plan to use PostgreSQL later and encounter issues with `psycopg2-binary`, you can:
   - Edit the requirements.txt file to uncomment the appropriate line
   - Install PostgreSQL and make sure its bin directory is in your PATH
   - Or simply use SQLite for development (default configuration)

4. Run migrations:
   ```
   python manage.py migrate
   ```

5. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

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
- By default, the system uses SQLite for development. For PostgreSQL, edit the settings.py file

### Frontend Development
- The React development server will be available at `http://localhost:3000`
- The proxy is configured to forward API requests to the Django backend

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Nyamao Gregory Kaiser