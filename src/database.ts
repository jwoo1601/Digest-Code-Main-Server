import mongoose, { Connection } from 'mongoose';
import winston, { Logger } from 'winston';

import { isProductionMode } from './systemQuery';
import { Logging } from './logging';

export interface IDatabaseInitOptions {
    dbName: string;
    host: string;
    username: string;
    password: string;
}

export class Database {
    private static dbName: string;
    private static host: string;
    private static username: string;
    private static password: string;
    private static connection: Connection;
    private static logger: Logger;

    static async init(options: IDatabaseInitOptions): Promise<Database> {
        this.logger = await Logging.createLogger('database/main');

        const { dbName, host, username, password } = options;
        if (!dbName || !host || !username || !password) {
            this.connection = null;
            this.logger.error(
                `Full Database Credentials are required for initialization`,
            );
            return this;
        }

        this.dbName = dbName;
        this.host = host;
        this.username = username;
        this.password = password;

        this.connection = await this.openConnection();
        if (this.connection) {
            this.logger.info(
                `Connection to Main Database Server: ${this.dbName} has been established`,
                {
                    db: this.connection.db,
                    host: this.host,
                    username: this.username,
                },
            );
        } else {
            this.logger.error(`Failed to retrieve Connection instance`, {
                dbName: this.dbName,
                host: this.host,
                username: this.username,
            });
        }

        return this;
    }

    private static async openConnection(): Promise<Connection> {
        try {
            return await mongoose.createConnection(
                `mongodb+srv://${this.username}:${this.password}@${this.host}/test?retryWrites=true&w=majority`,
                {
                    useNewUrlParser: true,
                    dbName: this.dbName,
                    autoIndex: isProductionMode(),
                    promiseLibrary: global.Promise,
                },
            );
        } catch (err) {
            this.logger.error(
                `Failed to connect to Remote Database {${this.host}}`,
                {
                    dbName: this.dbName,
                    host: this.host,
                    username: this.username,
                },
            );
        }

        return null;
    }

    static getName(): string {
        return this.dbName;
    }

    static getHost(): string {
        return this.host;
    }

    static getUsername(): string {
        return this.username;
    }

    static getPassword(): string {
        return this.password;
    }

    static getConnection(): Connection {
        return this.connection;
    }
}
