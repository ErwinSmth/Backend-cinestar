import re

def generate():
    with open('backend/showtime-service/src/main/resources/db/migration/V2__seed_showtimes.sql', 'r') as f:
        content = f.read()
    
    # Solo procesar la parte de Funciones
    content = content.split('-- 3. Insertar Funciones')[1]
    
    lines = content.split('\n')
    
    funcion_id = 1
    sql_statements = []
    
    sql_statements.append("-- ==========================================")
    sql_statements.append("-- MIGRATION: V4__seed_tickets.sql")
    sql_statements.append("-- Generado automaticamente para los seeders")
    sql_statements.append("-- ==========================================\n")
    
    for line in lines:
        line = line.strip()
        if line.startswith('(') and (line.endswith(',') or line.endswith(';')):
            # Extraer sala_id (es el segundo parametro de INSERT INTO funcion)
            parts = line.split(',')
            sala_id = parts[1].strip()
            
            stmt = f"INSERT INTO tickets (funcion_id, asientos_id, estado, version)\nSELECT {funcion_id}, asientos_id, 'DISPONIBLE', 0 FROM asientos WHERE sala_id = {sala_id};"
            sql_statements.append(stmt)
            
            funcion_id += 1
            
    with open('backend/seat-service/src/main/resources/db/migration/V4__seed_tickets.sql', 'w') as f:
        f.write('\n'.join(sql_statements))

if __name__ == '__main__':
    generate()
