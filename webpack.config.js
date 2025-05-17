const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        clean: true
    },
    mode: 'development',
    devServer: {
        static: {
            directory: path.join(__dirname, './'),
        },
        port: 3000,
        open: true,
        hot: true,
        liveReload: true,
        client: {
            overlay: {
                errors: true,
                warnings: false
            },
            progress: true
        },
        headers: {
            "Content-Security-Policy": "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; object-src 'self'"
        }
    },
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif|mp3)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name][ext]'
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    performance: {
        hints: false
    }
}; 