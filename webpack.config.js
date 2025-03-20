const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node',
    mode: 'production',
    entry: './src/app.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    externals: [nodeExternals()],
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /^pg-native$|^pg$/,
        }),

        new CopyWebpackPlugin({
            patterns: [
                './node_modules/swagger-ui-dist/swagger-ui.css',
                './node_modules/swagger-ui-dist/swagger-ui-bundle.js',
                './node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js',
                './node_modules/swagger-ui-dist/favicon-16x16.png',
                './node_modules/swagger-ui-dist/favicon-32x32.png',

                { from: 'ormconfig.json', to: 'ormconfig.json' },

                { from: 'src/migrations', to: 'migrations' },
            ],
        }),
    ],
    optimization: {
        minimize: false,
    },
};
