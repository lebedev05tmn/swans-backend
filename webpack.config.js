const path = require("path")
const app = require("./dist/app").app

module.exports = {
    target: "node",
    mode: process.env.NODE_ENV || "development",
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                include: path.resolve(__dirname, "src"),
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    devServer: {
        setupMiddlewares: (middlewares, devServer) => {
            devServer.app.use((req, res, next) => {
                app(req, res, next)
            })

            return middlewares
        },
        static: {
            directory: path.join(__dirname, "src"),
        },
        port: 3000,
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
}
