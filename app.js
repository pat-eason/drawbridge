/**
 * Load node modules
 *  > npm modules
 *     > custom modules
 */
GLOBAL._ = require('lodash');

/**
 * Load config
 */
GLOBAL.config = require('./config.json');

/**
 * Get Drawbridge instantiation module
 */
const drawbridge = require('./drawbridge/drawbridge');

/**
 * Start application
 */
drawbridge.start();
