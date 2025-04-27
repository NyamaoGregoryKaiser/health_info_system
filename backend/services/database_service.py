import logging
from typing import Dict, Any, List, Optional, Tuple, Union
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from contextlib import contextmanager
import sqlite3
import os

logger = logging.getLogger(__name__)

class DatabaseService:
    """Service for handling database connections and operations."""
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the database service.
        
        Args:
            config: Database configuration dictionary containing:
                - db_path: Path to the SQLite database file
                - initialize: Whether to initialize the database if it doesn't exist
        """
        self.logger = logging.getLogger(__name__)
        self.config = config
        self.db_path = config.get('db_path', 'health_system.db')
        self.connection = None
        
        # Initialize database if requested
        if config.get('initialize', True):
            self.initialize_db()
    
    def initialize_db(self) -> None:
        """Initialize the database with required tables if they don't exist."""
        self.logger.info(f"Initializing database at {self.db_path}")
        
        # Ensure directory exists
        db_dir = os.path.dirname(self.db_path)
        if db_dir and not os.path.exists(db_dir):
            os.makedirs(db_dir)
        
        # Connect to database
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Create tables
        try:
            # Users table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT,
                last_name TEXT,
                role TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')
            
            # Patients table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                date_of_birth DATE,
                gender TEXT,
                phone TEXT,
                address TEXT,
                medical_history TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
            ''')
            
            # Doctors table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS doctors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                specialty TEXT,
                license_number TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
            ''')
            
            # Appointments table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER,
                doctor_id INTEGER,
                appointment_date DATETIME,
                status TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients (id),
                FOREIGN KEY (doctor_id) REFERENCES doctors (id)
            )
            ''')
            
            # Medical Records table
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS medical_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER,
                doctor_id INTEGER,
                date DATETIME,
                diagnosis TEXT,
                treatment TEXT,
                prescription TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients (id),
                FOREIGN KEY (doctor_id) REFERENCES doctors (id)
            )
            ''')
            
            conn.commit()
            self.logger.info("Database initialized successfully")
        except Exception as e:
            conn.rollback()
            self.logger.error(f"Error initializing database: {e}")
            raise
        finally:
            cursor.close()
    
    def get_connection(self) -> sqlite3.Connection:
        """
        Get a database connection.
        
        Returns:
            SQLite connection object
        """
        if self.connection is None:
            self.logger.debug(f"Creating new database connection to {self.db_path}")
            self.connection = sqlite3.connect(
                self.db_path,
                detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES
            )
            # Enable foreign keys
            self.connection.execute("PRAGMA foreign_keys = ON")
            # Return rows as dictionaries
            self.connection.row_factory = self._dict_factory
        
        return self.connection
    
    def _dict_factory(self, cursor: sqlite3.Cursor, row: Tuple) -> Dict[str, Any]:
        """
        Factory function to return rows as dictionaries.
        
        Args:
            cursor: SQLite cursor
            row: Database row
            
        Returns:
            Dictionary representation of the row
        """
        return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}
    
    def close(self) -> None:
        """Close the database connection."""
        if self.connection:
            self.logger.debug("Closing database connection")
            self.connection.close()
            self.connection = None
    
    def execute(self, query: str, params: tuple = ()) -> sqlite3.Cursor:
        """
        Execute a query.
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            SQLite cursor
        """
        conn = self.get_connection()
        self.logger.debug(f"Executing query: {query}")
        return conn.execute(query, params)
    
    def execute_and_commit(self, query: str, params: tuple = ()) -> int:
        """
        Execute a query and commit changes.
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            Last row ID
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(query, params)
            conn.commit()
            return cursor.lastrowid
        except Exception as e:
            conn.rollback()
            self.logger.error(f"Error executing query: {e}")
            raise
        finally:
            cursor.close()
    
    def fetch_one(self, query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        """
        Fetch a single row.
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            Row as dictionary or None
        """
        cursor = self.execute(query, params)
        result = cursor.fetchone()
        cursor.close()
        return result
    
    def fetch_all(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """
        Fetch all rows.
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            List of rows as dictionaries
        """
        cursor = self.execute(query, params)
        result = cursor.fetchall()
        cursor.close()
        return result
    
    def insert(self, table: str, data: Dict[str, Any]) -> int:
        """
        Insert a row into a table.
        
        Args:
            table: Table name
            data: Dictionary of column names and values
            
        Returns:
            ID of the inserted row
        """
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['?' for _ in data])
        values = tuple(data.values())
        
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        return self.execute_and_commit(query, values)
    
    def update(self, table: str, data: Dict[str, Any], condition: str, params: tuple = ()) -> int:
        """
        Update rows in a table.
        
        Args:
            table: Table name
            data: Dictionary of column names and values to update
            condition: WHERE clause
            params: Parameters for the WHERE clause
            
        Returns:
            Number of rows affected
        """
        set_clause = ', '.join([f"{key} = ?" for key in data.keys()])
        values = tuple(data.values()) + params
        
        query = f"UPDATE {table} SET {set_clause} WHERE {condition}"
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(query, values)
            conn.commit()
            return cursor.rowcount
        except Exception as e:
            conn.rollback()
            self.logger.error(f"Error updating record: {e}")
            raise
        finally:
            cursor.close()
    
    def delete(self, table: str, condition: str, params: tuple = ()) -> int:
        """
        Delete rows from a table.
        
        Args:
            table: Table name
            condition: WHERE clause
            params: Parameters for the WHERE clause
            
        Returns:
            Number of rows affected
        """
        query = f"DELETE FROM {table} WHERE {condition}"
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(query, params)
            conn.commit()
            return cursor.rowcount
        except Exception as e:
            conn.rollback()
            self.logger.error(f"Error deleting record: {e}")
            raise
        finally:
            cursor.close()
            
    def transaction(self):
        """
        Create a transaction context manager.
        
        Returns:
            Transaction context manager
        """
        return Transaction(self)

    def _build_connection_string(self, db_config: Dict[str, Any]) -> str:
        """
        Build the database connection string from configuration.
        
        Args:
            db_config: Database configuration
            
        Returns:
            Database connection string
            
        Raises:
            ValueError: If required database configuration is missing
        """
        dialect = db_config.get('dialect')
        username = db_config.get('username')
        password = db_config.get('password')
        host = db_config.get('host')
        port = db_config.get('port')
        database = db_config.get('database')
        
        if not all([dialect, database]):
            raise ValueError("Database dialect and database name are required")
        
        # Handle SQLite differently
        if dialect.lower() == 'sqlite':
            return f"sqlite:///{database}"
            
        # Other database types
        if not all([username, host, port]):
            raise ValueError("Username, host, and port are required for database connection")
            
        # Build connection string with password if provided
        if password:
            return f"{dialect}://{username}:{password}@{host}:{port}/{database}"
        else:
            return f"{dialect}://{username}@{host}:{port}/{database}"
    
    @contextmanager
    def session_scope(self) -> Session:
        """
        Provide a transactional scope around a series of operations.
        
        Yields:
            Database session
            
        Raises:
            SQLAlchemyError: If database operations fail
        """
        session = self.Session()
        try:
            yield session
            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Database error: {str(e)}")
            raise
        finally:
            session.close()
    
    def execute_query(self, query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Execute a raw SQL query and return results.
        
        Args:
            query: SQL query string
            params: Query parameters
            
        Returns:
            List of result rows as dictionaries
            
        Raises:
            SQLAlchemyError: If query execution fails
        """
        with self.session_scope() as session:
            result = session.execute(text(query), params or {})
            return [dict(row) for row in result]
    
    def add_record(self, model: Any) -> int:
        """
        Add a record to the database.
        
        Args:
            model: SQLAlchemy model instance
            
        Returns:
            ID of the created record
            
        Raises:
            SQLAlchemyError: If record creation fails
        """
        with self.session_scope() as session:
            session.add(model)
            session.flush()
            return model.id
    
    def update_record(self, model: Any) -> None:
        """
        Update a record in the database.
        
        Args:
            model: SQLAlchemy model instance
            
        Raises:
            SQLAlchemyError: If record update fails
        """
        with self.session_scope() as session:
            session.merge(model)
    
    def delete_record(self, model: Any) -> None:
        """
        Delete a record from the database.
        
        Args:
            model: SQLAlchemy model instance
            
        Raises:
            SQLAlchemyError: If record deletion fails
        """
        with self.session_scope() as session:
            session.delete(model)
    
    def get_by_id(self, model_class: Any, record_id: int) -> Optional[Any]:
        """
        Get a record by its ID.
        
        Args:
            model_class: SQLAlchemy model class
            record_id: ID of the record
            
        Returns:
            Record if found, None otherwise
            
        Raises:
            SQLAlchemyError: If query fails
        """
        with self.session_scope() as session:
            return session.query(model_class).get(record_id)
    
    def get_all(self, model_class: Any, limit: Optional[int] = None, offset: Optional[int] = None) -> List[Any]:
        """
        Get all records of a model.
        
        Args:
            model_class: SQLAlchemy model class
            limit: Optional limit of records to return
            offset: Optional offset
            
        Returns:
            List of records
            
        Raises:
            SQLAlchemyError: If query fails
        """
        with self.session_scope() as session:
            query = session.query(model_class)
            
            if offset is not None:
                query = query.offset(offset)
                
            if limit is not None:
                query = query.limit(limit)
                
            return query.all()
    
    def count(self, model_class: Any) -> int:
        """
        Count records of a model.
        
        Args:
            model_class: SQLAlchemy model class
            
        Returns:
            Number of records
            
        Raises:
            SQLAlchemyError: If query fails
        """
        with self.session_scope() as session:
            return session.query(model_class).count()
    
    def filter(self, model_class: Any, **filters) -> List[Any]:
        """
        Filter records of a model.
        
        Args:
            model_class: SQLAlchemy model class
            **filters: Filter criteria
            
        Returns:
            List of filtered records
            
        Raises:
            SQLAlchemyError: If query fails
        """
        with self.session_scope() as session:
            return session.query(model_class).filter_by(**filters).all()
    
    def execute_transaction(self, callback, *args, **kwargs) -> Any:
        """
        Execute a callback function within a transaction.
        
        Args:
            callback: Function to execute
            *args: Arguments for the callback
            **kwargs: Keyword arguments for the callback
            
        Returns:
            Result of the callback
            
        Raises:
            Exception: If callback execution fails
        """
        with self.session_scope() as session:
            return callback(session, *args, **kwargs) 