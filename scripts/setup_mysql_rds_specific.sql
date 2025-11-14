-- Script para configurar o banco MySQL específico no AWS RDS
-- Execute este script no banco: master-project-courses.cyd6a20so0aq.us-east-1.rds.amazonaws.com

USE master;

-- Criar tabela de cursos
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255) NOT NULL,
  price VARCHAR(50) NOT NULL,
  original_price VARCHAR(50),
  rating DECIMAL(3,2) DEFAULT 0.00,
  students_count INT DEFAULT 0,
  total_duration VARCHAR(50),
  level ENUM('Iniciante', 'Intermediário', 'Avançado') DEFAULT 'Iniciante',
  image_url VARCHAR(500),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de aulas
CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  vimeo_id VARCHAR(50) NOT NULL,
  vimeo_url VARCHAR(500),
  lesson_order INT NOT NULL,
  duration VARCHAR(20),
  is_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Inserir cursos de exemplo
INSERT INTO courses (title, description, instructor, price, original_price, rating, students_count, total_duration, level, image_url, category) VALUES
('Gestão de Projetos Completo', 'Aprenda metodologias ágeis e tradicionais de gestão de projetos', 'Carlos Silva', 'R$ 197,00', 'R$ 297,00', 4.8, 1250, '12h 30min', 'Intermediário', '/project-management-course.png', 'Negócios'),
('Excel Avançado para Negócios', 'Domine fórmulas avançadas, tabelas dinâmicas e automação', 'Ana Santos', 'R$ 147,00', 'R$ 247,00', 4.9, 2100, '8h 45min', 'Avançado', '/excel-advanced-business-course.jpg', 'Produtividade'),
('Power BI - Dashboard Profissional', 'Crie dashboards interativos e relatórios profissionais', 'Roberto Lima', 'R$ 167,00', 'R$ 267,00', 4.7, 890, '10h 15min', 'Intermediário', '/power-bi-dashboard-course.jpg', 'Análise de Dados'),
('Liderança e Gestão de Equipes', 'Desenvolva habilidades de liderança e gestão de pessoas', 'Mariana Costa', 'R$ 177,00', 'R$ 277,00', 4.6, 1450, '9h 20min', 'Intermediário', '/leadership-team-management.png', 'Liderança'),
('Marketing Digital Estratégico', 'Estratégias completas de marketing digital e growth hacking', 'Pedro Oliveira', 'R$ 187,00', 'R$ 287,00', 4.8, 1680, '11h 10min', 'Intermediário', '/digital-marketing-strategy-course.jpg', 'Marketing'),
('Finanças Empresariais', 'Gestão financeira, análise de investimentos e planejamento', 'Lucia Ferreira', 'R$ 157,00', 'R$ 257,00', 4.5, 920, '7h 55min', 'Avançado', '/business-finance-course.jpg', 'Finanças'),
('Automação de Processos', 'Automatize processos empresariais com ferramentas no-code', 'João Mendes', 'R$ 137,00', 'R$ 237,00', 4.7, 1120, '6h 40min', 'Iniciante', '/business-process-automation-course.jpg', 'Automação'),
('Vendas e Negociação', 'Técnicas avançadas de vendas e negociação empresarial', 'Rafael Torres', 'R$ 167,00', 'R$ 267,00', 4.9, 1890, '9h 30min', 'Intermediário', '/sales-negotiation-course.jpg', 'Vendas');

-- Inserir algumas aulas de exemplo para o primeiro curso
INSERT INTO lessons (course_id, title, description, vimeo_id, lesson_order, duration, is_preview) VALUES
(1, 'Introdução à Gestão de Projetos', 'Conceitos fundamentais e metodologias', '123456789', 1, '25min', TRUE),
(1, 'Metodologias Ágeis - Scrum', 'Implementando Scrum em projetos', '123456790', 2, '35min', FALSE),
(1, 'Planejamento e Cronograma', 'Como criar cronogramas eficientes', '123456791', 3, '40min', FALSE),
(1, 'Gestão de Riscos', 'Identificação e mitigação de riscos', '123456792', 4, '30min', FALSE);
