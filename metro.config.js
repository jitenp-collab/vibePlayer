const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'jsmediatags') {
        // jsmediatags' package.json "main" field points at dist/jsmediatags.js,
        // which doesn't actually exist in the published package (known unfixed bug).
        // Force it to use the real CommonJS build instead.
        return {
          filePath: require.resolve('jsmediatags/build2/jsmediatags.js'),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);