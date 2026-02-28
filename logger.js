const winston = require('winston');
//para rotar los logs y que no se almacenen innecesariamente
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: 'info', // Nivel mínimo que capturará
  format: winston.format.json(), // Formato por defecto
  transports: [
    // Guarda todo (info, warn, error) pero rotando cada día
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Comprime los archivos viejos para ahorrar espacio
      maxSize: '20m',      // Si el archivo llega a 20MB, crea otro el mismo día
      maxFiles: '14d'      // Mantiene solo los últimos 14 días
    }),

    // ESTE SE QUEDA
    // Es tu "acceso rápido" para ver solo lo que falló sin buscar entre los info
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
  ],
});

// Si no estamos en producción, también mostramos en consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;