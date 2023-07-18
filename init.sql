CREATE TABLE clients (
    id varchar(255),
    name varchar(255),
    email varchar(255),
    created_at date
);

CREATE TABLE accounts (
    id varchar(255),
    client_id varchar(255),
    balance int,
    created_at date
);

CREATE TABLE transactions (
    id varchar(255),
    account_id_from varchar(255),
    account_id_to varchar(255),
    amount int,
    created_at date
);

CREATE TABLE balances (
    id varchar(255),
    account_id varchar(255) PRIMARY KEY,
    amount int,
    created_at date
);

INSERT INTO
    clients (id, name, email, created_at)
VALUES
    (
        '1',
        'João Silva',
        'joao.silva@gmail.com',
        '2023-07-15'
    ),
    (
        '2',
        'Maria Souza',
        'maria.souza@hotmail.com',
        '2023-07-16'
    ),
    (
        '3',
        'José Santos',
        'jose.santos@yahoo.com',
        '2023-07-17'
    ),
    (
        '4',
        'Ana Oliveira',
        'ana.oliveira@gmail.com',
        '2023-07-18'
    );


INSERT INTO
    accounts (id, client_id, balance, created_at)
VALUES
    ('1', '1', 1000, '2023-07-15'),
    ('2', '2', 5000, '2023-07-16'),
    ('3', '3', 2000, '2023-07-17'),
    ('4', '4', 3000, '2023-07-18');

INSERT INTO
    transactions (
        id,
        account_id_from,
        account_id_to,
        amount,
        created_at
    )
VALUES
    ('1', '1', '2', 500, '2023-07-15'),
    ('2', '2', '3', 1000, '2023-07-16'),
    ('3', '3', '4', 1500, '2023-07-17'),
    ('4', '4', '1', 2000, '2023-07-18');


INSERT INTO
    balances (id, account_id, amount, created_at)
VALUES
    ('1', '1', 500, '2023-07-15'),
    ('2', '2', 5500, '2023-07-16'),
    ('3', '3', 3000, '2023-07-17'),
    ('4', '4', 4500, '2023-07-18');