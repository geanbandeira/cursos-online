-- Script completo para configurar MySQL no AWS RDS
-- Criar banco de dados (se necessário)
CREATE DATABASE IF NOT EXISTS marketplace_courses;
USE marketplace_courses;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0.00,
  students_count INT DEFAULT 0,
  total_duration VARCHAR(50),
  level ENUM('Iniciante', 'Intermediário', 'Avançado') DEFAULT 'Iniciante',
  image_url TEXT,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de aulas
CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  vimeo_id VARCHAR(50) NOT NULL,
  vimeo_url TEXT,
  lesson_order INT NOT NULL,
  duration VARCHAR(20),
  is_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Tabela de matrículas
CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  progress DECIMAL(5,2) DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (user_id, course_id)
);

-- Inserir cursos de exemplo
INSERT INTO courses (title, description, instructor, price, original_price, rating, students_count, total_duration, level, image_url, category) VALUES
('Gestão de Projetos Completa', 'Aprenda metodologias ágeis, Scrum, Kanban e ferramentas essenciais para gerenciar projetos com eficiência e entregar resultados excepcionais.', 'Carlos Silva', 199.90, 299.90, 4.8, 2847, '12h 30min', 'Intermediário', '/project-management-course.png', 'Gestão'),

('Excel Avançado para Negócios', 'Domine fórmulas complexas, tabelas dinâmicas, macros e automação para transformar dados em insights estratégicos para sua empresa.', 'Ana Costa', 149.90, 249.90, 4.9, 3521, '8h 45min', 'Avançado', '/excel-advanced-business-course.jpg', 'Produtividade'),

('Power BI - Dashboard Profissional', 'Crie dashboards interativos e relatórios dinâmicos que impressionam. Conecte dados, visualize tendências e tome decisões baseadas em dados.', 'Roberto Lima', 179.90, 279.90, 4.7, 1892, '10h 15min', 'Intermediário', '/power-bi-dashboard-course.jpg', 'Análise de Dados'),

('Liderança e Gestão de Equipes', 'Desenvolva habilidades de liderança, comunicação eficaz, gestão de conflitos e motivação de equipes para alcançar resultados extraordinários.', 'Marina Santos', 229.90, 349.90, 4.9, 2156, '15h 20min', 'Avançado', '/leadership-team-management.png', 'Liderança'),

('Marketing Digital Estratégico', 'Estratégias completas de marketing digital: SEO, Google Ads, redes sociais, email marketing e análise de métricas para crescer seu negócio.', 'Pedro Oliveira', 189.90, 289.90, 4.6, 4231, '14h 10min', 'Intermediário', '/digital-marketing-strategy-course.jpg', 'Marketing'),

('Finanças Empresariais Práticas', 'Controle financeiro, fluxo de caixa, análise de investimentos, planejamento orçamentário e indicadores financeiros essenciais.', 'Juliana Ferreira', 169.90, 259.90, 4.8, 1674, '9h 35min', 'Intermediário', '/business-finance-course.jpg', 'Finanças'),

('Automação de Processos', 'Otimize operações empresariais com automação inteligente. Mapeamento de processos, ferramentas no-code e implementação prática.', 'Lucas Mendes', 199.90, 299.90, 4.7, 987, '11h 25min', 'Avançado', '/business-process-automation-course.jpg', 'Automação'),

('Vendas e Negociação', 'Técnicas avançadas de vendas, negociação estratégica, relacionamento com clientes e fechamento de negócios de alto valor.', 'Fernanda Rocha', 159.90, 239.90, 4.9, 3456, '13h 50min', 'Intermediário', '/sales-negotiation-course.jpg', 'Vendas');

-- Inserir aulas de exemplo para alguns cursos
INSERT INTO lessons (course_id, title, description, vimeo_id, lesson_order, duration, is_preview) VALUES
-- Aulas do curso de Gestão de Projetos (id: 1)
(1, 'Introdução à Gestão de Projetos', 'Conceitos fundamentais e importância da gestão de projetos', '123456789', 1, '25min', TRUE),
(1, 'Metodologias Ágeis', 'Scrum, Kanban e outras metodologias ágeis', '123456790', 2, '35min', FALSE),
(1, 'Ferramentas de Gestão', 'Principais ferramentas para gerenciar projetos', '123456791', 3, '30min', FALSE),

-- Aulas do curso de Excel Avançado (id: 2)
(2, 'Fórmulas Avançadas', 'PROCV, ÍNDICE, CORRESP e outras fórmulas', '123456792', 1, '40min', TRUE),
(2, 'Tabelas Dinâmicas', 'Criando e personalizando tabelas dinâmicas', '123456793', 2, '45min', FALSE),
(2, 'Macros e VBA', 'Automatizando tarefas com macros', '123456794', 3, '50min', FALSE);
