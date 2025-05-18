const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        assetModuleFilename: 'assets/[name][ext]'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif|mp3)$/i,
                type: 'asset/resource',
                generator: {
                    filename: (pathData) => {
                        // Remove spaces and special characters from filename
                        const filename = path.basename(pathData.filename)
                            .replace(/[^a-zA-Z0-9.]/g, '')
                            .toLowerCase();
                        return `assets/${filename}`;
                    }
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'index.html',
                    transform(content) {
                        return content
                            .toString()
                            .replace(/src="\/bundle\.js"/g, 'src="bundle.js"')
                            .replace(/src="\/Assets\//gi, 'src="assets/')
                            .replace(/src="Assets\//gi, 'src="assets/')
                            .replace(/src="\.\/Assets\//gi, 'src="assets/');
                    }
                },
                {
                    from: 'Assets',
                    to: 'assets',
                    globOptions: {
                        ignore: ['**/.DS_Store']
                    },
                    transform: (content, path) => {
                        // Don't transform binary files
                        if (/\.(png|jpg|jpeg|gif|mp3)$/i.test(path)) {
                            return content;
                        }
                        return content;
                    }
                }
            ]
        })
    ]
}; 