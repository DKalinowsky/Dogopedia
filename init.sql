CREATE DATABASE IF NOT EXISTS dogopedia;
CREATE USER 'dog_user'@'%' IDENTIFIED BY 'dog';
GRANT ALL PRIVILEGES ON dogopedia.* TO 'dog_user'@'%';
FLUSH PRIVILEGES;

USE dogopedia;

CREATE TABLE USER (
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    customer_nickname CHAR(50) NOT NULL,
    pass_hash CHAR(50) NOT NULL,
    email_addr CHAR(50) NOT NULL,
    is_banned BOOLEAN DEFAULT FALSE,
    role ENUM('user', 'admin') NOT NULL
);

CREATE TABLE DOGS (
    dog_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    race CHAR(50) NOT NULL,
    size CHAR(50) NOT NULL,
    category VARCHAR(255),
    traits TEXT,
    allergies CHAR(255),
    age CHAR(50) NOT NULL,
    description TEXT,
    cost_range CHAR(50) NOT NULL,
    activity ENUM('low', 'medium', 'high') NOT NULL,
    image BLOB
);

CREATE TABLE LIKED (
    user_id INT NOT NULL,
    dog_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USER(user_id),
    FOREIGN KEY (dog_id) REFERENCES DOGS(dog_id)
);

CREATE TABLE COMMENTS (
    comm_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    dog_id INT NOT NULL,
    comm_text VARCHAR(255) NOT NULL,
    comm_type ENUM('positive', 'neutral', 'negative') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USER(user_id),
    FOREIGN KEY (dog_id) REFERENCES DOGS(dog_id)
);

CREATE TABLE REPORTS (
    report_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    comm_id INT NOT NULL,
    report_reason TEXT NOT NULL,
    status CHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comm_id) REFERENCES COMMENTS(comm_id)
);

-- Insert example data
INSERT INTO USER (customer_nickname, pass_hash, email_addr, is_banned, role)
VALUES ('JohnDoe', 'hashedpassword', 'john@example.com', FALSE, 'user');

INSERT INTO DOGS (race, size, allergies, age, description, cost_range, activity)
VALUES ('Golden Retriever', 'Large', 'None', '3 years', 'Friendly and playful', '$$', 'medium');

INSERT INTO COMMENTS (user_id, dog_id, comm_text, comm_type)
VALUES (1, 1, 'Great dog!', 'positive');
