-- =====================================================
-- GymRerun App - Schema para Supabase PostgreSQL
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  reset_token TEXT,
  reset_token_expires_at BIGINT,
  created_at BIGINT NOT NULL,
  last_login BIGINT NOT NULL,
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  coins INT DEFAULT 0
);

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at BIGINT NOT NULL
);

-- Índice para limpiar sesiones expiradas
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Tabla de estadísticas de usuario
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_gyms INT DEFAULT 0,
  total_hooh_runs INT DEFAULT 0,
  total_time_ms BIGINT DEFAULT 0,
  streak_current INT DEFAULT 0,
  streak_best INT DEFAULT 0,
  achievements JSONB DEFAULT '[]'
);

-- Tabla de configuraciones de usuario
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}',
  cooldowns JSONB DEFAULT '{}'
);

-- Tabla de historial de usuario
CREATE TABLE IF NOT EXISTS user_history (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  gym_history JSONB DEFAULT '[]',
  hooh_history JSONB DEFAULT '[]',
  run_history JSONB DEFAULT '[]'
);

-- Tabla de tareas diarias
CREATE TABLE IF NOT EXISTS user_daily (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tasks_state JSONB
);

-- Tabla de progresión
CREATE TABLE IF NOT EXISTS user_progression (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}'
);

-- Tabla de cooldowns (usada por el endpoint separado)
CREATE TABLE IF NOT EXISTS user_cooldowns (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}'
);

-- Deshabilitar RLS (usamos service_role key server-side)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progression DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_cooldowns DISABLE ROW LEVEL SECURITY;
