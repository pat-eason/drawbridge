/**
 * Load modules
 */
const mysql     = require('mysql');

var schema      = {};
var connection;

/**
 * Init
 */
var init = (next) => {
    connect( () => {           //connect
        getDBInfo( () => {     //config db schema
            typeof next === 'function' && next();             //trigger next step
        });
    });
};


/**
 * Create connection to database
 */
var connect = (next) => {
    module.exports.connection = connection = mysql.createConnection(config.db);
    connection.connect( (err) => {
      if(err)
        throw err;
      typeof next === 'function' && next();   //trigger next step
    });
}

/**
 * Get database tables and columns
 */
var getDBInfo = (next) => {
    connection.query('SHOW TABLES', (err, table_rows, fields) => {
      if(err)
        throw err;
        var i=1;
        _.each(table_rows, (row) => {
            var table = row[`Tables_in_${config.db.database}`];
            var columns = [];
            connection.query(`DESCRIBE ${table}`, function(err, rows, fields){
                if(err)
                    throw err;
                schema[table] = rows;
                if(i==table_rows.length){
                    typeof next === 'function' && next();     //trigger next step
                }
                i++;
            });
        });
    });
}

/**
 * Module
 */
module.exports = {
    schema      : schema,
    connection  : connection,
    init        : init,
    connect     : connect,
    getDBInfo   : getDBInfo
}
