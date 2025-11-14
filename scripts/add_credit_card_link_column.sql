-- Adicionar coluna para link de cartão de crédito na tabela courses
ALTER TABLE courses 
ADD COLUMN credit_card_link TEXT;

-- Comentário explicativo
COMMENT ON COLUMN courses.credit_card_link IS 'Link para pagamento via cartão de crédito';
