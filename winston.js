import winston from 'winston'

const logger = winston.createLogger({
  level: 'silly', // Set the log level to 'silly'
  transports: [
    new winston.transports.Console()
    // Add other transports as needed
  ]
})

export { logger }
