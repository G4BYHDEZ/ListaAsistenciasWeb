// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Permite peticiones desde el origen de React

// Configuración de la base de datos universidad_asistencia
const db = mysql.createPool({
    host: 'localhost',
    user: 'gabriel',
    password: '1234', // Cambia esto por tu contraseña real
    database: 'universidad_asistencia',
});

// ENDPOINT DE LOGIN CORREGIDO EN SERVER.JS
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Pasamos tanto el email como el password al procedimiento almacenado
        const [rows] = await db.query('CALL sp_login(?, ?)', [email, password]);
        const user = rows[0][0]; // Obtenemos el primer registro del resultado

        // Si el procedimiento no devolvió filas, significa que las credenciales son incorrectas
        if (!user) {
            return res.status(401).json({ message: 'Correo o contraseña incorrectos, o usuario inactivo.' });
        }

        // Mapeamos 'profesor' de la BD al rol 'teacher' que espera tu ruteador de React
        const frontendRole = user.rol === 'profesor' ? 'teacher' : user.rol;

        res.json({
            id: user.id_docente,
            name: user.nombre,
            email: user.email,
            role: frontendRole
        });
    } catch (error) {
        console.error("Error en sp_login:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 2. CURSOS DEL DOCENTE (Usa sp_cursos_docente)
app.get('/api/teacher/:id/courses', async (req, res) => {
    try {
        const [rows] = await db.query('CALL sp_cursos_docente(?)', [req.params.id]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. TODOS LOS CURSOS - ADMIN (Usa sp_cursos_admin)
app.get('/api/admin/courses', async (req, res) => {
    try {
        const [rows] = await db.query('CALL sp_cursos_admin()');
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. LISTA DE ESTUDIANTES POR CURSO - ADMIN
app.get('/api/courses/:id/students', async (req, res) => {
    try {
        const [rows] = await db.query('CALL sp_estudiantes_curso(?)', [req.params.id]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. ASISTENCIA POR FECHA (Usa sp_lista_por_fecha)
app.get('/api/courses/:id/attendance/:date', async (req, res) => {
    try {
        const [rows] = await db.query('CALL sp_lista_por_fecha(?, ?)', [req.params.id, req.params.date]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. GUARDAR/UPSERT ASISTENCIA (Usa sp_upsert_asistencia)
app.post('/api/attendance/save', async (req, res) => {
    const { id_curso, fecha, registros } = req.body; 
    // registros = [{ id_estudiante, estado, observaciones }]
    try {
        for (let r of registros) {
            await db.query('CALL sp_upsert_asistencia(?, ?, ?, ?, ?)', [
                r.id_estudiante,
                id_curso,
                fecha,
                r.estado,
                r.observaciones || ''
            ]);
        }
        res.json({ success: true, message: 'Asistencias procesadas de manera exitosa' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. REPORTE / RESUMEN GENERAL GRUPO (Usa sp_resumen_grupo)
app.get('/api/courses/:id/summary', async (req, res) => {
    try {
        const [rows] = await db.query('CALL sp_resumen_grupo(?)', [req.params.id]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. HISTORIAL DE LISTAS TOMADAS (Usa sp_fechas_con_lista)
app.get('/api/courses/:id/history', async (req, res) => {
    try {
        const [rows] = await db.query('CALL sp_fechas_con_lista(?)', [req.params.id]);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 9. PANEL GENERAL METRICAS (Opcional simplificado para Contadores del Dashboard)
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [[{ total_cursos }]] = await db.query('SELECT COUNT(*) AS total_cursos FROM cursos');
        const [[{ total_alumnos }]] = await db.query('SELECT COUNT(*) AS total_alumnos FROM estudiantes');
        const [[{ total_asistencias }]] = await db.query('SELECT COUNT(*) AS total_asistencias FROM asistencias');
        res.json({ total_cursos, total_alumnos, total_asistencias });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => console.log('Servidor corriendo en http://listaalumnos.utportfolio.cloud:5000'));