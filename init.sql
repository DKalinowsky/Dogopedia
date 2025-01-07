USE dogopedia;

CREATE TABLE USER (
    user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    customer_nickname CHAR(50) NOT NULL,
    pass_hash CHAR(128) NOT NULL,
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
    comm_type ENUM('forum', 'care', 'entertainment') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USER(user_id),
    FOREIGN KEY (dog_id) REFERENCES DOGS(dog_id)
);


-- Insert example data
INSERT INTO USER (customer_nickname, pass_hash, email_addr, is_banned, role)
VALUES ('Administrator', 'abe31fe1a2113e7e8bf174164515802806d388cf4f394cceace7341a182271ab', 'admin@dogopedia.com', FALSE, 'admin');

INSERT INTO DOGS (race, size, category, traits, allergies, age, description, cost_range, activity)
VALUES
('Maltese', 'Small', 'Toy', 'Affectionate, Playful', 'None', '5 years', 'Very loving and energetic. A great companion dog.', '$$$', 'medium'),
('Golden Retriever', 'Large', 'Sporting', 'Friendly, Intelligent, Loyal', 'None', '3 years', 'Golden Retrievers are great family dogs, loyal and easy to train.', '$$$$', 'high'),
('Beagle', 'Medium', 'Hound', 'Curious, Friendly, Merry', 'None', '4 years', 'Beagles are known for their adorable appearance and excellent scenting ability.', '$$', 'medium'),
('Poodle', 'Medium', 'Non-sporting', 'Active, Intelligent, Proud', 'None', '2 years', 'Poodles are highly trainable, hypoallergenic, and social.', '$$$$', 'high'),
('Bulldog', 'Medium', 'Non-sporting', 'Courageous, Loyal, Friendly', 'None', '6 years', 'Bulldogs are known for their calm demeanor and loyalty, making them great pets for apartment living.', '$$', 'low'),
('German Shepherd', 'Large', 'Herding', 'Loyal, Courageous, Obedient', 'None', '5 years', 'German Shepherds are highly intelligent and versatile, often used in working roles such as police and military work.', '$$$$', 'high'),
('Cocker Spaniel', 'Medium', 'Sporting', 'Affectionate, Playful, Good with kids', 'None', '4 years', 'Cocker Spaniels are friendly and make excellent family pets. They are also known for their beautiful coats.', '$$$', 'medium'),
('Dachshund', 'Small', 'Hound', 'Curious, Daring, Independent', 'None', '3 years', 'Dachshunds are friendly and brave despite their small size, originally bred for hunting.', '$$', 'low'),
('Chihuahua', 'Small', 'Toy', 'Loyal, Alert, Confident', 'None', '2 years', 'Chihuahuas are known for their big personality and loyalty to their owners. They are also very alert and protective.', '$$', 'medium'),
('Rottweiler', 'Large', 'Working', 'Loyal, Confident, Protective', 'None', '4 years', 'Rottweilers are strong, confident dogs that are known for their protective nature.', '$$$$', 'high'),
('Boxer', 'Medium', 'Working', 'Energetic, Loyal, Playful', 'None', '3 years', 'Boxers are known for their playful nature and loyalty to their family.', '$$$', 'high'),
('Yorkshire Terrier', 'Small', 'Toy', 'Affectionate, Feisty, Brave', 'None', '5 years', 'Yorkshire Terriers are small but full of personality, known for being great companions.', '$$', 'medium'),
('Pomeranian', 'Small', 'Toy', 'Spirited, Friendly, Lively', 'None', '3 years', 'Pomeranians are playful and full of energy, they make great pets for people with active lifestyles.', '$$', 'medium'),
('Shih Tzu', 'Small', 'Toy', 'Affectionate, Friendly, Outgoing', 'None', '4 years', 'Shih Tzus are great for small apartments and are known for their loving nature.', '$$$', 'low'),
('Siberian Husky', 'Large', 'Working', 'Friendly, Energetic, Independent', 'None', '3 years', 'Siberian Huskies are strong and independent, originally bred for pulling sleds in the cold Arctic.', '$$$$', 'high'),
('Dogo Argentino', 'Large', 'Working', 'Courageous, Loyal, Protective', 'None', '5 years', 'Dogo Argentinos are known for their bravery and loyalty. They make great guard dogs.', '$$$$', 'high'),
('French Bulldog', 'Small', 'Non-sporting', 'Affectionate, Playful, Intelligent', 'None', '4 years', 'French Bulldogs are easygoing and adapt well to city life, making them perfect companions for apartment dwellers.', '$$', 'low'),
('Saint Bernard', 'Large', 'Working', 'Friendly, Intelligent, Gentle', 'None', '6 years', 'Saint Bernards are known for their gentle nature, originally bred for rescue work in the Swiss Alps.', '$$$$', 'low'),
('Australian Shepherd', 'Medium', 'Herding', 'Intelligent, Energetic, Loyal', 'None', '2 years', 'Australian Shepherds are highly intelligent and thrive in an active environment with a lot of mental and physical stimulation.', '$$$$', 'high'),
('Chow Chow', 'Medium', 'Non-sporting', 'Loyal, Independent, Aloof', 'None', '4 years', 'Chow Chows are known for their lion-like appearance and independent nature, making them excellent guard dogs.', '$$$$', 'low'),
('Border Collie', 'Medium', 'Herding', 'Energetic, Intelligent, Agile', 'None', '2 years', 'Border Collies are extremely intelligent and excel in agility and obedience tasks.', '$$$$', 'high'),
('Mastiff', 'Large', 'Working', 'Loyal, Protective, Gentle', 'None', '5 years', 'Mastiffs are known for their size and strength but are incredibly gentle with family members.', '$$$$', 'low'),
('Schnauzer', 'Medium', 'Working', 'Friendly, Loyal, Alert', 'None', '4 years', 'Schnauzers are known for their distinctive appearance and protective, yet affectionate, nature.', '$$', 'medium'),
('Akita', 'Large', 'Working', 'Loyal, Brave, Strong', 'None', '5 years', 'Akitas are strong, loyal dogs that make excellent protectors and are very dedicated to their families.', '$$$$', 'high'),
('Cavalier King Charles Spaniel', 'Small', 'Toy', 'Affectionate, Gentle, Playful', 'None', '3 years', 'Cavalier King Charles Spaniels are known for their gentle and loving nature, making them ideal companions for families.', '$$$', 'medium'),
('Pug', 'Small', 'Toy', 'Charming, Friendly, Mischievous', 'None', '4 years', 'Pugs are known for their adorable appearance and entertaining personality, making them great family pets.', '$$', 'medium'),
('Great Dane', 'Large', 'Working', 'Gentle, Friendly, Loyal', 'None', '6 years', 'Great Danes are known for their size and gentle nature. They are great with children and families.', '$$$$', 'low'),
('Jack Russell Terrier', 'Small', 'Terrier', 'Energetic, Intelligent, Bold', 'None', '3 years', 'Jack Russells are lively and intelligent dogs that need plenty of exercise to stay happy.', '$$', 'high'),
('Havanese', 'Small', 'Toy', 'Friendly, Affectionate, Outgoing', 'None', '2 years', 'Havanese are great companions and known for their cheerful, friendly nature.', '$$', 'medium'),
('Basset Hound', 'Medium', 'Hound', 'Loyal, Independent, Playful', 'None', '4 years', 'Basset Hounds are gentle, friendly dogs with a strong scenting ability, originally bred for hunting.', '$$', 'low'),
('Samoyed', 'Large', 'Working', 'Friendly, Gentle, Playful', 'None', '3 years', 'Samoyeds are known for their fluffy white coats and friendly personalities, making them great family dogs.', '$$$$', 'high'),
('Tibetan Mastiff', 'Large', 'Working', 'Loyal, Protective, Independent', 'None', '5 years', 'Tibetan Mastiffs are known for their independent nature and their strength, originally bred as guard dogs.', '$$$$', 'low');


INSERT INTO COMMENTS (user_id, dog_id, comm_text, comm_type)
VALUES (1, 1, 'Great dog!', 'forum');
