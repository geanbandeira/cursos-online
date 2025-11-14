-- Criar tabelas no AWS RDS
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  price VARCHAR(50),
  original_price VARCHAR(50),
  rating DECIMAL(2,1),
  students_count INTEGER,
  total_duration VARCHAR(50),
  level VARCHAR(50),
  image_url VARCHAR(500),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  duration VARCHAR(50),
  order_index INTEGER,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir cursos no AWS RDS
INSERT INTO courses (
  title, description, instructor, price, original_price, rating, 
  students_count, total_duration, level, image_url, category, is_active
) VALUES 
(
  'Venda e Negociação Teste',
  'Domine as técnicas avançadas de vendas e negociação para aumentar seus resultados e fechar mais negócios.',
  'Carlos Silva',
  'R$ 197,00',
  'R$ 397,00',
  4.8,
  2847,
  '8h 30min',
  'Intermediário',
  '/sales-negotiation-course.jpg',
  'Vendas',
  true
),
(
  'Gestão de Projetos Completa',
  'Aprenda metodologias ágeis e tradicionais para gerenciar projetos de forma eficiente e entregar resultados excepcionais.',
  'Ana Costa',
  'R$ 247,00',
  'R$ 497,00',
  4.9,
  3521,
  '12h 15min',
  'Intermediário',
  '/project-management-course.png',
  'Gestão',
  true
),
(
  'Excel Avançado para Negócios',
  'Transforme-se em um especialista em Excel com fórmulas avançadas, dashboards e automação para o mundo corporativo.',
  'Roberto Santos',
  'R$ 167,00',
  'R$ 297,00',
  4.7,
  4892,
  '10h 45min',
  'Avançado',
  '/excel-advanced-business-course.jpg',
  'Produtividade',
  true
),
(
  'Power BI - Dashboards Profissionais',
  'Crie dashboards interativos e relatórios profissionais com Power BI para tomada de decisões baseada em dados.',
  'Mariana Oliveira',
  'R$ 217,00',
  'R$ 417,00',
  4.8,
  2156,
  '9h 20min',
  'Intermediário',
  '/power-bi-dashboard-course.jpg',
  'Análise de Dados',
  true
),
(
  'Liderança e Gestão de Equipes',
  'Desenvolva habilidades de liderança e aprenda a motivar, engajar e conduzir equipes de alta performance.',
  'Fernando Lima',
  'R$ 197,00',
  'R$ 347,00',
  4.9,
  1834,
  '7h 50min',
  'Intermediário',
  '/leadership-team-management.png',
  'Liderança',
  true
),
(
  'Marketing Digital Estratégico',
  'Domine as principais estratégias de marketing digital para aumentar vendas e construir uma marca forte online.',
  'Juliana Ferreira',
  'R$ 227,00',
  'R$ 427,00',
  4.6,
  3967,
  '11h 30min',
  'Intermediário',
  '/digital-marketing-strategy-course.jpg',
  'Marketing',
  true
),
(
  'Finanças Empresariais',
  'Aprenda a analisar demonstrações financeiras, fazer projeções e tomar decisões financeiras estratégicas.',
  'Paulo Mendes',
  'R$ 267,00',
  'R$ 497,00',
  4.8,
  1523,
  '13h 15min',
  'Avançado',
  '/business-finance-course.jpg',
  'Finanças',
  true
),
(
  'Automação de Processos',
  'Otimize processos empresariais com automação, reduzindo custos e aumentando a eficiência operacional.',
  'Luciana Torres',
  'R$ 187,00',
  'R$ 337,00',
  4.7,
  2689,
  '8h 45min',
  'Intermediário',
  '/business-process-automation-course.jpg',
  'Processos',
  true
);
