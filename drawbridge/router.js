const database  = require('./database.js');
const validation= require('./validation.js');
const squel     = require('squel');

/**
 * Set server vars
 */
const hostname  = config.hostname;
const port      = config.port;

/**
 * Express and dependencies
 */
const express   = require('express');
const bodyParser= require('body-parser');
var app;


/**
 * Init
 */
var init = (next) => {
    app = express();
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true
    }));
    createRoutes( () => {
        typeof next === 'function' && next(); //trigger next step
    });
}


/**
 * Create routes from database info
 */
var createRoutes = (next) => {
    _.forEach(database.schema, function(value, table){
        //get all
        console.log(`GET /${table}`);
        app.get(`/${table}`, function(req, res){
            var query = squel.select()
                             .from(table);
            database.connection.query( query.toString(), function(err, rows, fields){
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
            var relationships = req.query.relations;
            var query = squel.select()
                             .from(table)
                             .where('id = ?', record_id);
            database.connection.query( query.toString(), function(err, rows, fields){
                    if(err){
                        res.status(500).send(err);
                        throw err;
                    }
                    var row = rows[0];

                    if(row){
                        if(relationships){  //if relationships
                            database.getRelationships(table, relationships, row, (results) => {
                                _.forEach(results, (result, key) => {
                                    row[key] = result;
                                });
                                res.send(row);
                            });
                        }else{  //if no relationships
                            res.send(row);
                        }
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
            var insert_data = validation.cullData(table, data);
            if(insert_data){
                _.forEach(insert_data, function(v, k){
                    query.set(k, v);
                });
                database.connection.query( query.toString(), function(err, rows, fields){
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
            var insert_data = validation.cullData(table, data);
            if(insert_data){
                _.forEach(insert_data, function(v, k){
                    query.set(k, v);
                });
                database.connection.query( query.toString(), function(err, rows, fields){
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
            database.connection.query( query.toString(), function(err, rows, fields){
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
      typeof next === 'function' && next();   //trigger next step
    });
}



/**
 * Module
 */
module.exports = {
    init : init,
    createRoutes : createRoutes
}
