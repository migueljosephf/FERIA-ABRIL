/**
     * Sistema Central de Gestión de Datos - SGE
     * Maneja toda la información del sistema de forma centralizada
     * Principio: Los datos fluyen como un río, los administradores pueden observar y corregir, pero no eliminar
     */

class SystemDataManager {
    constructor() {
        this.initializeStorage();
        this.setupEventListeners();
    }

    /**
     * Inicializar el almacenamiento de datos
     */
    initializeStorage() {
        if (!localStorage.getItem('sge_system_data')) {
            const initialData = {
                reportes: [],
                excusas: [],
                casosPsicologia: [],
                actividadSistema: [],
                reportesCafeteria: [],
                prestamosCafeteria: [],
                usuarios: [
                    // Administradores
                    { username: 'admin', name: 'Administrador Principal', role: 'administrador' },
                    { username: 'admin2', name: 'Administrador Secundario', role: 'administrador' },
                    { username: 'admin3', name: 'Administrador Terciario', role: 'administrador' },
                    
                    // Directores
                    { username: 'direccion', name: 'Director General', role: 'direccion' },
                    
                    // Psicólogas (13 psicólogas registradas)
                    { username: 'psi_maria', name: 'María Gómez', role: 'psicologa' },
                    { username: 'psi_ana', name: 'Ana Martínez', role: 'psicologa' },
                    { username: 'psi_laura', name: 'Laura Pérez', role: 'psicologa' },
                    { username: 'psi_sofia', name: 'Sofía Rodríguez', role: 'psicologa' },
                    { username: 'psi_marta_rodriguez', name: 'Dra. Marta Rodríguez', role: 'psicologa' },
                    { username: 'psi_carolina_gomez', name: 'Dra. Carolina Gómez', role: 'psicologa' },
                    { username: 'psi_ana_martinez', name: 'Dra. Ana Martínez', role: 'psicologa' },
                    { username: 'psi_laura_perez', name: 'Dra. Laura Pérez', role: 'psicologa' },
                    { username: 'psi_claudia_hernandez', name: 'Dra. Claudia Hernández', role: 'psicologa' },
                    { username: 'psi_patricia_lopez', name: 'Dra. Patricia López', role: 'psicologa' },
                    { username: 'psi_sofia_garcia', name: 'Dra. Sofía García', role: 'psicologa' },
                    { username: 'psi_valentina_diaz', name: 'Dra. Valentina Díaz', role: 'psicologa' },
                    { username: 'psi_camila_fernandez', name: 'Dra. Camila Fernández', role: 'psicologa' },
                    { username: 'psi_isabella_torres', name: 'Dra. Isabella Torres', role: 'psicologa' },
                    { username: 'psi_maria_gonzalez', name: 'Dra. María González', role: 'psicologa' },
                    { username: 'psi_elena_ramirez', name: 'Dra. Elena Ramírez', role: 'psicologa' },
                    { username: 'psi_carmen_sanchez', name: 'Dra. Carmen Sánchez', role: 'psicologa' },
                    
                    // Profesores
                    { username: 'prof_starling', name: 'Starling Encarnación', role: 'docente', subject: 'Matemáticas', courses: ['4to A', '4to B', '5to A'] },
                    { username: 'prof_belkis', name: 'Belkis Batista', role: 'docente', subject: 'Historia', courses: ['4to C', '4to D', '5to B'] },
                    { username: 'prof_adrian', name: 'Adrian Ramirez', role: 'docente', subject: 'Ciencias', courses: ['4to E', '4to F', '5to C'] },
                    { username: 'prof_angela', name: 'Angela Frias', role: 'docente', subject: 'Lengua', courses: ['4to G', '5to D', '5to E'] }
                ],
                estudiantes: [
                    // Estudiantes 4to A
                    { id: 'est_001', name: 'Juan Pérez', course: '4to A', grade: '4to' },
                    { id: 'est_002', name: 'Ana Rodríguez', course: '4to A', grade: '4to' },
                    { id: 'est_003', name: 'Carlos López', course: '4to A', grade: '4to' },
                    { id: 'est_004', name: 'María García', course: '4to A', grade: '4to' },
                    
                    // Estudiantes 4to B
                    { id: 'est_005', name: 'Pedro Martínez', course: '4to B', grade: '4to' },
                    { id: 'est_006', name: 'Laura Sánchez', course: '4to B', grade: '4to' },
                    { id: 'est_007', name: 'Diego Fernández', course: '4to B', grade: '4to' },
                    { id: 'est_008', name: 'Sofía Díaz', course: '4to B', grade: '4to' },
                    
                    // Estudiantes 4to C
                    { id: 'est_009', name: 'Miguel Torres', course: '4to C', grade: '4to' },
                    { id: 'est_010', name: 'Carmen Ruiz', course: '4to C', grade: '4to' },
                    { id: 'est_011', name: 'Javier Herrera', course: '4to C', grade: '4to' },
                    { id: 'est_012', name: 'Isabel Moreno', course: '4to C', grade: '4to' },
                    
                    // Estudiantes 4to D
                    { id: 'est_013', name: 'Antonio Castro', course: '4to D', grade: '4to' },
                    { id: 'est_014', name: 'Patricia Jiménez', course: '4to D', grade: '4to' },
                    { id: 'est_015', name: 'Francisco Ortega', course: '4to D', grade: '4to' },
                    { id: 'est_016', name: 'Elena Vargas', course: '4to D', grade: '4to' },
                    
                    // Estudiantes 4to E
                    { id: 'est_017', name: 'Roberto Molina', course: '4to E', grade: '4to' },
                    { id: 'est_018', name: 'Teresa Cruz', course: '4to E', grade: '4to' },
                    { id: 'est_019', name: 'Santiago Navarro', course: '4to E', grade: '4to' },
                    { id: 'est_020', name: 'Rosa Rivas', course: '4to E', grade: '4to' },
                    
                    // Estudiantes 4to F
                    { id: 'est_021', name: 'Alberto Silva', course: '4to F', grade: '4to' },
                    { id: 'est_022', name: 'Nuria Castillo', course: '4to F', grade: '4to' },
                    { id: 'est_023', name: 'Daniel Ibáñez', course: '4to F', grade: '4to' },
                    { id: 'est_024', name: 'Beatriz Fuentes', course: '4to F', grade: '4to' },
                    
                    // Estudiantes 4to G
                    { id: 'est_025', name: 'Ricardo Guerrero', course: '4to G', grade: '4to' },
                    { id: 'est_026', name: 'Cristina Lorenzo', course: '4to G', grade: '4to' },
                    { id: 'est_027', name: 'Hugo Serrano', course: '4to G', grade: '4to' },
                    { id: 'est_028', name: 'Miriam Benítez', course: '4to G', grade: '4to' }
                ],
                asistenciaProfesores: [],
                mensajes: [],
                reportesCafeteria: [],
                calificaciones: [],
                schedule: [
                    // Horario de Starling (Matemáticas)
                    { teacher: 'Starling Encarnación', day: 'Lunes', time: '7:00-9:00', course: '4to A', subject: 'Matemáticas' },
                    { teacher: 'Starling Encarnación', day: 'Lunes', time: '9:00-11:00', course: '4to B', subject: 'Matemáticas' },
                    { teacher: 'Starling Encarnación', day: 'Martes', time: '7:00-9:00', course: '5to A', subject: 'Matemáticas' },
                    
                    // Horario de Belkis (Historia)
                    { teacher: 'Belkis Batista', day: 'Lunes', time: '14:00-16:00', course: '4to C', subject: 'Historia' },
                    { teacher: 'Belkis Batista', day: 'Martes', time: '14:00-16:00', course: '4to D', subject: 'Historia' },
                    { teacher: 'Belkis Batista', day: 'Miércoles', time: '14:00-16:00', course: '5to B', subject: 'Historia' },
                    
                    // Horario de Adrian (Ciencias)
                    { teacher: 'Adrian Ramirez', day: 'Lunes', time: '9:00-11:00', course: '4to E', subject: 'Ciencias' },
                    { teacher: 'Adrian Ramirez', day: 'Martes', time: '9:00-11:00', course: '4to F', subject: 'Ciencias' },
                    { teacher: 'Adrian Ramirez', day: 'Miércoles', time: '9:00-11:00', course: '5to C', subject: 'Ciencias' },
                    
                    // Horario de Angela (Lengua)
                    { teacher: 'Angela Frias', day: 'Lunes', time: '11:00-13:00', course: '4to G', subject: 'Lengua' },
                    { teacher: 'Angela Frias', day: 'Martes', time: '11:00-13:00', course: '5to D', subject: 'Lengua' },
                    { teacher: 'Angela Frias', day: 'Miércoles', time: '11:00-13:00', course: '5to E', subject: 'Lengua' }
                ],
                configuracion: {
                    version: '1.0.0',
                    ultimaActualizacion: new Date().toISOString(),
                    politicaRetencion: 'Los datos fluyen como un río, solo se puede observar y corregir, no eliminar'
                }
            };
            localStorage.setItem('sge_system_data', JSON.stringify(initialData));
        }
    }

    /**
     * Obtener todos los datos del sistema
     */
    getAllData() {
        return JSON.parse(localStorage.getItem('sge_system_data') || '{}');
    }

    /**
     * Obtener usuarios del sistema
     */
    getUsers() {
        const data = this.getAllData();
        return data.usuarios || [];
    }

    /**
     * Obtener estudiantes del sistema
     */
    getStudents() {
        const data = this.getAllData();
        return data.estudiantes || [];
    }

    /**
     * Obtener calificaciones del sistema
     */
    getGrades() {
        const data = this.getAllData();
        return data.calificaciones || [];
    }

    /**
     * Guardar una calificación
     */
    guardarCalificacion(calificacion) {
        const data = this.getAllData();
        if (!data.calificaciones) {
            data.calificaciones = [];
        }
        
        // Verificar si ya existe una calificación para este estudiante y competencia
        const existingIndex = data.calificaciones.findIndex(c => 
            c.studentId === calificacion.studentId && 
            c.competence === calificacion.competence &&
            c.teacherUsername === calificacion.teacherUsername
        );
        
        if (existingIndex !== -1) {
            // Actualizar calificación existente
            data.calificaciones[existingIndex] = {
                ...data.calificaciones[existingIndex],
                value: calificacion.value,
                timestamp: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
        } else {
            // Agregar nueva calificación
            data.calificaciones.push({
                ...calificacion,
                timestamp: new Date().toISOString(),
                lastModified: new Date().toISOString()
            });
        }
        
        this.saveAllData(data);
        this.registrarActividad('Calificaciones', `Calificación guardada para estudiante ${calificacion.studentId}`, 'info');
        return true;
    }

    /**
     * Guardar todos los datos del sistema
     */
    saveAllData(data) {
        localStorage.setItem('sge_system_data', JSON.stringify(data));
        this.registrarActividad('Sistema', 'Datos guardados', 'info');
    }

    /**
     * Guardar asistencia de profesor
     */
    guardarAsistenciaProfesor(asistencia) {
        const data = this.getAllData();
        
        if (!data.asistenciaProfesores) {
            data.asistenciaProfesores = [];
        }
        
        asistencia.id = this.generateId('asistencia_');
        asistencia.timestamp = new Date().toISOString();
        asistencia.fecha = new Date().toISOString().split('T')[0];
        asistencia.horaRegistro = new Date().toLocaleTimeString();
        
        data.asistenciaProfesores.push(asistencia);
        this.saveAllData(data);
        
        this.registrarActividad('Asistencia', `Profesor ${asistencia.nombreProfesor} registró asistencia`, 'success');
        
        return asistencia;
    }

    /**
     * Obtener asistencia de profesores
     */
    obtenerAsistenciaProfesores(filtros = {}) {
        const data = this.getAllData();
        let asistencias = data.asistenciaProfesores || [];
        
        // Aplicar filtros
        if (filtros.fecha) {
            asistencias = asistencias.filter(a => a.fecha === filtros.fecha);
        }
        
        if (filtros.profesor) {
            asistencias = asistencias.filter(a => a.nombreProfesor === filtros.profesor);
        }
        
        if (filtros.estado) {
            asistencias = asistencias.filter(a => a.estado === filtros.estado);
        }
        
        // Ordenar por fecha y hora descendente
        return asistencias.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Guardar un nuevo mensaje (alias de enviarMensaje para compatibilidad)
     */
    guardarMensaje(mensaje) {
        return this.enviarMensaje(mensaje);
    }

    /**
     * Enviar un mensaje
     */
    enviarMensaje(mensaje) {
        const data = this.getAllData();
        
        if (!data.mensajes) {
            data.mensajes = [];
        }
        
        mensaje.id = this.generateId('mensaje_');
        mensaje.timestamp = new Date().toISOString();
        mensaje.leido = false;
        
        data.mensajes.push(mensaje);
        this.saveAllData(data);
        
        this.registrarActividad('Mensajería', `Mensaje enviado de ${mensaje.de} a ${mensaje.para}`, 'success');
        
        console.log('✅ Mensaje guardado:', mensaje);
        return mensaje;
    }

    /**
     * Obtener mensajes de un usuario
     */
    obtenerMensajes(usuario, tipo = 'todos') {
        const data = this.getAllData();
        let mensajes = data.mensajes || [];
        
        // Filtrar por usuario
        mensajes = mensajes.filter(m => m.de === usuario || m.para === usuario);
        
        // Filtrar por tipo
        if (tipo === 'recibidos') {
            mensajes = mensajes.filter(m => m.para === usuario);
        } else if (tipo === 'enviados') {
            mensajes = mensajes.filter(m => m.de === usuario);
        }
        
        // Ordenar por fecha descendente
        return mensajes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Marcar mensaje como leído
     */
    marcarMensajeLeido(mensajeId) {
        const data = this.getAllData();
        const mensaje = data.mensajes?.find(m => m.id === mensajeId);
        
        if (mensaje) {
            mensaje.leido = true;
            mensaje.fechaLectura = new Date().toISOString();
            this.saveAllData(data);
            this.registrarActividad('Mensajería', `Mensaje ${mensajeId} marcado como leído`, 'info');
        }
        
        return mensaje;
    }

    /**
     * Guardar archivo compartido
     */
    guardarArchivo(archivo) {
        const data = this.getAllData();
        
        if (!data.archivos) {
            data.archivos = [];
        }
        
        archivo.id = this.generateId('archivo_');
        archivo.timestamp = new Date().toISOString();
        
        data.archivos.push(archivo);
        this.saveAllData(data);
        
        this.registrarActividad('Archivos', `Archivo ${archivo.nombre} compartido por ${archivo.de}`, 'success');
        
        return archivo;
    }

    /**
     * Obtener archivos de un usuario
     */
    obtenerArchivos(usuario, tipo = 'todos') {
        const data = this.getAllData();
        let archivos = data.archivos || [];
        
        // Filtrar por usuario
        archivos = archivos.filter(a => a.de === usuario || a.para === usuario);
        
        // Filtrar por tipo
        if (tipo === 'enviados') {
            archivos = archivos.filter(a => a.de === usuario);
        } else if (tipo === 'recibidos') {
            archivos = archivos.filter(a => a.para === usuario);
        }
        
        // Ordenar por fecha descendente
        return archivos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Obtener estadísticas de un profesor
     */
    obtenerEstadisticasProfesor(profesorUsername) {
        const data = this.getAllData();
        
        const excusas = data.excusas?.filter(e => e.profesor === profesorUsername) || [];
        const mensajes = data.mensajes?.filter(m => m.de === profesorUsername || m.para === profesorUsername) || [];
        const archivos = data.archivos?.filter(a => a.de === profesorUsername || a.para === profesorUsername) || [];
        
        return {
            totalExcusas: excusas.length,
            excusasPendientes: excusas.filter(e => e.estado === 'pendiente').length,
            mensajesRecibidos: mensajes.filter(m => m.para === profesorUsername).length,
            mensajesEnviados: mensajes.filter(m => m.de === profesorUsername).length,
            mensajesNoLeidos: mensajes.filter(m => m.para === profesorUsername && !m.leido).length,
            archivosRecibidos: archivos.filter(a => a.para === profesorUsername).length,
            archivosEnviados: archivos.filter(a => a.de === profesorUsername).length
        };
    }

    /**
     * Obtener detalles de un mensaje
     */
    obtenerDetallesMensaje(mensajeId) {
        const data = this.getAllData();
        return data.mensajes?.find(m => m.id === mensajeId) || null;
    }

    /**
     * Obtener detalles de un archivo
     */
    obtenerDetallesArchivo(archivoId) {
        const data = this.getAllData();
        return data.archivos?.find(a => a.id === archivoId) || null;
    }

    /**
     * Guardar un reporte de cafetería
     */
    guardarReporteCafeteria(reporte) {
        const data = this.getAllData();
        
        if (!data.reportesCafeteria) {
            data.reportesCafeteria = [];
        }
        
        reporte.id = this.generateId('cafeteria_');
        reporte.timestamp = new Date().toISOString();
        
        data.reportesCafeteria.push(reporte);
        this.saveAllData(data);
        
        this.registrarActividad('Cafetería', `Reporte ${reporte.tipo} generado por ${reporte.responsable}`, 'success');
        
        return reporte;
    }
    
    /**
     * Guardar un préstamo de cafetería
     */
    guardarPrestamo(prestamo) {
        const data = this.getAllData();
        
        if (!data.prestamosCafeteria) {
            data.prestamosCafeteria = [];
        }
        
        prestamo.id = this.generateId('prestamo_');
        prestamo.timestamp = new Date().toISOString();
        
        data.prestamosCafeteria.push(prestamo);
        this.saveAllData(data);
        
        this.registrarActividad('Cafetería', `Préstamo solicitado: ${prestamo.motivo} - $${prestamo.amount} por ${prestamo.solicitante}`, 'warning');
        
        return prestamo;
    }
    
    /**
     * Obtener préstamos de cafetería
     */
    obtenerPrestamosCafeteria(filtros = {}) {
        const data = this.getAllData();
        let prestamos = data.prestamosCafeteria || [];
        
        // Aplicar filtros si se proporcionan
        if (filtros.estado) {
            prestamos = prestamos.filter(p => p.estado === filtros.estado);
        }
        
        if (filtros.solicitante) {
            prestamos = prestamos.filter(p => p.solicitante === filtros.solicitante);
        }
        
        if (filtros.mes) {
            prestamos = prestamos.filter(p => {
                const fecha = new Date(p.timestamp);
                return fecha.getMonth() === filtros.mes;
            });
        }
        
        return prestamos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Limpiar todos los datos de prueba de cafetería
     */
    limpiarDatosCafeteria() {
        const data = this.getAllData();
        
        // Limpiar reportes y préstamos de cafetería
        data.reportesCafeteria = [];
        data.prestamosCafeteria = [];
        
        this.saveAllData(data);
        
        this.registrarActividad('Cafetería', 'Datos de prueba limpiados', 'warning');
        
        return { success: true, message: 'Datos de cafetería limpiados exitosamente' };
    }

    /**
     * Obtener reportes de cafetería
     */
    obtenerReportesCafeteria(filtros = {}) {
        const data = this.getAllData();
        let reportes = data.reportesCafeteria || [];
        
        // Aplicar filtros
        if (filtros.fechaInicio) {
            reportes = reportes.filter(r => new Date(r.fecha) >= new Date(filtros.fechaInicio));
        }
        
        if (filtros.fechaFin) {
            reportes = reportes.filter(r => new Date(r.fecha) <= new Date(filtros.fechaFin));
        }
        
        if (filtros.cajera) {
            reportes = reportes.filter(r => (r.cajera || r.responsable) === filtros.cajera);
        }
        
        if (filtros.estado) {
            reportes = reportes.filter(r => r.estado === filtros.estado);
        }
        
        return reportes.sort((a, b) => new Date(b.timestamp || b.fecha) - new Date(a.timestamp || b.fecha));
    }

    /**
     * Guardar un nuevo reporte
     */
    guardarReporte(reporte) {
        const data = this.getAllData();
        const nuevoReporte = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            ...reporte
        };
        
        data.reportes.push(nuevoReporte);
        this.saveAllData(data);
        
        // Asignar automáticamente a psicóloga si es necesario
        if (reporte.tipo === 'psicologico' && !reporte.psicologaAsignada) {
            this.asignarPsicologa(nuevoReporte.id);
        }
        
        this.registrarActividad('Reporte', `Nuevo reporte de ${reporte.autor}`, 'success');
        return nuevoReporte;
    }

    /**
     * Obtener todos los reportes
     */
    obtenerReportes(filtros = {}) {
        const data = this.getAllData();
        let reportes = data.reportes || [];
        
        // Aplicar filtros
        if (filtros.autor) {
            reportes = reportes.filter(r => r.autor === filtros.autor);
        }
        if (filtros.tipo) {
            reportes = reportes.filter(r => r.tipo === filtros.tipo);
        }
        if (filtros.fechaDesde) {
            reportes = reportes.filter(r => new Date(r.timestamp) >= new Date(filtros.fechaDesde));
        }
        if (filtros.fechaHasta) {
            reportes = reportes.filter(r => new Date(r.timestamp) <= new Date(filtros.fechaHasta));
        }
        
        return reportes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Obtener reportes asignados a una psicóloga
     */
    obtenerReportesPorPsicologa(psicologaUsername) {
        const data = this.getAllData();
        return data.reportes.filter(r => r.psicologaAsignada === psicologaUsername);
    }

    /**
     * Guardar una nueva excusa
     */
    guardarExcusa(excusa) {
        const data = this.getAllData();
        const nuevaExcusa = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            estado: 'pendiente',
            ...excusa
        };
        
        data.excusas.push(nuevaExcusa);
        this.saveAllData(data);
        
        // Asignar automáticamente a psicóloga
        this.asignarPsicologaExcusa(nuevaExcusa.id);
        
        this.registrarActividad('Excusa', `Nueva excusa de ${excusa.estudiante}`, 'warning');
        return nuevaExcusa;
    }

    /**
     * Obtener todas las excusas
     */
    obtenerExcusas(filtros = {}) {
        const data = this.getAllData();
        let excusas = data.excusas || [];
        
        // Aplicar filtros
        if (filtros.estudiante) {
            excusas = excusas.filter(e => e.estudiante === filtros.estudiante);
        }
        if (filtros.estado) {
            excusas = excusas.filter(e => e.estado === filtros.estado);
        }
        if (filtros.psicologaAsignada) {
            excusas = excusas.filter(e => e.psicologaAsignada === filtros.psicologaAsignada);
        }
        
        return excusas.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Guardar un caso de psicología
     */
    guardarCasoPsicologia(caso) {
        const data = this.getAllData();
        const nuevoCaso = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            estado: 'activo',
            ...caso
        };
        
        data.casosPsicologia.push(nuevoCaso);
        this.saveAllData(data);
        
        this.registrarActividad('Psicología', `Nuevo caso de ${caso.paciente}`, 'info');
        return nuevoCaso;
    }

    /**
     * Obtener casos de psicología
     */
    obtenerCasosPsicologia(filtros = {}) {
        const data = this.getAllData();
        let casos = data.casosPsicologia || [];
        
        // Aplicar filtros
        if (filtros.psicologa) {
            casos = casos.filter(c => c.psicologa === filtros.psicologa);
        }
        if (filtros.estado) {
            casos = casos.filter(c => c.estado === filtros.estado);
        }
        if (filtros.paciente) {
            casos = casos.filter(c => c.paciente === filtros.paciente);
        }
        
        return casos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Asignar automáticamente una psicóloga a un reporte
     */
    asignarPsicologa(reporteId) {
        const psicologas = [
            'psi_marta_rodriguez', 'psi_carolina_gomez', 'psi_ana_martinez',
            'psi_laura_perez', 'psi_claudia_hernandez', 'psi_patricia_lopez',
            'psi_sofia_garcia', 'psi_valentina_diaz', 'psi_camila_fernandez',
            'psi_isabella_torres', 'psi_maria_gonzalez', 'psi_elena_ramirez',
            'psi_carmen_sanchez'
        ];
        
        // Asignar aleatoriamente (en un sistema real sería por carga de trabajo)
        const psicologaAsignada = psicologas[Math.floor(Math.random() * psicologas.length)];
        
        const data = this.getAllData();
        const reporte = data.reportes.find(r => r.id === reporteId);
        if (reporte) {
            reporte.psicologaAsignada = psicologaAsignada;
            reporte.fechaAsignacion = new Date().toISOString();
            this.saveAllData(data);
        }
        
        return psicologaAsignada;
    }

    /**
     * Asignar automáticamente una psicóloga a una excusa
     */
    asignarPsicologaExcusa(excusaId) {
        return this.asignarPsicologa(excusaId); // Usar la misma lógica
    }

    /**
     * Registrar actividad en el sistema
     */
    registrarActividad(tipo, descripcion, nivel = 'info') {
        const data = this.getAllData();
        const actividad = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            tipo,
            descripcion,
            nivel,
            usuario: this.getCurrentUser()
        };
        
        data.actividadSistema.unshift(actividad); // Agregar al principio
        
        // Mantener solo las últimas 1000 actividades
        if (data.actividadSistema.length > 1000) {
            data.actividadSistema = data.actividadSistema.slice(0, 1000);
        }
        
        this.saveAllData(data);
        
        // Emitir evento para que otros componentes se actualicen
        if (window.eventBus) {
            window.eventBus.emit('actividad-registrada', actividad);
        }
    }

    /**
     * Obtener actividad reciente del sistema
     */
    obtenerActividadReciente(limite = 50) {
        const data = this.getAllData();
        return (data.actividadSistema || []).slice(0, limite);
    }

    /**
     * Guardar respuesta de psicóloga a excusa
     */
    guardarRespuestaExcusa(excusaId, respuesta) {
        const data = this.getAllData();
        const excusa = data.excusas.find(e => e.id === excusaId);
        
        if (excusa) {
            excusa.response = respuesta.texto;
            excusa.responseDate = new Date().toISOString();
            excusa.respondedBy = respuesta.psicologaUsername;
            excusa.estado = 'respondido';
            
            this.saveAllData(data);
            
            this.registrarActividad('Excusa', `Respuesta enviada por ${respuesta.psicologaName}`, 'success');
            
            // Emitir evento para notificar al docente
            if (window.eventBus) {
                window.eventBus.emit('respuesta-excusa-enviada', {
                    excusaId,
                    psicologa: respuesta.psicologaName,
                    docente: excusa.teacherUsername
                });
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * Obtener excusas asignadas a una psicóloga
     */
    obtenerExcusasPorPsicologa(psicologaUsername) {
        const data = this.getAllData();
        return data.excusas.filter(e => e.psychologistUsername === psicologaUsername);
    }

    /**
     * Obtener estadísticas generales del sistema
     */
    obtenerEstadisticasGenerales() {
        const data = this.getAllData();
        
        return {
            totalReportes: (data.reportes || []).length,
            totalExcusas: (data.excusas || []).length,
            totalCasosPsicologia: (data.casosPsicologia || []).length,
            totalMensajes: (data.mensajes || []).length,
            actividadHoy: this.obtenerActividadHoy().length,
            reportesPendientes: (data.reportes || []).filter(r => r.estado === 'pendiente').length,
            excusasPendientes: (data.excusas || []).filter(e => e.estado === 'pendiente').length,
            casosPendientes: (data.casosPsicologia || []).filter(c => c.estado === 'pendiente').length
        };
    }

    /**
     * Obtener actividad reciente
     */
    obtenerActividadReciente(limite = 50) {
        const data = this.getAllData();
        const actividad = data.actividadSistema || [];
        
        return actividad
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limite);
    }

    /**
     * Obtener actividad de hoy
     */
    obtenerActividadHoy() {
        const data = this.getAllData();
        const actividad = data.actividadSistema || [];
        const hoy = new Date().toDateString();
        
        return actividad.filter(a => 
            new Date(a.timestamp).toDateString() === hoy
        );
    }

    /**
     * Obtener detalles de una excusa
     */
    obtenerDetallesExcusa(excusaId) {
        const data = this.getAllData();
        return data.excusas?.find(e => e.id === excusaId) || null;
    }

    /**
     * Obtener excusas de un profesor
     */
    obtenerExcusasProfesor(profesorUsername) {
        const data = this.getAllData();
        return data.excusas?.filter(e => e.profesor === profesorUsername) || [];
    }

    /**
     * Limpiar datos antiguos
     */
    limpiarDatosAntiguos(dias = 30) {
        const data = this.getAllData();
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - dias);
        
        let eliminados = 0;
        
        // Limpiar actividad antigua
        if (data.actividadSistema) {
            const actividadOriginal = data.actividadSistema.length;
            data.actividadSistema = data.actividadSistema.filter(a => 
                new Date(a.timestamp) > fechaLimite
            );
            eliminados += actividadOriginal - data.actividadSistema.length;
        }
        
        this.saveAllData(data);
        this.registrarActividad('Sistema', `Limpieza de datos antiguos: ${eliminados} registros eliminados`, 'info');
        
        return eliminados;
    }

    /**
     * Exportar datos
     */
    exportarDatos() {
        const data = this.getAllData();
        const exportData = {
            ...data,
            exportadoEn: new Date().toISOString(),
            version: '1.0.0'
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Importar datos
     */
    importarDatos(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.version && data.exportadoEn) {
                // Validar estructura básica
                if (data.reportes && data.excusas && data.casosPsicologia) {
                    this.saveAllData({
                        reportes: data.reportes || [],
                        excusas: data.excusas || [],
                        casosPsicologia: data.casosPsicologia || [],
                        actividadSistema: data.actividadSistema || [],
                        usuarios: data.usuarios || [],
                        configuracion: data.configuracion || {
                            version: '1.0.0',
                            ultimaActualizacion: new Date().toISOString()
                        }
                    });
                    
                    this.registrarActividad('Sistema', 'Datos importados correctamente', 'success');
                    return true;
                }
            }
            
            throw new Error('Formato de datos inválido');
        } catch (error) {
            console.error('Error importando datos:', error);
            this.registrarActividad('Sistema', `Error importando datos: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Configurar evento de escucha
     */
    setupEventListeners() {
        // Escuchar cambios en localStorage para sincronización entre pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === 'sge_system_data') {
                this.notificarCambioDatos();
            }
        });
    }

    /**
     * Notificar cambios en los datos
     */
    notificarCambioDatos() {
        // Evento personalizado para notificar cambios
        if (typeof window.CustomEvent !== 'undefined') {
            const event = new CustomEvent('datosActualizados', {
                detail: { timestamp: Date.now() }
            });
            window.dispatchEvent(event);
        }
    }

    /**
     * Generar ID único
     */
    generateId(prefijo = '') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefijo}${timestamp}_${random}`;
    }

    // ==================== FUNCIONES DE CONTROL ADMINISTRATIVO ====================
    /**
     * Verificar si el usuario actual tiene permisos de administrador
     */
    verificarPermisosAdministrador() {
        const userData = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (!userData) return false;
        
        try {
            const user = JSON.parse(userData);
            return user.role === 'administrador' || user.role === 'admin' || user.role === 'director' || user.role === 'direccion';
        } catch (error) {
            console.error('Error verificando permisos:', error);
            return false;
        }
    }

    /**
     * Obtener datos de solo lectura para administradores
     * Permite revisar datos pero no modificarlos
     */
    obtenerDatosSoloLectura(tipoDato) {
        if (!this.verificarPermisosAdministrador()) {
            console.warn('Acceso denegado: Se requieren permisos de administrador');
            return null;
        }

        const data = this.getAllData();
        const datosSoloLectura = {
            ...data[tipoDato],
            _acceso: 'solo_lectura',
            _timestamp: new Date().toISOString(),
            _politica: 'Los datos fluyen como un río, solo se puede observar y corregir, no eliminar'
        };

        this.registrarActividadAdministrativa('lectura', tipoDato, 'Datos revisados en modo solo lectura');
        return datosSoloLectura;
    }

    /**
     * Modificar datos existentes (permitido para administradores)
     * No permite eliminar, solo corregir errores
     */
    modificarDatoExistente(tipoDato, id, correcciones) {
        if (!this.verificarPermisosAdministrador()) {
            console.warn('Acceso denegado: Se requieren permisos de administrador');
            return false;
        }

        const data = this.getAllData();
        const datos = data[tipoDato] || [];
        
        const indice = datos.findIndex(item => item.id === id);
        if (indice === -1) {
            console.warn('Dato no encontrado:', id);
            return false;
        }

        // Crear versión corregida preservando el original
        const datoOriginal = { ...datos[indice] };
        const datoCorregido = {
            ...datos[indice],
            ...correcciones,
            _modificadoPor: this.getCurrentUser()?.username || 'sistema',
            _fechaModificacion: new Date().toISOString(),
            _versionOriginal: datoOriginal,
            _motivoModificacion: correcciones._motivo || 'Corrección administrativa'
        };

        // Reemplazar el dato con la versión corregida
        datos[indice] = datoCorregido;
        data[tipoDato] = datos;

        this.guardarDatos(data);
        this.registrarActividadAdministrativa('modificacion', tipoDato, `Dato ${id} modificado: ${correcciones._motivo}`);
        
        console.log(`Dato ${id} modificado exitosamente`);
        return true;
    }

    /**
     * Agregar nota administrativa a un dato existente
     * Permite añadir observaciones sin modificar el dato original
     */
    agregarNotaAdministrativa(tipoDato, id, nota) {
        if (!this.verificarPermisosAdministrador()) {
            console.warn('Acceso denegado: Se requieren permisos de administrador');
            return false;
        }

        const data = this.getAllData();
        const datos = data[tipoDato] || [];
        
        const indice = datos.findIndex(item => item.id === id);
        if (indice === -1) {
            console.warn('Dato no encontrado:', id);
            return false;
        }

        // Agregar nota administrativa
        if (!datos[indice]._notasAdministrativas) {
            datos[indice]._notasAdministrativas = [];
        }

        datos[indice]._notasAdministrativas.push({
            id: this.generateId('nota_'),
            texto: nota,
            autor: this.getCurrentUser()?.username || 'sistema',
            fecha: new Date().toISOString(),
            tipo: 'observacion_administrativa'
        });

        data[tipoDato] = datos;
        this.guardarDatos(data);
        this.registrarActividadAdministrativa('nota', tipoDato, `Nota agregada al dato ${id}`);
        
        console.log(`Nota administrativa agregada al dato ${id}`);
        return true;
    }

    /**
     * Obtener historial de modificaciones administrativas
     */
    obtenerHistorialModificaciones(tipoDato, id = null) {
        if (!this.verificarPermisosAdministrador()) {
            console.warn('Acceso denegado: Se requieren permisos de administrador');
            return [];
        }

        const data = this.getAllData();
        const datos = data[tipoDato] || [];
        
        let modificaciones = [];
        
        if (id) {
            // Buscar modificaciones de un dato específico
            const dato = datos.find(item => item.id === id);
            if (dato && dato._versionOriginal) {
                modificaciones.push({
                    id: dato.id,
                    modificacion: dato,
                    original: dato._versionOriginal,
                    fecha: dato._fechaModificacion,
                    autor: dato._modificadoPor,
                    motivo: dato._motivoModificacion
                });
            }
        } else {
            // Buscar todas las modificaciones
            modificaciones = datos
                .filter(item => item._versionOriginal)
                .map(item => ({
                    id: item.id,
                    modificacion: item,
                    original: item._versionOriginal,
                    fecha: item._fechaModificacion,
                    autor: item._modificadoPor,
                    motivo: item._motivoModificacion
                }));
        }

        return modificaciones;
    }

    /**
     * Registrar actividad administrativa
     */
    registrarActividadAdministrativa(tipo, modulo, descripcion) {
        const actividad = {
            id: this.generateId('admin_'),
            tipo: 'actividad_administrativa',
            accion: tipo,
            modulo: modulo,
            descripcion: descripcion,
            autor: this.getCurrentUser()?.username || 'sistema',
            fecha: new Date().toISOString(),
            nivel: tipo === 'eliminacion_intentada' ? 'warning' : 'info'
        };

        const data = this.getAllData();
        data.actividadSistema = data.actividadSistema || [];
        data.actividadSistema.unshift(actividad);
        
        // Mantener solo las últimas 1000 actividades
        if (data.actividadSistema.length > 1000) {
            data.actividadSistema = data.actividadSistema.slice(0, 1000);
        }

        this.guardarDatos(data);
    }

    /**
     * Intentar eliminar dato (bloqueado - solo registra el intento)
     * Principio: Los datos no se eliminan, solo se corrigen
     */
    intentarEliminarDato(tipoDato, id) {
        if (!this.verificarPermisosAdministrador()) {
            console.warn('Acceso denegado: Se requieren permisos de administrador');
            return false;
        }

        // Registrar intento de eliminación pero no ejecutarla
        this.registrarActividadAdministrativa(
            'eliminacion_intentada', 
            tipoDato, 
            `INTENTO DE ELIMINACIÓN BLOQUEADO - Dato: ${id}. Política: Los datos fluyen como un río, no se pueden eliminar`
        );

        console.warn(`❌ ELIMINACIÓN BLOQUEADA - Dato ${id} del tipo ${tipoDato}`);
        console.warn('💡 Política del sistema: Los datos fluyen como un río, solo se puede observar y corregir, no eliminar');
        console.warn('📝 Use modificarDatoExistente() para corregir errores o agregarNotaAdministrativa() para añadir observaciones');
        
        return false;
    }

    /**
     * Obtener usuario actual
     */
    getCurrentUser() {
        const userData = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (!userData) return null;
        
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error);
            return null;
        }
    }

    /**
     * Validar integridad de datos
     */
    validarIntegridadDatos() {
        if (!this.verificarPermisosAdministrador()) {
            console.warn('Acceso denegado: Se requieren permisos de administrador');
            return false;
        }

        const data = this.getAllData();
        const reporte = {
            fecha: new Date().toISOString(),
            estado: 'valido',
            errores: [],
            advertencias: [],
            estadisticas: {}
        };

        // Validar estructura básica
        const tiposRequeridos = ['usuarios', 'excusas', 'mensajes', 'asistenciaProfesores', 'reportesCafeteria'];
        tiposRequeridos.forEach(tipo => {
            if (!data[tipo]) {
                reporte.errores.push(`Falta sección de datos: ${tipo}`);
            }
        });

        // Validar integridad de referencias
        if (data.excusas && data.usuarios) {
            data.excusas.forEach((excusa, index) => {
                if (!excusa.teacherUsername) {
                    reporte.advertencias.push(`Excusa ${index + 1} sin profesor asignado`);
                }
            });
        }

        // Estadísticas
        reporte.estadisticas = {
            totalUsuarios: data.usuarios ? data.usuarios.length : 0,
            totalExcusas: data.excusas ? data.excusas.length : 0,
            totalMensajes: data.mensajes ? data.mensajes.length : 0,
            totalAsistencia: data.asistenciaProfesores ? data.asistenciaProfesores.length : 0,
            totalReportesCafeteria: data.reportesCafeteria ? data.reportesCafeteria.length : 0
        };

        if (reporte.errores.length > 0) {
            reporte.estado = 'con_errores';
        }

        this.registrarActividadAdministrativa('validacion', 'sistema', `Validación de integridad: ${reporte.estado}`);
        return reporte;
    }
}

// Inicializar instancia global
window.systemDataManager = new SystemDataManager();

// Hacer disponible la clase también para instanciación
window.SystemDataManager = SystemDataManager;

// CORRECCIÓN: Forzar inicialización de datos
window.systemDataManager.initializeStorage();

// CORRECCIÓN: Verificar que los datos se cargaron correctamente
console.log('🔧 SystemDataManager inicializado');
console.log('📊 Usuarios cargados:', window.systemDataManager.getUsers().length);
const psicologas = window.systemDataManager.getUsers().filter(u => u.role === 'psicologa');
console.log('🧠 Psicólogas disponibles:', psicologas.length);

// Hacer disponible globalmente para compatibilidad
window.guardarReporte = (reporte) => window.systemDataManager.guardarReporte(reporte);
window.obtenerReportes = (filtros) => window.systemDataManager.obtenerReportes(filtros);
window.guardarExcusa = (excusa) => window.systemDataManager.guardarExcusa(excusa);
window.guardarMensaje = (mensaje) => window.systemDataManager.guardarMensaje(mensaje);
window.enviarMensaje = (mensaje) => window.systemDataManager.enviarMensaje(mensaje);
window.obtenerMensajes = (usuario, tipo) => window.systemDataManager.obtenerMensajes(usuario, tipo);
window.registrarActividadSistema = (tipo, descripcion, nivel) => window.systemDataManager.registrarActividad(tipo, descripcion, nivel);

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemDataManager;
}
