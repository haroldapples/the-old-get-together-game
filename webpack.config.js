const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: './'
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
                    transform(content) {
                        return content
                            .toString()
                            .replace('src="/bundle.js"', 'src="./bundle.js"');
                    }
                },
                { 
                    from: 'Assets',
                    to: 'assets',
                    noErrorOnMissing: true
                },
                { 
                    from: 'assets',
                    to: 'assets',
                    noErrorOnMissing: true
                }
            ],
        }),
    ],
}; 