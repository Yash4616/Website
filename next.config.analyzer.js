// next.config.analyzer.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const baseConfig = require('./next.config.js');

module.exports = withBundleAnalyzer(baseConfig);