-- Migration para corrigir a foreign key entre resolucoes e profiles
-- Adiciona coluna created_by_profile que referencia profiles(id) ao invés de auth.users(id)

-- 1. Adicionar nova coluna created_by_profile
ALTER TABLE resolucoes 
ADD COLUMN IF NOT EXISTS created_by_profile UUID REFERENCES profiles(id);

-- 2. Adicionar coluna updated_by_profile também
ALTER TABLE resolucoes 
ADD COLUMN IF NOT EXISTS updated_by_profile UUID REFERENCES profiles(id);

-- 3. Popular as novas colunas com dados existentes
-- Assumindo que existe um registro em profiles para cada auth.users
UPDATE resolucoes r
SET 
  created_by_profile = p.id,
  updated_by_profile = p2.id
FROM profiles p
LEFT JOIN profiles p2 ON p2.id = r.updated_by
WHERE p.id = r.created_by;

-- 4. Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_resolucoes_created_by_profile ON resolucoes(created_by_profile);
CREATE INDEX IF NOT EXISTS idx_resolucoes_updated_by_profile ON resolucoes(updated_by_profile);

-- 5. Fazer o mesmo para resolucoes_revogacoes
ALTER TABLE resolucoes_revogacoes 
ADD COLUMN IF NOT EXISTS created_by_profile UUID REFERENCES profiles(id);

UPDATE resolucoes_revogacoes rr
SET created_by_profile = p.id
FROM profiles p
WHERE p.id = rr.created_by;

CREATE INDEX IF NOT EXISTS idx_resolucoes_revogacoes_created_by_profile ON resolucoes_revogacoes(created_by_profile);

-- 6. Criar trigger para sincronizar automaticamente created_by_profile com created_by
CREATE OR REPLACE FUNCTION sync_resolucoes_profile_refs()
RETURNS TRIGGER AS $$
BEGIN
  -- Ao inserir ou atualizar, sincroniza created_by_profile
  IF NEW.created_by IS NOT NULL AND NEW.created_by_profile IS NULL THEN
    NEW.created_by_profile = NEW.created_by;
  END IF;
  
  IF NEW.updated_by IS NOT NULL THEN
    NEW.updated_by_profile = NEW.updated_by;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Aplicar trigger na tabela resolucoes
DROP TRIGGER IF EXISTS sync_resolucoes_profile_refs_trigger ON resolucoes;
CREATE TRIGGER sync_resolucoes_profile_refs_trigger
  BEFORE INSERT OR UPDATE ON resolucoes
  FOR EACH ROW
  EXECUTE FUNCTION sync_resolucoes_profile_refs();

-- 8. Aplicar trigger na tabela resolucoes_revogacoes
CREATE OR REPLACE FUNCTION sync_resolucoes_revogacoes_profile_refs()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NOT NULL AND NEW.created_by_profile IS NULL THEN
    NEW.created_by_profile = NEW.created_by;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_resolucoes_revogacoes_profile_refs_trigger ON resolucoes_revogacoes;
CREATE TRIGGER sync_resolucoes_revogacoes_profile_refs_trigger
  BEFORE INSERT OR UPDATE ON resolucoes_revogacoes
  FOR EACH ROW
  EXECUTE FUNCTION sync_resolucoes_revogacoes_profile_refs();

-- 9. Adicionar comentários para documentação
COMMENT ON COLUMN resolucoes.created_by_profile IS 'Referência ao perfil do usuário que criou a resolução (sincronizado com created_by)';
COMMENT ON COLUMN resolucoes.updated_by_profile IS 'Referência ao perfil do usuário que atualizou a resolução (sincronizado com updated_by)';
COMMENT ON COLUMN resolucoes_revogacoes.created_by_profile IS 'Referência ao perfil do usuário que registrou a revogação (sincronizado com created_by)';

-- 10. Atualizar RLS policies para usar as novas colunas (opcional - mantém compatibilidade)
-- As policies existentes continuam funcionando com created_by