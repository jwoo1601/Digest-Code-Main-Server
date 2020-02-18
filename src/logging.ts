import winston, { createLogger, transports, format, Logger } from 'winston';
import dateformat from 'dateformat';

import { isProductionMode, isDevelopmentMode } from './systemQuery';
import { WriteStream } from 'fs';

export interface ILoggerCreationOptions {
    applyColor: boolean;
    showCategory: boolean;
    showTimestamp: boolean;
    formatJSON: boolean;
    interpolate: boolean;
}

export interface IChildLoggerCreationOptions extends ILoggerCreationOptions {
    loggingLevelOverride?: string;
}

export class Logging {
    private static defaultLoggingLevel: string = 'info';

    static setDefaultLoggingLevel(level: string) {
        this.defaultLoggingLevel = level;
    }

    static getDefaultLoggingLevel(): string {
        return this.defaultLoggingLevel;
    }

    static async createLogger(
        category: string,
        loggingLevel: string = this.defaultLoggingLevel,
        options?: ILoggerCreationOptions,
    ): Promise<Logger> {
        const displayOptions = options || {
            applyColor: true,
            showCategory: true,
            showTimestamp: true,
            formatJSON: false,
            interpolate: false,
        };

        const {
            combine,
            timestamp,
            label,
            printf,
            colorize,
            json,
            splat,
        } = format;
        const logFormat = printf(
            ({ level, message, label, timestamp }) =>
                `${displayOptions.showTimestamp ? `@${timestamp} ` : ''}${
                    displayOptions.showCategory ? `<${label}> ` : ''
                }[${level}] ${message}`,
        );
        const timestampFormat = 'YYYY-MM-DD HH:mm:ss:SS';
        let consoleFormatter = combine(
            label({
                label: category,
            }),
            timestamp({
                format: timestampFormat,
            }),
            logFormat,
        );
        let fileFormatter = Object.create(consoleFormatter);
        if (displayOptions.applyColor) {
            consoleFormatter = combine(colorize(), consoleFormatter);
        }
        if (displayOptions.formatJSON) {
            fileFormatter = combine(fileFormatter, json());
        }
        if (displayOptions.interpolate) {
            consoleFormatter = combine(consoleFormatter, splat());
            fileFormatter = combine(fileFormatter, splat());
        }

        let loggerTransports = [];
        if (isProductionMode()) {
            loggerTransports.push(
                new (require('winston-azure-application-insights').AzureApplicationInsightsLogger)(
                    {
                        format: fileFormatter,
                    },
                ),
            );
        } else {
            loggerTransports.push(
                new transports.Console({
                    format: consoleFormatter,
                }),
            );

            if (isDevelopmentMode()) {
                loggerTransports.push(
                    new transports.File({
                        format: fileFormatter,
                        filename: `dev-server-${dateformat(
                            new Date(),
                            'yyyy-mm-dd',
                        )}.log`,
                        dirname: 'logs',
                    }),
                );
            }
        }

        return winston.loggers.add(category, {
            transports: loggerTransports,
            level: loggingLevel,
        });
    }

    static getLogger(category: string): Logger {
        return winston.loggers.get(category);
    }

    static async getOrCreateLogger(
        category: string,
        loggingLevel?: string,
        options?: ILoggerCreationOptions,
    ): Promise<Logger> {
        return winston.loggers.has(category)
            ? this.getLogger(category)
            : await this.createLogger(category, loggingLevel, options);
    }

    static async getLoggerAsWritableStream(
        category: string,
        loggingLevel?: string,
        options?: ILoggerCreationOptions,
    ): Promise<WriteStream> {
        const logger = await this.createLogger(category, loggingLevel, options);
        return {
            write(text: string) {
                logger.info(text);
            },
        } as WriteStream;
    }
}
