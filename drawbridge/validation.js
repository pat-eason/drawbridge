/**
 * Remove keys from attempted inserts that do not exist
 * in the configured database
 */
var cullData = (table, data) => {
    var insert_data = {};
    _.forEach(data, function(value, key){
        //cull out keys that aren't in db schema
        _.forEach(DB.tables[table], function(v,k){
            if(key == v.Field){
                insert_data[key] = value;
                return;
            }
        });
    });
    return insert_data;
}



module.exports = {
    cullData : cullData
}
