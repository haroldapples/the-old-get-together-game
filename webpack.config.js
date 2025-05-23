const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Function to sanitize filenames
const sanitizeFilename = (filename) => {
    return filename
        .replace(/\s+/g, '') // Remove spaces
        .replace(/[^a-zA-Z0-9.]/g, '') // Remove special characters
        .toLowerCase(); // Convert to lowercase
};

// Determine if we're in GitHub Pages environment
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
const repoName = 'the-old-get-together-game';

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        publicPath: isGitHubPages ? `/${repoName}/` : '/',
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
                        const filename = sanitizeFilename(path.basename(pathData.filename));
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
                        let html = content.toString();
                        // Update all asset references to use the sanitized names and correct public path
                        html = html.replace(/src="[^"]+"/g, (match) => {
                            // Don't modify CDN URLs
                            if (match.includes('cdn.jsdelivr.net')) {
                                return match;
                            }
                            // Extract filename and sanitize
                            const filename = match.match(/[^/"]+\.[^"]+$/)?.[0];
                            if (filename) {
                                const sanitized = sanitizeFilename(filename);
                                const basePath = isGitHubPages ? `/${repoName}/` : '/';
                                if (filename === 'bundle.js') {
                                    return `src="${basePath}bundle.js"`;
                                }
                                return `src="${basePath}assets/${sanitized}"`;
                            }
                            return match;
                        });
                        return html;
                    }
                },
                {
                    from: 'Assets',
                    to: 'assets',
                    globOptions: {
                        ignore: ['**/.DS_Store']
                    }
                }
            ]
        })
    ]
}; 