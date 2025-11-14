-- Atualizar o nome do curso de "Vendas e Negociação" para "Venda e Negociação Teste"
UPDATE courses 
SET title = 'Venda e Negociação Teste'
WHERE title = 'Vendas e Negociação';

-- Verificar se a atualização funcionou
SELECT id, title FROM courses WHERE title LIKE '%Negociação%';
