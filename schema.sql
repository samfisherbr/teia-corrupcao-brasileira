-- TABELA DE NÓS (Entidades)
CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  type TEXT CHECK(type IN ('politician', 'party', 'scheme', 'company')),
  party TEXT,
  image_url TEXT,
  summary TEXT
);

-- TABELA DE CONEXÕES (Links)
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  relation TEXT NOT NULL,
  status TEXT CHECK(status IN ('confirmed', 'under_investigation', 'acquitted')),
  amount TEXT,
  year INTEGER,
  source_url TEXT,
  FOREIGN KEY (source) REFERENCES nodes(id),
  FOREIGN KEY (target) REFERENCES nodes(id)
);

-- DADOS INICIAIS (ESQUEMA DOS SANGUESSUGAS)
INSERT INTO nodes (id, label, type, party, image_url, summary) VALUES
('esquema_sanguessugas', 'Operação Sanguessuga (Máfia das Ambulâncias)', 'scheme', 'N/A', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982', 'Esquema criminoso articulado entre empresários e parlamentares para superfaturar ambulâncias.'),
('emp_planam', 'Grupo Planam (Planam Comércio e Representação Ltda.)', 'company', 'N/A', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab', 'Empresa que liderava o consórcio de firmas de fachada para vencer licitações direcionadas.'),
('emp_luiz_vedoin', 'Luiz Antônio Trevisan Vedoin', 'company', 'N/A', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', 'Empresário mentor e operador financeiro do esquema de propinas.'),
('pol_lino_rossi', 'Lino Rossi', 'politician', 'PP', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', 'Deputado cooptador de emendas orçamentárias.'),
('pol_nilton_capixaba', 'Nilton Balbino (Nilton Capixaba)', 'politician', 'PTB', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7', 'Parlamentar condenado pelo STF a pena de reclusão.');

INSERT INTO links (source, target, relation, status, amount, year, source_url) VALUES
('emp_luiz_vedoin', 'esquema_sanguessugas', 'Réu confesso e operador financeiro', 'confirmed', 'R$ 110.000.000', 2001, 'https://www.congressoemfoco.com.br/noticia/62450/juiz-condena-mentores-da-mafia-dos-sanguessugas'),
('pol_lino_rossi', 'esquema_sanguessugas', 'Intermediação e emendas superfaturadas', 'confirmed', 'R$ 3.040.000', 2000, 'https://www1.folha.uol.com.br/folha/brasil/ult96u81266.shtml');
