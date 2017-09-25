/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  // '/': {
  //   view: 'homepage'
  // }

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

  // Device controller actions
  'get /api/devices': 'DeviceController.index',
  'get /api/device/:id': 'DeviceController.show',
  'post /api/device/:id/advertise': 'DeviceController.advertise',
  'delete /api/device/:id/advertise': 'DeviceController.stopAdvertising',
  'post /api/device/:id/token/:token': 'DeviceController.setToken',
  'delete /api/device/:id/token': 'DeviceController.deleteToken',

  // Dimmable light controller actions
  'get /api/dimmable_light/:id/status': 'DimmableLightController.status',
  'post /api/dimmable_light/:id/refresh': 'DimmableLightController.refresh',
  'post /api/dimmable_light/:id/on': 'DimmableLightController.on',
  'post /api/dimmable_light/:id/off': 'DimmableLightController.off',
  'post /api/dimmable_light/:id/level/:level': 'DimmableLightController.level',
  'post /api/dimmable_light/:id/brighten': 'DimmableLightController.brighten',
  'post /api/dimmable_light/:id/dim': 'DimmableLightController.dim',

  // Fan controller actions
  'get /api/fan/:id/status': 'FanController.status',
  'post /api/fan/:id/off': 'FanController.off',
  'post /api/fan/:id/low': 'FanController.low',
  'post /api/fan/:id/medium': 'FanController.medium',
  'post /api/fan/:id/high': 'FanController.high',

  // Light controller actions
  'get /api/light/:id/status': 'LightController.status',
  'post /api/light/:id/refresh': 'LightController.refresh',
  'post /api/light/:id/on': 'LightController.on',
  'post /api/light/:id/off': 'LightController.off',

  // Outlet controller actions
  'get /api/outlet/:id/status': 'OutletController.status',
  'post /api/outlet/:id/refresh': 'OutletController.refresh',
  'post /api/outlet/:id/on': 'OutletController.on',
  'post /api/outlet/:id/off': 'OutletController.off',

  // Dimmable light controller actions
  'get /api/scene/:id/status': 'SController.status',
  'post /api/scene/:id/refresh': 'SceneController.refresh',
  'post /api/scene/:id/on': 'SceneController.on',
  'post /api/scene/:id/off': 'SceneController.off',
  'post /api/scene/:id/level/:level': 'SceneController.level',
  'post /api/scene/:id/brighten': 'SceneController.brighten',
  'post /api/scene/:id/dim': 'SceneController.dim'
}
