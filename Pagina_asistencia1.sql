DROP DATABASE IF EXISTS universidad_asistencia;
CREATE DATABASE universidad_asistencia;
USE universidad_asistencia;

CREATE TABLE docentes (
    id_docente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin','profesor') DEFAULT 'profesor',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    semestre VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE docente_curso (
    id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
    id_docente INT NOT NULL,
    id_curso INT NOT NULL,
    FOREIGN KEY (id_docente) REFERENCES docentes(id_docente),
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso),
    UNIQUE(id_docente,id_curso)
);

CREATE TABLE estudiantes (
    id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE,
    nombre VARCHAR(100),
    correo VARCHAR(100),
    carrera VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE inscripciones (
    id_inscripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_curso INT NOT NULL,
    FOREIGN KEY(id_estudiante) REFERENCES estudiantes(id_estudiante),
    FOREIGN KEY(id_curso) REFERENCES cursos(id_curso),
    UNIQUE(id_estudiante,id_curso)
);

CREATE TABLE asistencias (
    id_asistencia INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    id_curso INT NOT NULL,
    fecha DATE NOT NULL,
    estado ENUM('Presente','Ausente','Retardo','Justificado') DEFAULT 'Presente',
    observaciones TEXT,
    FOREIGN KEY(id_estudiante) REFERENCES estudiantes(id_estudiante),
    FOREIGN KEY(id_curso) REFERENCES cursos(id_curso)
);

INSERT INTO docentes(nombre,email,password,rol)
VALUES
('Administrador', 'admin@universidad.edu', 'admin123', 'admin'),
('Juan Pérez', 'juan@universidad.edu', 'juanp123','profesor'),
('Ana López', 'ana@universidad.edu', 'Ani111', 'profesor');

INSERT INTO cursos (nombre,descripcion,semestre)
VALUES
('Programación Web', 'HTML CSS JS', '2026-1'),
('Bases de Datos', 'MySQL Avanzado', '2026-1'),
('Redes', 'Administración de Redes', '2026-1');

INSERT INTO docente_curso (id_docente,id_curso)
VALUES
(2,1),
(2,2),
(3,3);

INSERT INTO estudiantes (matricula, nombre, correo, carrera) VALUES
('2024001', 'Carlos Ramírez',    'carlos@correo.edu',  'Ingeniería en Sistemas'),
('2024002', 'María González',    'maria@correo.edu',   'Ingeniería en Sistemas'),
('2024003', 'Luis Torres',       'luis@correo.edu',    'Licenciatura en Redes'),
('2024004', 'Sofía Martínez',    'sofia@correo.edu',   'Ingeniería en Sistemas'),
('2024005', 'Diego Hernández',   'diego@correo.edu',   'Licenciatura en Redes'),
('2024006', 'Valeria Pérez',     'valeria@correo.edu', 'Ingeniería en Sistemas'),
('2024007', 'Andrés López',      'andres@correo.edu',  'Licenciatura en Redes'),
('2024008', 'Camila Ruiz',       'camila@correo.edu',  'Ingeniería en Sistemas');
 
-- Inscripciones: estudiantes 1-6 en Programación Web (curso 1)
INSERT INTO inscripciones (id_estudiante, id_curso) VALUES
(1,1),(2,1),(3,1),(4,1),(5,1),(6,1),
-- estudiantes 5-8 en Bases de Datos (curso 2)
(5,2),(6,2),(7,2),(8,2),
-- estudiantes 1,3,5,7 en Redes (curso 3)
(1,3),(3,3),(5,3),(7,3);
 
-- Asistencias de ejemplo (últimos días)
INSERT INTO asistencias (id_estudiante, id_curso, fecha, estado) VALUES
(1,1,'2026-06-10','Presente'),
(2,1,'2026-06-10','Presente'),
(3,1,'2026-06-10','Retardo'),
(4,1,'2026-06-10','Ausente'),
(5,1,'2026-06-10','Presente'),
(6,1,'2026-06-10','Justificado'),
(1,1,'2026-06-12','Presente'),
(2,1,'2026-06-12','Ausente'),
(3,1,'2026-06-12','Presente'),
(4,1,'2026-06-12','Presente'),
(5,1,'2026-06-12','Presente'),
(6,1,'2026-06-12','Retardo');

DELIMITER $$

CREATE PROCEDURE sp_login(
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    SELECT
        id_docente,
        nombre,
        email,
        rol
    FROM docentes 
    WHERE email = p_email 
      AND password = p_password 
      AND activo = TRUE;
END$$

DELIMITER ;

DELIMITER $$
CREATE PROCEDURE sp_cursos_docente(
    IN p_docente INT
)
BEGIN
    SELECT
        c.id_curso,
        c.nombre,
        c.descripcion,
        c.semestre
    FROM cursos c INNER JOIN docente_curso dc ON c.id_curso = dc.id_curso
    WHERE dc.id_docente = p_docente;
END$$
DELIMITER ;

DELIMITER $$

CREATE PROCEDURE sp_cursos_admin()
BEGIN
    SELECT *
    FROM cursos;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE sp_estudiantes_curso(
    IN p_curso INT
)
BEGIN
    SELECT
        e.id_estudiante,
        e.matricula,
        e.nombre,
        e.correo,
        e.carrera
    FROM estudiantes e INNER JOIN inscripciones i ON e.id_estudiante = i.id_estudiante
    WHERE i.id_curso = p_curso;
END$$

DELIMITER ;
DELIMITER $$

CREATE PROCEDURE sp_registrar_asistencia(
    IN p_estudiante INT,
    IN p_curso INT,
    IN p_fecha DATE,
    IN p_estado VARCHAR(20),
    IN p_observaciones TEXT
)
BEGIN
    INSERT INTO asistencias(
        id_estudiante,
        id_curso,
        fecha,
        estado,
        observaciones
    )
    VALUES(
        p_estudiante,
        p_curso,
        p_fecha,
        p_estado,
        p_observaciones
    );
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE sp_historial_asistencia(
    IN p_curso INT
)
BEGIN
    SELECT
        a.id_asistencia,
        e.nombre estudiante,
        a.fecha,
        a.estado,
        a.observaciones
    FROM asistencias a INNER JOIN estudiantes e ON a.id_estudiante = e.id_estudiante
    WHERE a.id_curso = p_curso
    ORDER BY a.fecha DESC;

END$$

DELIMITER ;

DELIMITER $$
 
-- ── 1. Resumen de asistencia por estudiante en un curso ──────
CREATE PROCEDURE sp_resumen_estudiante(
    IN p_curso     INT,
    IN p_estudiante INT
)
BEGIN
    SELECT
        e.nombre                                                      AS estudiante,
        COUNT(*)                                                      AS total_clases,
        SUM(a.estado = 'Presente')                                    AS presentes,
        SUM(a.estado = 'Ausente')                                     AS ausentes,
        SUM(a.estado = 'Retardo')                                     AS retardos,
        SUM(a.estado = 'Justificado')                                 AS justificados,
        ROUND(SUM(a.estado = 'Presente') / COUNT(*) * 100, 1)        AS pct_asistencia
    FROM asistencias a
    INNER JOIN estudiantes e ON a.id_estudiante = e.id_estudiante
    WHERE a.id_curso = p_curso
      AND a.id_estudiante = p_estudiante;
END$$
 
-- ── 2. Resumen general del grupo (todos los estudiantes del curso) ──
CREATE PROCEDURE sp_resumen_grupo(
    IN p_curso INT
)
BEGIN
    SELECT
        e.id_estudiante,
        e.matricula,
        e.nombre,
        COUNT(*)                                                   AS total_clases,
        SUM(a.estado = 'Presente')                                 AS presentes,
        SUM(a.estado = 'Ausente')                                   AS ausentes,
        SUM(a.estado = 'Retardo')                                   AS retardos,
        SUM(a.estado = 'Justificado')                               AS justificados,
        ROUND(SUM(a.estado = 'Presente') / COUNT(*) * 100, 1)     AS pct_asistencia
    FROM asistencias a
    INNER JOIN estudiantes e ON a.id_estudiante = e.id_estudiante
    WHERE a.id_curso = p_curso
    GROUP BY e.id_estudiante, e.matricula, e.nombre
    ORDER BY e.nombre;
END$$
 
-- ── 3. Lista de asistencia por fecha (para pasar lista un día) ──
CREATE PROCEDURE sp_lista_por_fecha(
    IN p_curso INT,
    IN p_fecha DATE
)
BEGIN
    SELECT
        e.id_estudiante,
        e.matricula,
        e.nombre,
        COALESCE(a.estado, 'Sin registro')  AS estado,
        a.observaciones
    FROM inscripciones i
    INNER JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
    LEFT JOIN asistencias a
           ON a.id_estudiante = e.id_estudiante
          AND a.id_curso      = p_curso
          AND a.fecha         = p_fecha
    WHERE i.id_curso = p_curso
    ORDER BY e.nombre;
END$$
 
-- ── 4. Actualizar un registro de asistencia existente ──────────
CREATE PROCEDURE sp_actualizar_asistencia(
    IN p_id_asistencia  INT,
    IN p_estado         VARCHAR(20),
    IN p_observaciones  TEXT
)
BEGIN
    UPDATE asistencias
       SET estado        = p_estado,
           observaciones = p_observaciones
     WHERE id_asistencia = p_id_asistencia;
END$$
 
-- ── 5. Registrar o actualizar (upsert) asistencia ─────────────
--      Si ya existe el registro para ese estudiante/curso/fecha,
--      lo actualiza; si no, lo inserta.
CREATE PROCEDURE sp_upsert_asistencia(
    IN p_estudiante    INT,
    IN p_curso         INT,
    IN p_fecha         DATE,
    IN p_estado        VARCHAR(20),
    IN p_observaciones TEXT
)
BEGIN
    IF EXISTS (
        SELECT 1 FROM asistencias
         WHERE id_estudiante = p_estudiante
           AND id_curso      = p_curso
           AND fecha         = p_fecha
    ) THEN
        UPDATE asistencias
           SET estado        = p_estado,
               observaciones = p_observaciones
         WHERE id_estudiante = p_estudiante
           AND id_curso      = p_curso
           AND fecha         = p_fecha;
    ELSE
        INSERT INTO asistencias (id_estudiante, id_curso, fecha, estado, observaciones)
        VALUES (p_estudiante, p_curso, p_fecha, p_estado, p_observaciones);
    END IF;
END$$
 
-- ── 6. Fechas con lista tomada en un curso ─────────────────────
CREATE PROCEDURE sp_fechas_con_lista(
    IN p_curso INT
)
BEGIN
    SELECT DISTINCT fecha,
           COUNT(*)            AS alumnos_registrados,
           SUM(estado='Presente')   AS presentes,
           SUM(estado='Ausente')    AS ausentes,
           SUM(estado='Retardo')    AS retardos,
           SUM(estado='Justificado') AS justificados
    FROM asistencias
    WHERE id_curso = p_curso
    GROUP BY fecha
    ORDER BY fecha DESC;
END$$
 
-- ── 7. Eliminar asistencia (para correcciones) ────────────────
CREATE PROCEDURE sp_eliminar_asistencia(
    IN p_id_asistencia INT
)
BEGIN
    DELETE FROM asistencias WHERE id_asistencia = p_id_asistencia;
END$$
 
-- ── 8. Alumnos con baja asistencia (por debajo del umbral) ────
CREATE PROCEDURE sp_alumnos_en_riesgo(
    IN p_curso   INT,
    IN p_umbral  DECIMAL(5,2)   -- ej. 70.0
)
BEGIN
    SELECT
        e.id_estudiante,
        e.matricula,
        e.nombre,
        e.correo,
        COUNT(*)                                               AS total_clases,
        SUM(a.estado = 'Presente')                             AS presentes,
        ROUND(SUM(a.estado = 'Presente')/COUNT(*)*100, 1)     AS pct_asistencia
    FROM asistencias a
    INNER JOIN estudiantes e ON a.id_estudiante = e.id_estudiante
    WHERE a.id_curso = p_curso
    GROUP BY e.id_estudiante, e.matricula, e.nombre, e.correo
    HAVING pct_asistencia < p_umbral
    ORDER BY pct_asistencia ASC;
END$$
 
DELIMITER ;