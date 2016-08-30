# Drawbridge
Instantly create a REST interface using a MySQL database.

```node
npm install
mv config.json.sample config.json //to rename the sample config
> update config.json with your database information
node app.js
```

Compiles MySQL database tables and columns to create REST style interface URLs
```
GET /user
GET /user/:record_id
POST /user
PUT /user/:record_id
DELETE /user/:record_id
```
