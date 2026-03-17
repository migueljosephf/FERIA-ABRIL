/**
 * API Centralizada - Sistema de Gestión Escolar (SGE)
 * Backend ligero para centralizar datos sin modificar frontend existente
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const joi = require('joi');
const winston = require('winston');
const path = require('path');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const moment = require('moment');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sge-secret-key-2024';
const DB_PATH = path.join(__dirname, 'data', 'sge.db');

// Configuración de Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'sge-api' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// Crear directorio de datos si no existe
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdir(dataDir, { recursive: true });
}

// Inicializar base de datos SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        logger.error('Error conectando a la base de datos:', err);
    } else {
        logger.info('Conectado a SQLite en:', DB_PATH);
        initializeDatabase();
    }
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de Multer para uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Esquemas de validación
const schemas = {
    user: joi.object({
        username: joi.string().alphanum().min(3).max(20).required(),
        password: joi.string().min(6).max(100).required(),
        name: joi.string().min(2).max(50).required(),
        role: joi.string().valid(['admin', 'direccion', 'docente', 'psicologa', 'cafeteria', 'comedor', 'enfermeria', 'odontologia', 'papeleria']).required()
    }),
    
    excuse: joi.object({
        studentName: joi.string().min(2).max(50).required(),
        course: joi.string().min(1).max(30).required(),
        psychologistUsername: joi.string().required(),
        reason: joi.string().min(10).max(500).required(),
        type: joi.string().valid(['medica', 'personal', 'familiar', 'otra']).required(),
        professorUsername: joi.string().required()
    }),
    
    message: joi.object({
        sender: joi.string().required(),
        recipient: joi.string().required(),
        subject: joi.string().min(3).max(100).required(),
        content: joi.string().min(10).max(1000).required()
    }),
    
    attendance: joi.object({
        course: joi.string().required(),
        date: joi.string().isoDate().required(),
        presentStudents: joi.array().items(joi.string()).required(),
        absentStudents: joi.array().items(joi.string()).required(),
        totalStudents: joi.number().min(1).required(),
        professorUsername: joi.string().required()
    })
};

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Middleware de logging de requests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, { 
        ip: req.ip, 
        userAgent: req.get('User-Agent') 
    });
    next();
});

// Función para inicializar la base de datos
function initializeDatabase() {
    // Crear tablas si no existen
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS excuses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentName TEXT NOT NULL,
            course TEXT NOT NULL,
            psychologistUsername TEXT NOT NULL,
            reason TEXT NOT NULL,
            type TEXT NOT NULL,
            professorUsername TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            recipient TEXT NOT NULL,
            subject TEXT NOT NULL,
            content TEXT NOT NULL,
            status TEXT DEFAULT 'sent',
            readStatus INTEGER DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course TEXT NOT NULL,
            date TEXT NOT NULL,
            presentStudents TEXT NOT NULL,
            absentStudents TEXT NOT NULL,
            totalStudents INTEGER NOT NULL,
            professorUsername TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            originalName TEXT NOT NULL,
            mimetype TEXT NOT NULL,
            size INTEGER NOT NULL,
            path TEXT NOT NULL,
            uploadedBy TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            generatedBy TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    tables.forEach(table => {
        db.run(table, (err) => {
            if (err) {
                logger.error('Error creando tabla:', err);
            }
        });
    });

    // Insertar usuarios iniciales si no existen
    const initialUsers = [
        ['admin', 'Administrador Principal', 'admin'],
        ['admin2', 'Administrador Secundario', 'admin'],
        ['admin3', 'Administrador Terciario', 'admin'],
        ['direccion', 'Director General', 'direccion'],
        ['prof_starling', 'Prof. Starling Batista', 'docente'],
        ['prof_belkis', 'Prof. Belkis Martínez', 'docente'],
        ['psi_maria', 'María Gómez', 'psicologa'],
        ['psi_ana', 'Ana Martínez', 'psicologa'],
        ['psi_laura', 'Laura Pérez', 'psicologa']
    ];

    initialUsers.forEach(([username, name, role]) => {
        const hashedPassword = bcrypt.hashSync('password123', 10);
        db.run(
            'INSERT OR IGNORE INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, name, role]
        );
    });

    logger.info('Base de datos inicializada');
}

// Rutas de autenticación
app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }

        db.get(
            'SELECT * FROM users WHERE username = ?',
            [username],
            (err, user) => {
                if (err) {
                    logger.error('Error en login:', err);
                    return res.status(500).json({ error: 'Error del servidor' });
                }

                if (!user) {
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }

                const passwordMatch = bcrypt.compareSync(password, user.password);
                if (!passwordMatch) {
                    return res.status(401).json({ error: 'Credenciales inválidas' });
                }

                const token = jwt.sign(
                    { userId: user.id, username: user.username, role: user.role, name: user.name },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                logger.info(`Usuario ${username} inició sesión`);
                
                res.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        role: user.role
                    }
                });
            }
        );
    } catch (error) {
        logger.error('Error en login:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.post('/api/auth/validate', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// Rutas de excusas
app.get('/api/excuses', authenticateToken, (req, res) => {
    const { role, username } = req.user;
    
    let query = 'SELECT * FROM excuses';
    let params = [];
    
    if (role === 'docente') {
        query += ' WHERE professorUsername = ?';
        params = [username];
    } else if (role === 'psicologa') {
        query += ' WHERE psychologistUsername = ?';
        params = [username];
    }
    
    query += ' ORDER BY createdAt DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            logger.error('Error obteniendo excusas:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        
        res.json(rows);
    });
});

app.post('/api/excuses', authenticateToken, (req, res) => {
    try {
        const { error, value } = schemas.excuse.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { studentName, course, psychologistUsername, reason, type } = value;
        const professorUsername = req.user.username;

        db.run(
            'INSERT INTO excuses (studentName, course, psychologistUsername, reason, type, professorUsername) VALUES (?, ?, ?, ?, ?, ?)',
            [studentName, course, psychologistUsername, reason, type, professorUsername],
            function(err) {
                if (err) {
                    logger.error('Error creando excusa:', err);
                    return res.status(500).json({ error: 'Error del servidor' });
                }
                
                logger.info(`Excusa creada por ${professorUsername} para ${studentName}`);
                res.json({ success: true, id: this.lastID });
            }
        );
    } catch (error) {
        logger.error('Error creando excusa:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Rutas de mensajes
app.get('/api/messages', authenticateToken, (req, res) => {
    const { role, username } = req.user;
    
    let query = 'SELECT * FROM messages';
    let params = [];
    
    if (role === 'docente') {
        query += ' WHERE sender = ? OR recipient = ?';
        params = [username, username];
    } else if (role === 'psicologa') {
        query += ' WHERE sender = ? OR recipient = ?';
        params = [username, username];
    }
    
    query += ' ORDER BY createdAt DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            logger.error('Error obteniendo mensajes:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        
        res.json(rows);
    });
});

app.post('/api/messages', authenticateToken, (req, res) => {
    try {
        const { error, value } = schemas.message.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { sender, recipient, subject, content } = value;

        db.run(
            'INSERT INTO messages (sender, recipient, subject, content) VALUES (?, ?, ?, ?)',
            [sender, recipient, subject, content],
            function(err) {
                if (err) {
                    logger.error('Error creando mensaje:', err);
                    return res.status(500).json({ error: 'Error del servidor' });
                }
                
                logger.info(`Mensaje de ${sender} para ${recipient}`);
                res.json({ success: true, id: this.lastID });
            }
        );
    } catch (error) {
        logger.error('Error creando mensaje:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Rutas de asistencia
app.get('/api/attendance', authenticateToken, (req, res) => {
    const { username } = req.user;
    
    db.all(
        'SELECT * FROM attendance WHERE professorUsername = ? ORDER BY date DESC',
        [username],
        (err, rows) => {
            if (err) {
                logger.error('Error obteniendo asistencia:', err);
                return res.status(500).json({ error: 'Error del servidor' });
            }
            
            res.json(rows);
        }
    );
});

app.post('/api/attendance', authenticateToken, (req, res) => {
    try {
        const { error, value } = schemas.attendance.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { course, date, presentStudents, absentStudents, totalStudents } = value;
        const professorUsername = req.user.username;

        db.run(
            'INSERT INTO attendance (course, date, presentStudents, absentStudents, totalStudents, professorUsername) VALUES (?, ?, ?, ?, ?, ?)',
            [course, date, JSON.stringify(presentStudents), JSON.stringify(absentStudents), totalStudents, professorUsername],
            function(err) {
                if (err) {
                    logger.error('Error creando asistencia:', err);
                    return res.status(500).json({ error: 'Error del servidor' });
                }
                
                logger.info(`Asistencia registrada por ${professorUsername} para ${course}`);
                res.json({ success: true, id: this.lastID });
            }
        );
    } catch (error) {
        logger.error('Error creando asistencia:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Rutas de archivos
app.post('/api/files/upload', authenticateToken, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se proporcionó archivo' });
        }

        const fileData = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            uploadedBy: req.user.username
        };

        db.run(
            'INSERT INTO files (filename, originalName, mimetype, size, path, uploadedBy) VALUES (?, ?, ?, ?, ?, ?)',
            [fileData.filename, fileData.originalName, fileData.mimetype, fileData.size, fileData.path, fileData.uploadedBy],
            function(err) {
                if (err) {
                    logger.error('Error guardando archivo:', err);
                    return res.status(500).json({ error: 'Error del servidor' });
                }
                
                logger.info(`Archivo subido por ${req.user.username}: ${fileData.originalName}`);
                res.json({ success: true, file: fileData });
            }
        );
    } catch (error) {
        logger.error('Error subiendo archivo:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

app.get('/api/files', authenticateToken, (req, res) => {
    db.all(
        'SELECT * FROM files ORDER BY createdAt DESC',
        [],
        (err, rows) => {
            if (err) {
                logger.error('Error obteniendo archivos:', err);
                return res.status(500).json({ error: 'Error del servidor' });
            }
            
            res.json(rows);
        }
    );
});

// Rutas de usuarios
app.get('/api/users', authenticateToken, (req, res) => {
    db.all(
        'SELECT id, username, name, role, created_at FROM users ORDER BY created_at',
        [],
        (err, rows) => {
            if (err) {
                logger.error('Error obteniendo usuarios:', err);
                return res.status(500).json({ error: 'Error del servidor' });
            }
            
            res.json(rows);
        }
    );
});

// Rutas de sincronización (compatibilidad con frontend)
app.get('/api/sync/excuses', authenticateToken, (req, res) => {
    const { role, username } = req.user;
    
    let query = 'SELECT * FROM excuses';
    let params = [];
    
    if (role === 'docente') {
        query += ' WHERE professorUsername = ?';
        params = [username];
    } else if (role === 'psicologa') {
        query += ' WHERE psychologistUsername = ?';
        params = [username];
    }
    
    db.all(query, params, (err, rows) => {
        if (err) {
            logger.error('Error sincronizando excusas:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        
        // Formato compatible con frontend
        const formattedData = rows.map(excuse => ({
            id: excuse.id,
            estudiante: excuse.studentName,
            curso: excuse.course,
            motivo: excuse.reason,
            tipo: excuse.type,
            psychologistUsername: excuse.psychologistUsername,
            profesor: excuse.professorUsername,
            timestamp: excuse.createdAt,
            status: excuse.status
        }));
        
        res.json(formattedData);
    });
});

app.get('/api/sync/messages', authenticateToken, (req, res) => {
    const { role, username } = req.user;
    
    let query = 'SELECT * FROM messages';
    let params = [];
    
    if (role === 'docente') {
        query += ' WHERE sender = ? OR recipient = ?';
        params = [username, username];
    } else if (role === 'psicologa') {
        query += ' WHERE sender = ? OR recipient = ?';
        params = [username, username];
    }
    
    query += ' ORDER BY createdAt DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            logger.error('Error sincronizando mensajes:', err);
            return res.status(500).json({ error: 'Error del servidor' });
        }
        
        // Formato compatible con frontend
        const formattedData = rows.map(message => ({
            id: message.id,
            de: message.sender,
            para: message.recipient,
            asunto: message.subject,
            contenido: message.content,
            timestamp: message.createdAt,
            status: message.status,
            leido: message.readStatus
        }));
        
        res.json(formattedData);
    });
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            users: row ? row.count : 0
        });
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
    logger.error('Error no manejado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    logger.info(`🚀 API SGE corriendo en puerto ${PORT}`);
    logger.info(`📊 Base de datos: ${DB_PATH}`);
    logger.info(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
