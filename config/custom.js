module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMongodbServer'
  // }

  explicitHost: process.env.HOST || '0.0.0.0',

  orm: {
    skipProductionWarnings: true
  },

  keepResponseErrors: true
}
