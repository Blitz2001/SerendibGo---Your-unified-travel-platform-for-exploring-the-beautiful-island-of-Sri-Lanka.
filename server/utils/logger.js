const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level (can be set via environment variable)
const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] || LOG_LEVELS.INFO;

// Log file paths
const logFiles = {
  error: path.join(logsDir, 'error.log'),
  combined: path.join(logsDir, 'combined.log'),
  access: path.join(logsDir, 'access.log')
};

// Helper function to format log message
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level}: ${message}${metaString}\n`;
};

// Helper function to write to file
const writeToFile = (filePath, message) => {
  fs.appendFileSync(filePath, message, 'utf8');
};

// Logger class
class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // Log error messages
  error(message, meta = {}) {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      const logMessage = formatLogMessage('ERROR', message, meta);
      
      // Always log errors to console in development
      if (!this.isProduction) {
        console.error(logMessage.trim());
      }
      
      // Write to error log file
      writeToFile(logFiles.error, logMessage);
      writeToFile(logFiles.combined, logMessage);
    }
  }

  // Log warning messages
  warn(message, meta = {}) {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      const logMessage = formatLogMessage('WARN', message, meta);
      
      if (!this.isProduction) {
        console.warn(logMessage.trim());
      }
      
      writeToFile(logFiles.combined, logMessage);
    }
  }

  // Log info messages
  info(message, meta = {}) {
    if (currentLogLevel >= LOG_LEVELS.INFO) {
      const logMessage = formatLogMessage('INFO', message, meta);
      
      if (!this.isProduction) {
        console.log(logMessage.trim());
      }
      
      writeToFile(logFiles.combined, logMessage);
    }
  }

  // Log debug messages
  debug(message, meta = {}) {
    if (currentLogLevel >= LOG_LEVELS.DEBUG) {
      const logMessage = formatLogMessage('DEBUG', message, meta);
      
      if (!this.isProduction) {
        console.log(logMessage.trim());
      }
      
      writeToFile(logFiles.combined, logMessage);
    }
  }

  // Log HTTP requests
  access(req, res, responseTime) {
    const logMessage = formatLogMessage('ACCESS', `${req.method} ${req.url} ${res.statusCode}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      responseTime: `${responseTime}ms`
    });
    
    writeToFile(logFiles.access, logMessage);
  }

  // Log database operations
  db(operation, collection, duration, meta = {}) {
    const logMessage = formatLogMessage('DB', `${operation} on ${collection}`, {
      duration: `${duration}ms`,
      ...meta
    });
    
    writeToFile(logFiles.combined, logMessage);
  }

  // Log authentication events
  auth(event, userId, meta = {}) {
    const logMessage = formatLogMessage('AUTH', event, {
      userId,
      ...meta
    });
    
    writeToFile(logFiles.combined, logMessage);
  }

  // Log payment events
  payment(event, amount, currency, meta = {}) {
    const logMessage = formatLogMessage('PAYMENT', event, {
      amount,
      currency,
      ...meta
    });
    
    writeToFile(logFiles.combined, logMessage);
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
