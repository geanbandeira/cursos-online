-- Adicionar colunas para links de pagamento na tabela courses
ALTER TABLE courses 
ADD COLUMN pix_link TEXT,
ADD COLUMN boleto_link TEXT;

-- Comentários para documentar as colunas
COMMENT ON COLUMN courses.pix_link IS 'Link para pagamento via PIX do curso';
COMMENT ON COLUMN courses.boleto_link IS 'Link para pagamento via boleto bancário do curso';
