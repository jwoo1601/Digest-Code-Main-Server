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
const BUNDLE_OUTPUT_DIRECTORY_NAME = 'intermediate';
const BUNDLE_OUTPUT_DIRECTORY = `../${BUNDLE_OUTPUT_DIRECTORY_NAME}`;
const BUNDLE_FILE_NAME = 'digest-code-server.test.bundle.js'

module.exports = {
    mode: 'development',
    entry: ['./src/server.js'],
    devtool: 'inline-source-map',
    output: {
        path: path.join(__dirname, BUNDLE_OUTPUT_DIRECTORY),
        filename: BUNDLE_FILE_NAME
    },
    target: 'node',
    externals: [nodeExternals()],
    module: {
        rules: [{
            test: /\.test.ts$/,
            exclude: [/node_modules/, /intermediate/, /build/],
            use: {
                loader: 'ts-loader'
            }
        }, {
            test: /\.test.js$/,
            exclude: [/node_modules/, /intermediate/, /build/, /.*\.(production|development)\.js$/],
            use: {
                loader: 'babel-loader'
            }
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [TS_COMPILER_OUTPUT_DIRECTORY, BUNDLE_OUTPUT_DIRECTORY_NAME]
        }),
        new ProgressBarPlugin({
            format: `test build ${chalk.yellow(`v${metadata.version}`)} [${chalk.magenta(':bar')}] ${chalk.green.bold(':percent')} (${chalk.gray(':elapseds')})`,
            clear: false
        }),
        new webpack.DefinePlugin({
            SETUP_MODULE: "'./setup.development'"
        }),
        new webpack.ProvidePlugin({
            internals: './internals',
        }),
    ]
}