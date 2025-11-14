-- Criação das tabelas para o sistema de cursos Master Project
-- Conectando ao PostgreSQL da AWS

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    rating DECIMAL(3,2) DEFAULT 0,
    students_count INTEGER DEFAULT 0,
    total_duration VARCHAR(50), -- ex: "15h 30min"
    level VARCHAR(50) NOT NULL, -- Iniciante, Intermediário, Avançado
    image_url TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de aulas/vídeos
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    vimeo_id VARCHAR(50) NOT NULL, -- ID do vídeo no Vimeo
    vimeo_url TEXT, -- URL completa do vídeo (opcional)
    lesson_order INTEGER NOT NULL, -- ordem da aula no curso
    duration VARCHAR(20), -- ex: "12min 30s"
    is_preview BOOLEAN DEFAULT false, -- se é aula gratuita/preview
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários (para futuro sistema de autenticação)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de matrículas
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    progress DECIMAL(5,2) DEFAULT 0, -- percentual de conclusão
    UNIQUE(user_id, course_id)
);

-- Tabela de progresso das aulas
CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    watched_duration INTEGER DEFAULT 0, -- segundos assistidos
    completed_at TIMESTAMP NULL,
    UNIQUE(user_id, lesson_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, lesson_order);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
