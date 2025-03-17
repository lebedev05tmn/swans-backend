const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    target: 'node', // Убедитесь, что цель — Node.js
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
            {
                test: /\.html$/,
                use: 'html-loader',
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
    externals: {
        sharp: 'commonjs sharp',
        _http_common: 'commonjs _http_common', 
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                './node_modules/swagger-ui-dist/swagger-ui.css',
                './node_modules/swagger-ui-dist/swagger-ui-bundle.js',
                './node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js',
                './node_modules/swagger-ui-dist/favicon-16x16.png',
                './node_modules/swagger-ui-dist/favicon-32x32.png',
            ],
        }),
    ],
};
