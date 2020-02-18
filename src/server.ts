import express, { Application } from 'express';
import bodyParser from 'body-parser';
import commander from 'commander';
import { Logger } from 'winston';
import passport from 'passport';
import exphbs from 'express-handlebars';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import methodOverride from 'method-override';
import dotenv from 'dotenv';

import { version } from '../package.json';
import { Logging } from './logging';
import { Database } from './database';
import { database } from './credentials';
import { isDevelopmentMode, isProductionMode } from './systemQuery';
import { AuthenticationService } from './internals/authentication';
import { OAuth2Service } from './internals/auth.oauth2';
import InitStrategies from './passport/passport.init';

export class Server {
    private static logger: Logger;
    private static app: Application;
    private static serverProtocol: string;
    private static serverHost: string;
    private static serverPort: number;

    static getLogger(): Logger {
        return Server.logger;
    }

    static get version(): string {
        return version;
    }

    static get host(): string {
        return Server.serverHost;
    }

    static get port(): number {
        return Server.serverPort;
    }

    static get url(): string {
        return `${Server.serverProtocol}//${Server.serverHost}`;
    }

    private static loadEnvironmentVariables() {
        dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });
    }

    private static parseConfigurations() {
        config({
            debug: isDevelopmentMode(),
        });
    }

    private static parseOptions() {
        commander
            .version(version, '-v, --version')
            .option('-V, --verbose', 'logs verbosely')
            .option('-p, --port <port>', 'sets the server port to listen on')
            .option(
                '--static-path <path>',
                'sets the path from which static resources are served',
            )
            .option(
                '--api-version <version>',
                'sets the api version to be used',
            )
            .parse(process.argv);
    }

    static hasServerOption(optionName: string) {
        return commander.hasOwnProperty(optionName);
    }

    static getServerOption(optionName: string) {
        return commander[optionName];
    }

    private static listAvailableOptions(): string[] {
        const options = [];

        if (this.hasServerOption('verbose')) {
            options.push(`verbose=true`);
        }
        if (this.hasServerOption('port')) {
            options.push(`port=${this.getServerOption('port')}`);
        }
        if (this.hasServerOption('staticPath')) {
            options.push(`static-path=${this.getServerOption('staticPath')}`);
        }
        if (this.hasServerOption('apiVersion')) {
            options.push(`api-version=${this.getServerOption('apiVersion')}`);
        }

        return options;
    }

    private static async initExpressServer() {
        this.app = express();
        this.app
            .use(
                express.static(
                    path.join(
                        __dirname,
                        this.hasServerOption('staticPath')
                            ? this.getServerOption('staticPath')
                            : 'views',
                    ),
                ),
            )
            .set('views', path.join(process.cwd(), 'views')) //, 'views'))
            .use(bodyParser.urlencoded({ extended: true }))
            .use(bodyParser.json())
            .use(methodOverride('_method'))
            .use(passport.initialize())
            .use(cookieParser())
            .engine('.hbs', exphbs({ extname: '.hbs' }))
            .set('view engine', '.hbs')
            .use(
                morgan('combined', {
                    stream: await Logging.getLoggerAsWritableStream('route'),
                }),
            );

        const { RouteManager } = require('./routes/routeManager');
        RouteManager.installRoutes(this.app);
    }

    static async init() {
        this.loadEnvironmentVariables();
        this.parseConfigurations();
        this.parseOptions();

        this.serverProtocol = process.env.DIGEST_CODE_PROTOCOL;
        this.serverHost = process.env.DIGEST_CODE_HOST;
        this.serverPort = this.hasServerOption('port')
            ? Number.parseInt(this.getServerOption('port'))
            : Number.parseInt(process.env.PORT) || 80;

        if (this.hasServerOption('verbose')) {
            Logging.setDefaultLoggingLevel('verbose');
        }
        this.logger = await Logging.createLogger('server');
        this.logger.info(`******* Digest Code Main Server v${version} *******`);
        this.logger.info('Startup logging initialized');

        const serverOptions = this.listAvailableOptions();
        this.logger.info(`Server startup options: ${serverOptions.join(', ')}`);

        await Database.init({ ...database.main });
        this.logger.info('Database initialized');

        await AuthenticationService.init();
        this.logger.info('Authentication service initialized');

        await OAuth2Service.init();
        this.logger.info('OAuth2 authorization service initialized');

        InitStrategies();
        this.logger.info('Passport strategies initialized');

        await this.initExpressServer();
        this.logger.info('Express application initialized');

        this.logger.info('Server initialization complete');
    }

    static start() {
        console.log('First');
        this.app.listen(this.serverPort, () => {
            this.logger.info(
                `Digest Code Main Server started and listening on ${this.serverHost}:${this.serverPort}`,
            );
        });
    }
}

async function main() {
    await Server.init();
    Server.start();
}

main();
