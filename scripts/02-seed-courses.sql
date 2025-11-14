-- Inserção dos cursos atuais da Master Project
-- Baseado nos cursos já exibidos na interface

INSERT INTO courses (title, description, instructor, price, original_price, rating, students_count, total_duration, level, image_url, category) VALUES
('Gestão de Projetos Completa', 'Metodologias ágeis, ferramentas de gestão e técnicas avançadas para liderar projetos de sucesso do início ao fim.', 'Carlos Silva', 199.90, 299.90, 4.8, 2847, '12h 30min', 'Iniciante', '/project-management-course.png', 'Gestão'),

('Excel Avançado para Negócios', 'Domine fórmulas complexas, tabelas dinâmicas, macros e automação para análise de dados empresariais.', 'Ana Santos', 149.90, 249.90, 4.9, 3521, '15h 45min', 'Avançado', '/excel-advanced-business-course.jpg', 'Produtividade'),

('Power BI - Dashboards Profissionais', 'Crie dashboards interativos, relatórios dinâmicos e visualizações de dados para tomada de decisões estratégicas.', 'Roberto Lima', 179.90, 279.90, 4.7, 1923, '18h 20min', 'Avançado', '/power-bi-dashboard-course.jpg', 'Análise de Dados'),

('Liderança e Gestão de Equipes', 'Desenvolva habilidades de liderança, comunicação eficaz e técnicas para motivar e gerenciar equipes de alta performance.', 'Mariana Costa', 169.90, 269.90, 4.8, 2156, '10h 15min', 'Intermediário', '/leadership-team-management.png', 'Liderança'),

('Marketing Digital Estratégico', 'Estratégias completas de marketing digital, SEO, redes sociais e campanhas pagas para alavancar seu negócio online.', 'Pedro Oliveira', 189.90, 289.90, 4.6, 4312, '22h 10min', 'Intermediário', '/digital-marketing-strategy-course.jpg', 'Marketing'),

('Finanças Empresariais', 'Controle financeiro, fluxo de caixa, análise de investimentos e planejamento financeiro para empresas de todos os portes.', 'Juliana Ferreira', 199.90, 299.90, 4.9, 1687, '14h 30min', 'Avançado', '/business-finance-course.jpg', 'Finanças'),

('Automação de Processos', 'Otimize processos empresariais com automação, RPA e ferramentas de produtividade para aumentar a eficiência operacional.', 'Lucas Mendes', 219.90, 319.90, 4.7, 2034, '16h 45min', 'Avançado', '/business-process-automation-course.jpg', 'Automação'),

('Vendas e Negociação', 'Técnicas avançadas de vendas, negociação, relacionamento com clientes e fechamento de negócios de alto valor.', 'Fernanda Rocha', 159.90, 259.90, 4.8, 3245, '13h 20min', 'Intermediário', '/sales-negotiation-course.jpg', 'Vendas');
