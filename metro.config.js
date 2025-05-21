const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Customize Metro to handle non-ASCII characters in project paths
config.server = config.server || {};
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    // Clean up X-React-Native-Project-Root header before it's set
    const originalSetHeader = res.setHeader;
    res.setHeader = function(name, value) {
      if (name === 'X-React-Native-Project-Root') {
        // Use a relative path or encode to ASCII-safe characters
        value = path.relative(process.cwd(), __dirname);
      }
      return originalSetHeader.call(this, name, value);
    };
    return middleware(req, res, next);
  };
};

module.exports = config; 