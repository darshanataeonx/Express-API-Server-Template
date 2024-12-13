-- Table definations

CREATE TABLE tenants(
	id INT AUTO_INCREMENT PRIMARY KEY,
	tenant_name VARCHAR(255) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users_roles(
	id INT AUTO_INCREMENT PRIMARY KEY,
	`name` VARCHAR(255) NOT NULL,
	tenant_id INT,
	description TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE app_features(
	id INT AUTO_INCREMENT PRIMARY KEY,
	feature_key VARCHAR(255) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE roles_permissions(
	id INT AUTO_INCREMENT PRIMARY KEY,
	role_id INT,
	feature_id INT,
	write_access BOOLEAN DEFAULT FALSE,
	read_access BOOLEAN DEFAULT FALSE,
	edit_access BOOLEAN DEFAULT FALSE,
	delete_access BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (role_id) REFERENCES users_roles(id) ON DELETE SET NULL ON UPDATE CASCADE,
	FOREIGN KEY (feature_id) REFERENCES app_features(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE users(
	id INT AUTO_INCREMENT PRIMARY KEY,
	tenant_id INT,
	username VARCHAR(255) NOT NULL,
	role_id INT,
	auth_token TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL ON UPDATE CASCADE,
	FOREIGN KEY (role_id) REFERENCES users_roles(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- create a trigger that add the record to roles_permissions table when a new role is created and new feature is added to the app.
CREATE TRIGGER add_role_permission_trigger
AFTER INSERT ON users_roles
FOR EACH ROW
INSERT INTO roles_permissions (role_id, feature_id)
SELECT NEW.id, (SELECT id FROM app_features WHERE feature_key = 'users');

CREATE TRIGGER add_feature_permission_trigger 
AFTER INSERT ON app_features
FOR EACH ROW
INSERT INTO roles_permissions (role_id, feature_id)
SELECT id, NEW.id
FROM users_roles;


-- Delete trigger for users_roles table
CREATE TRIGGER delete_role_permission_trigger
BEFORE DELETE ON users_roles
FOR EACH ROW
DELETE FROM roles_permissions 
WHERE role_id = OLD.id;

-- Delete trigger for app_features table  
CREATE TRIGGER delete_feature_permission_trigger
BEFORE DELETE ON app_features
FOR EACH ROW
DELETE FROM roles_permissions
WHERE feature_id = OLD.id;

-- Insert records into tenants table
INSERT INTO tenants (tenant_name) VALUES ('Acme Corp'),('TechStart'),('DataFlow'),('CloudNine'),('SecureNet');

-- Insert records into users_roles table
INSERT INTO users_roles (name, tenant_id) VALUES
('Admin', 1),
('Manager', 1),
('Developer', 2),
('Analyst', 3),
('Support', 5);

-- Insert records into app_features table
INSERT INTO app_features (feature_key) VALUES
('users'),
('reports'),
('analytics'),
('settings'),
('dashboard');

-- Insert records into roles_permissions table
-- Note: Additional records will be created by triggers
INSERT INTO roles_permissions (role_id, feature_id, write_access, read_access, edit_access, delete_access) VALUES
(1, 1, true, true, true, true),
(1, 2, true, true, true, true),
(2, 1, true, true, false, false),
(2, 2, true, true, false, false),
(3, 3, true, true, true, false);

-- Insert records into users table
INSERT INTO users (tenant_id, username, role_id, auth_token) VALUES
(1, 'john.admin', 1, 'token123'),
(2, 'mary.manager', 2, 'token456'),
(3, 'dave.dev', 3, 'token789'),
(4, 'sara.analyst', 4, 'tokenabc'),
(5, 'tom.support', 5, 'tokenxyz');

