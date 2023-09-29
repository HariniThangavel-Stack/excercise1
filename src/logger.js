import dotenv from 'dotenv';
import winston from 'winston';
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf } = format;

dotenv.config();

const myFormat = printf(({ level, message, timestamp}) => `${timestamp} [${level}] : ${message} `);

export const logger = createLogger({
    level: process.env.LOG_LEVEL,
    format: combine(
        format.colorize(),
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.Console({ level: process.env.LOG_LEVEL })
    ]
});