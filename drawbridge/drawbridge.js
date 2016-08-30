/**
 * Include modules
 */
const database      = require('./database');
const router        = require('./router');

module.exports = {

    /**
     * Start the application
     */
    start: () => {
        //get db info
        database.init( () => {
            // router.init( () => {
            //     console.log('Drawbridge is loaded');
            // });
            router.init();
        });

    }
}
