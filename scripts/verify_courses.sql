-- Script para verificar todos os cursos no banco
SELECT id, title, description, price, image_url, created_at 
FROM courses 
ORDER BY created_at DESC;
