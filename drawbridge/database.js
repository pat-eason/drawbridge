/**
 * Load modules
 */
const mysql     = require('mysql');
const squel     = require('squel');

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

var getPrimaryKey = (table) => {
    return _.find(schema[table], function(o){
        return o.Key == 'PRI';
    }).Field;
}

var getRelationships = (table, relationships, record, next) => {
    if(record){
        relationships = relationships.split(',');
        var relationships_object = {};
        var i = 1;
        _.forEach(relationships, (relationship) => {
            if(record[relationship]){
                var primary_key = getPrimaryKey(table);
                var query = squel.select()
                                 .from(table)
                                 .where(`${primary_key} = ?`, record[relationship]);
                connection.query( query.toString(), function(err, rows, fields){
                        if(err){
                            res.status(500).send(err);
                            throw err;
                        }
                        var row = rows[0];

                        if(row){
                            relationships_object[relationships] = row;
                        }else{
                            relationships_object[relationships] = null;
                        }

                        return next(relationships_object);
                        $i++;
                    }
                );
            }else{
                relationships_object[relationships] = null;
            }
        });
    }else{
        return next(null);
    }
}

/**
 * Module
 */
module.exports = {
    schema      : schema,
    connection  : connection,
    init        : init,
    connect     : connect,
    getDBInfo   : getDBInfo,
    getRelationships : getRelationships
}
