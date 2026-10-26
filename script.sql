CREATE DATABASE IF NOT EXISTS senai;

USE senai;

CREATE TABLE IF NOT EXISTS produtos (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nome VARCHAR(100) NOT NULL,
   quantidade INT,
   preco DECIMAL(10,2),
   estoque_min INT,
   foto VARCHAR(255),
   descricao TEXT
);

INSERT INTO produtos (nome, quantidade, preco, estoque_min, foto, descricao) VALUES 
('Trenas', 15, 25, 2, 'https://cdn.awsli.com.br/1012/1012749/produto/69795133/c29db09490.jpg', 'Trena métrica de 5 metros Vonder'),
('Parafuso', 500, 1, 50, 'https://images.cws.digital/produtos/gg/22/20/parafuso-sextavado-zincado-316-x-50-10072022-1670520383817.jpg', 'Parafuso Philips 4x40mm para madeira'),
('Alicates', 12, 45, 3, 'https://santil.jetassets.com.br/produto/1624594Alicate-Universal-1050-109266474551.jpg', 'Alicate universal isolado 8 polegadas'),
('Chave de Fenda', 20, 18, 4, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOmoNhmnjJwAefCAFvnVlRjxcMWCckAvsjLhmwbA_1fhcal-lJ01zw0Q7Y&s=10', 'Chave de fenda ponta imantada 1/4x6');

CREATE TABLE IF NOT EXISTS usuarios (
   id INT PRIMARY KEY AUTO_INCREMENT, 
   nome VARCHAR(100) NOT NULL UNIQUE, 
   senha VARCHAR(255) NOT NULL, 
   permissao VARCHAR(50)
);

-- Usuário 'gaby' com senha '12345678' criptografada via bcrypt (VARCHAR aumentado para 255 para evitar cortes no hash)
INSERT INTO usuarios (nome, senha, permissao) VALUES
('isis', '$2a$12$mfouVfRcW81OeE.OYBw5quBbXwH.2M8A9dkV6KoKvvph0xlRx55Au', 'admin');

INSERT INTO usuarios (nome, senha, permissao) VALUES
('gaby', '$2a$12$SL7RLpnMCwncvgq66kkx0u3lbdiZssDN.Ys/V1sZBprxwhUuiB.ye', 'admin');