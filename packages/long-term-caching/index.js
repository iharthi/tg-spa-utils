'use strict';


const defaultOptions = {
    runtimeChunk: 'single',
};


module.exports = function razzleLongTermCaching(baseConfig, env, webpack, baseOptions) {
    const { target, dev } = env;

    // Clone base config & options
    const options = Object.assign({}, baseOptions, defaultOptions);
    const config = Object.assign({optimization: {}}, baseConfig);

    const getFilename = ext => dev ? `static/${ext}/[name].${ext}` : `static/${ext}/[name].[contenthash:16].${ext}`;

    // Target only web
    if (target === 'web') {
        config.output.filename = getFilename('js');

        config.optimization = {
            // Copy base values
            ...config.optimization,

            // And overwrite what we want
            splitChunks: {
                chunks: 'all',
                name: false,

                cacheGroups: {
                    default: false,
                    vendors: { // Override default vendors configuration
                        name: 'vendors',
                        test: /node_modules/,  // Include all assets in node_modules directory
                        reuseExistingChunk: true,
                        enforce: true,
                        chunks: 'all', // Use both async and non-async
                        minChunks: 1, // If module is used, they should end up in this chunk
                        priority: 100, // Vendors chunk has priority for node_module assets
                    },
                },
            },
        };

        config.optimization.runtimeChunk = options.runtimeChunk;
    }

    // Do some stuff...
    return config;
};
