const webpack = require('webpack');
const path = require('path');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const nodeExternals = require("webpack-node-externals");
const chalk = require('chalk');
const metadata = require('../package.json');

const TS_COMPILER_OUTPUT_DIRECTORY = '../src/ts-compiled';
const BUNDLE_OUTPUT_DIRECTORY_NAME = 'build';
const BUNDLE_OUTPUT_DIRECTORY = `../${BUNDLE_OUTPUT_DIRECTORY_NAME}`;
const BUNDLE_FILE_NAME = 'digest-code-server.bundle.js';

module.exports = {
    mode: 'production',
    entry: ['./src/server.ts'],
    output: {
        path: path.join(__dirname, BUNDLE_OUTPUT_DIRECTORY),
        filename: BUNDLE_FILE_NAME
    },
    target: 'node',
    node: {
        __dirname: false,
        __filename: false
    },
    externals: [nodeExternals()],
    module: {
        rules: [{
            test: /\.ts$/,
            exclude: [/node_modules/, /intermediate/, /build/],
            use: {
                loader: 'ts-loader'
            }
        }, {
            test: /\.js$/,
            exclude: [/node_modules/, /intermediate/, /build/, /.*\.(deveolpment|test)\.js$/],
            use: {
                loader: 'babel-loader'
            }
        }]
    },
    optimization: {
        minimize: true
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [TS_COMPILER_OUTPUT_DIRECTORY, BUNDLE_OUTPUT_DIRECTORY_NAME]
        }),
        new ProgressBarPlugin({
            format: `production build ${chalk.yellow(`v${metadata.version}`)} [${chalk.magenta(':bar')}] ${chalk.green.bold(':percent')} (${chalk.gray(':elapseds')})`,
            clear: false
        }),
        new webpack.DefinePlugin({
            SETUP_MODULE: "'./setup.production'"
        }),
        new webpack.ProvidePlugin({
            
        }),
    ]
}