-- MySQL migration script for Afya Yetu Health Information System
-- For use with WAMP Server's phpMyAdmin or MySQL command line
-- This script assumes database 'afya_yetu_health_system' already exists

USE afya_yetu_health_system;

-- Sample data for auth_user (Django's built-in user model)
-- Password is 'password123' (hashed)
INSERT INTO auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined)
VALUES
(1, 'pbkdf2_sha256$600000$wq0K5Z3k9eYYcWfA2bMwjn$ElF5CBsy6P4k6+iWe/8eQO7aTPpzzAJca5tIL7QGxg8=', NOW(), 1, 'admin', 'System', 'Administrator', 'admin@afyayetu.org', 1, 1, NOW()),
(2, 'pbkdf2_sha256$600000$LnzuCyUldPxRqx9cDEofn4$Pd0cWHgkqXKwvZE1wkhte0vCsj5hL/lAVF9yzqQ3UtA=', NOW(), 0, 'receptionist', 'Jane', 'Doe', 'jane.doe@afyayetu.org', 1, 1, NOW()),
(3, 'pbkdf2_sha256$600000$8mFgLk3YHtdIcgmURUwFNW$xnF1Ne13YuhmgqCq79WbzQnelth5/qSmwxJP9f8wYGM=', NOW(), 0, 'nurse1', 'John', 'Smith', 'john.smith@afyayetu.org', 1, 1, NOW()),
(4, 'pbkdf2_sha256$600000$tVgRhdJ0QlJVJBHQnkZbQI$BgU0FMIUTtKO99nM/EgbX5RHqBTc9AWTYd1FY41d1AQ=', NOW(), 0, 'officermanager', 'Mary', 'Johnson', 'mary.johnson@afyayetu.org', 1, 1, NOW());

-- Create sample groups
INSERT INTO auth_group (id, name)
VALUES
(1, 'Administrators'),
(2, 'Health Officers'),
(3, 'Data Entry');

-- Create some permissions relationships
INSERT INTO auth_user_groups (id, user_id, group_id)
VALUES
(1, 1, 1),  -- admin in Administrators
(2, 2, 3),  -- receptionist in Data Entry
(3, 3, 2),  -- nurse1 in Health Officers
(4, 4, 2);  -- officermanager in Health Officers

-- Sample Program Categories
INSERT INTO health_programs_programcategory (id, name, description)
VALUES
(1, 'Maternal Health', 'Programs focused on the health and wellbeing of mothers during pregnancy, childbirth and postpartum'),
(2, 'Child Health', 'Programs dedicated to the health and development of children from infancy through adolescence'),
(3, 'Non-Communicable Diseases', 'Programs targeting chronic conditions such as diabetes, hypertension, and cancer'),
(4, 'Infectious Diseases', 'Programs for prevention and treatment of communicable diseases'),
(5, 'Mental Health', 'Programs supporting mental and emotional wellbeing');

-- Sample Health Programs
INSERT INTO health_programs_healthprogram (id, name, description, code, start_date, end_date, eligibility_criteria, capacity, location, category_id, created_at, updated_at)
VALUES
(1, 'Maternal Nutrition Initiative', 'Program to improve nutrition for pregnant and lactating mothers', 'MNI-001', '2023-01-01', '2024-12-31', 'Pregnant women and those with children under 2 years', 500, 'Countrywide', 1, NOW(), NOW()),
(2, 'Childhood Immunization Program', 'Comprehensive vaccination program for children', 'CIP-002', '2023-01-15', '2024-12-31', 'Children under 5 years', 1000, 'All counties', 2, NOW(), NOW()),
(3, 'Diabetes Management', 'Support and management for diabetes patients', 'DMG-003', '2023-02-01', '2025-01-31', 'Diagnosed diabetes patients of all ages', 300, 'Urban centers', 3, NOW(), NOW()),
(4, 'HIV/AIDS Support Program', 'Comprehensive care for HIV/AIDS patients', 'HIV-004', '2023-01-01', NULL, 'HIV positive individuals', 800, 'Countrywide', 4, NOW(), NOW()),
(5, 'Adolescent Mental Health', 'Mental health support for teenagers and young adults', 'AMH-005', '2023-03-15', '2024-12-31', 'Individuals 13-24 years old', 250, 'Selected counties', 5, NOW(), NOW()),
(6, 'Malaria Prevention Initiative', 'Prevention and early treatment of malaria', 'MPI-006', '2023-04-01', '2025-03-31', 'Residents of malaria-prone areas', 1500, 'Western and Coastal regions', 4, NOW(), NOW()),
(7, 'Hypertension Screening', 'Early detection and management of hypertension', 'HYP-007', '2023-05-01', '2024-04-30', 'Adults over 35 years', 600, 'Urban centers', 3, NOW(), NOW()),
(8, 'Community Mental Health', 'Mental health awareness and support at community level', 'CMH-008', '2023-06-01', '2025-05-31', 'All community members', 400, 'Selected counties', 5, NOW(), NOW());

-- Sample Clients 
-- Note: For WAMP/phpMyAdmin, we'll use actual UUID strings instead of the MySQL UUID_TO_BIN function

-- This is a simplified SQL script for Afya Yetu with sample data
-- Note: When using with phpMyAdmin in WAMP, you should:
-- 1. First run migrations with 'python manage.py migrate'
-- 2. Then import this script to add sample data
-- 3. The script assumes Django has already created all the tables 