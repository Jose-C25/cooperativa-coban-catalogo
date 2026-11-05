import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function applyAuditTrigger() {
  console.log('Aplicando Trigger de Auditoría en PostgreSQL...')

  const sqlScript = `
    -- 1. Crear función para el Trigger de auditoría
    CREATE OR REPLACE FUNCTION fn_auditar_agencias()
    RETURNS TRIGGER AS $$
    DECLARE
      v_accion "AccionBitacora";
      v_id_usuario INT := 1; -- Usuario por defecto (Admin) si no se pasa contexto
      v_detalles JSONB;
    BEGIN
      -- Determinar la acción y construir los detalles JSON
      IF (TG_OP = 'INSERT') THEN
        v_accion := 'INSERT';
        v_detalles := jsonb_build_object('nuevo', to_jsonb(NEW));
        
        INSERT INTO tb_bitacora (id_usuario, accion, tabla_afectada, id_registro_afectado, detalles, fecha_hora)
        VALUES (v_id_usuario, v_accion, 'tb_agencias', NEW.id_agencia, v_detalles, CURRENT_TIMESTAMP);
        RETURN NEW;
        
      ELSIF (TG_OP = 'UPDATE') THEN
        -- Detectar si es un Soft Delete (eliminación lógica)
        IF (OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE) THEN
          v_accion := 'SOFT_DELETE';
        ELSE
          v_accion := 'UPDATE';
        END IF;
        
        v_detalles := jsonb_build_object(
          'anterior', to_jsonb(OLD),
          'nuevo', to_jsonb(NEW)
        );
        
        INSERT INTO tb_bitacora (id_usuario, accion, tabla_afectada, id_registro_afectado, detalles, fecha_hora)
        VALUES (v_id_usuario, v_accion, 'tb_agencias', NEW.id_agencia, v_detalles, CURRENT_TIMESTAMP);
        RETURN NEW;

      ELSIF (TG_OP = 'DELETE') THEN
        v_accion := 'DELETE';
        v_detalles := jsonb_build_object('eliminado', to_jsonb(OLD));
        
        INSERT INTO tb_bitacora (id_usuario, accion, tabla_afectada, id_registro_afectado, detalles, fecha_hora)
        VALUES (v_id_usuario, v_accion, 'tb_agencias', OLD.id_agencia, v_detalles, CURRENT_TIMESTAMP);
        RETURN OLD;
      END IF;
      
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    -- 2. Eliminar el trigger previo si existe para evitar duplicados
    DROP TRIGGER IF EXISTS trg_auditoria_agencias ON tb_agencias;

    -- 3. Asociar el Trigger a la tabla tb_agencias
    CREATE TRIGGER trg_auditoria_agencias
    AFTER INSERT OR UPDATE OR DELETE ON tb_agencias
    FOR EACH ROW
    EXECUTE FUNCTION fn_auditar_agencias();
  `

  try {
    await prisma.$executeRawUnsafe(sqlScript)
    console.log('✓ Función y Trigger de Auditoría creados exitosamente en PostgreSQL.')
  } catch (error) {
    console.error('Error al aplicar el trigger:', error)
  } finally {
    await prisma.$disconnect()
  }
}

applyAuditTrigger()