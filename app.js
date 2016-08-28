/**
 * Load node modules
 *  > npm modules
 *     > custom modules
 */
const http      = require('http');
const _         = require('lodash');
const mysql     = require('mysql');
const express   = require('express');
const squel     = require('squel');
const bodyParser = require('body-parser')

/**
 * Load config
 */
const config = require('./config.json');

/**
 * Set server vars
 */
const hostname = config.hostname;
const port = config.port;

var app = express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var connection = mysql.createConnection(config.db);
var db_tables = {};
connection.connect();

function getDBInfo(callback){
    connection.query('SHOW TABLES', function(err, table_rows, fields){
      if(err)
        throw err;
        var i=1;
        _.each(table_rows, function(row){
            var table = row[`Tables_in_${config.db.database}`];
            var columns = [];
            connection.query(`DESCRIBE ${table}`, function(err, rows, fields){
                if(err)
                    throw err;
                db_tables[table] = rows;
                if(i==table_rows.length){
                    console.log('calling callback');
                    callback();
                }
                i++;
            });
        });
    });
}

function createRoutes(){
    _.forEach(db_tables, function(value, table){
        //get all
        console.log(`GET /${table}`);
        app.get(`/${table}`, function(req, res){
            var query = squel.select()
                             .from(table);
            connection.query( query.toString(), function(err, rows, fields){
                    if(err){
                        res.status(500).send(err);
                        throw err;
                    }
                    res.send(rows);
                }
            );
        });

        //get single
        console.log(`GET /${table}/:record_id`);
        app.get(`/${table}/:record_id`, function(req, res){
            var record_id = req.params.record_id;
            var query = squel.select()
                             .from(table)
                             .where('id = ?', record_id);
            connection.query( query.toString(), function(err, rows, fields){
                    if(err){
                        res.status(500).send(err);
                        throw err;
                    }
                    var row = rows[0];
                    if(row){
                        res.send(row);
                    }else{
                        res.send(null);
                    }
                }
            );
        });

        //create
        console.log(`POST /${table}`);
        app.post(`/${table}`, function(req, res){
            var query = squel.insert()
                             .into(table);
            var data = req.body;
            var insert_data = cullData(table, data);
            if(insert_data){
                _.forEach(insert_data, function(v, k){
                    query.set(k, v);
                });
                connection.query( query.toString(), function(err, rows, fields){
                        if(err){
                            res.status(500).send(err);
                            throw err;
                        }
                        res.send({id:rows.insertId});
                    }
                )
            }else{
                res.send(null);
            }
        });

        //update
        console.log(`PUT /${table}/:record_id`);
        app.put(`/${table}/:record_id`, function(req, res){
            var record_id = req.params.record_id;
            var query = squel.update()
                             .table(table)
                             .where('id = ?', record_id);
            var data = req.body;
            var insert_data = cullData(table, data);
            if(insert_data){
                _.forEach(insert_data, function(v, k){
                    query.set(k, v);
                });
                connection.query( query.toString(), function(err, rows, fields){
                        if(err){
                            res.status(500).send(err);
                            throw err;
                        }
                        res.send(true);
                    }
                )
            }else{
                res.send(null);
            }
        });

        //delete
        console.log(`DELETE /${table}/:record_id`);
        app.delete(`/${table}/:record_id`, function(req, res){
            var record_id = req.params.record_id;
            var query = squel.delete()
                             .from(table)
                             .where('id = ?', record_id);
            connection.query( query.toString(), function(err, rows, fields){
                    if(err){
                        res.status(500).send(err);
                        throw err;
                    }
                    res.send(true);
                }
            )
        });

    });

    app.listen(port, function () {
      console.log(`REST API listening on port ${port}`);
    });
}

function cullData(table, data){
    var insert_data = {};
    _.forEach(data, function(value, key){
        //cull out keys that aren't in db schema
        _.forEach(db_tables[table], function(v,k){
            if(key == v.Field){
                insert_data[key] = value;
                return;
            }
        });
    });
    return insert_data;
}

/**
 * Build the application
 */
getDBInfo(createRoutes);
