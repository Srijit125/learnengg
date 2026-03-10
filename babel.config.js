module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }], // Example preset
      'nativewind/babel', // Example NativeWind inclusion
    ],
    plugins: [
      'transform-import-meta',
      'react-native-reanimated/plugin', // Must be listed last
    ],
  };
};