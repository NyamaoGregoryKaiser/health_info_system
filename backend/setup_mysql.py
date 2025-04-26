#!/usr/bin/env python
"""
Initialize the MySQL database for Afya Yetu Health System using WAMP Server
"""

import os
import sys
import django
import importlib
import MySQLdb
import subprocess
import warnings
from django.core import management

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'health_system.settings')
django.setup()

def setup_mysql_db():
    """Create the MySQL database and user for WAMP Server"""
    try:
        # Connect to MySQL server as root (WAMP default is usually root with no password)
        print("Connecting to MySQL server on WAMP...")
        print("Default WAMP MySQL username is usually 'root' with empty password")
        username = input("Enter MySQL username [root]: ") or "root"
        password = input("Enter MySQL password [leave empty for none]: ")
        
        conn = MySQLdb.connect(
            host="localhost",
            user=username,
            passwd=password,
            port=3306  # Default WAMP MySQL port
        )
        cursor = conn.cursor()
        
        print("Creating database...")
        cursor.execute("CREATE DATABASE IF NOT EXISTS afya_yetu_health_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        
        # With WAMP, we'll grant privileges to the root user for simplicity
        # Or create a new user if requested
        create_new_user = input("Do you want to create a dedicated database user? (y/n) [n]: ").lower() == 'y'
        
        if create_new_user:
            db_user = input("Enter new database username [healthuser]: ") or "healthuser"
            db_pass = input("Enter new database password [healthpass]: ") or "healthpass"
            
            # Create user if it doesn't exist
            try:
                cursor.execute(f"CREATE USER '{db_user}'@'localhost' IDENTIFIED BY '{db_pass}'")
                cursor.execute(f"GRANT ALL PRIVILEGES ON afya_yetu_health_system.* TO '{db_user}'@'localhost'")
                
                # Update settings.py with the new user
                update_settings(db_user, db_pass)
            except Exception as e:
                print(f"Warning: Couldn't create new user: {e}")
                print("Continuing with root user...")
                update_settings(username, password)
        else:
            # Update settings.py with root user
            update_settings(username, password)
        
        cursor.execute("FLUSH PRIVILEGES")
        conn.close()
        print("Database setup completed successfully.")
        return True
    except Exception as e:
        print(f"Error setting up MySQL database: {e}")
        return False

def update_settings(username, password):
    """Update Django settings.py with the correct database credentials"""
    try:
        settings_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'health_system', 'settings.py')
        with open(settings_path, 'r') as file:
            settings_content = file.read()
        
        # Replace database user and password
        import re
        settings_content = re.sub(r"'USER': '.*?'", f"'USER': '{username}'", settings_content)
        settings_content = re.sub(r"'PASSWORD': '.*?'", f"'PASSWORD': '{password}'", settings_content)
        
        with open(settings_path, 'w') as file:
            file.write(settings_content)
        
        print("Database settings updated successfully.")
    except Exception as e:
        print(f"Warning: Unable to update settings.py: {e}")
        print("You may need to manually update database credentials in settings.py")

def apply_migrations():
    """Apply Django migrations to set up the schema"""
    try:
        print("Applying migrations to MySQL database...")
        management.call_command('migrate')
        print("Migrations applied successfully.")
        return True
    except Exception as e:
        print(f"Error applying migrations: {e}")
        print("Make sure your WAMP server is running and MySQL service is started.")
        return False

def load_sample_data_via_python():
    """Load sample data using Python scripts"""
    try:
        print("Loading sample data...")
        
        # Run the users creation script
        print("\nCreating sample users...")
        try:
            # Import and run the create_users module
            from create_users import create_users
            create_users()
        except Exception as e:
            print(f"Error creating users: {e}")
            
        # Run the health programs creation script
        print("\nCreating sample health programs...")
        try:
            # Import and run the create_programs module
            from create_programs import create_programs
            create_programs()
        except Exception as e:
            print(f"Error creating health programs: {e}")
            
        print("\nSample data loaded successfully.")
        return True
    except Exception as e:
        print(f"Error loading sample data: {e}")
        return False

def create_superuser():
    """Create a Django superuser"""
    try:
        print("\nCreating superuser...")
        management.call_command(
            'createsuperuser',
            interactive=True
        )
        return True
    except Exception as e:
        print(f"Error creating superuser: {e}")
        return False

def main():
    """Main setup process"""
    print("=== Afya Yetu Health System - MySQL Setup for WAMP ===")
    print("Make sure your WAMP server is running with MySQL service active")
    
    # Suppress MySQL warnings
    warnings.filterwarnings("ignore", category=MySQLdb.Warning)
    
    # Step 1: Set up MySQL database and user
    if not setup_mysql_db():
        return
        
    # Step 2: Apply migrations
    if not apply_migrations():
        return
        
    # Step 3: Load sample data (optional)
    print("\nDo you want to load sample data? (y/n): ")
    if input().lower() == 'y':
        load_sample_data_via_python()
    
    # Step 4: Create superuser (optional)
    print("\nDo you want to create a superuser? (y/n): ")
    if input().lower() == 'y':
        create_superuser()
        
    print("\nSetup completed successfully!")
    print("You can now start using the MySQL database with your application.")
    print("Run 'python manage.py runserver' to start the development server.")

if __name__ == "__main__":
    main() 