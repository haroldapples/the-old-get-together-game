const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: './',
        clean: true
    },
    devServer: {
        static: {
            directory: path.join(__dirname, '/'),
        },
        compress: true,
        port: 3000,
        hot: true
    },
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif|mp3)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[name][ext]'
                }
            }
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { 
                    from: 'index.html',
                    to: 'index.html',
                    transform(content) {
                        return content
                            .toString()
                            .replace(/src="\/bundle\.js"/g, 'src="./bundle.js"')
                            .replace(/src="\/Assets\//gi, 'src="./assets/')
                            .replace(/src="Assets\//gi, 'src="./assets/')
                            .replace(/src="\.\/Assets\//gi, 'src="./assets/');
                    }
                },
                { 
                    from: 'Assets',
                    to: 'assets',
                    noErrorOnMissing: true,
                    globOptions: {
                        caseSensitiveMatch: false,
                        ignore: ['**/.DS_Store']
                    }
                }
            ],
        }),
    ],
}; 