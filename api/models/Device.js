var camelCase = require('uppercamelcase')
var crypto = require('crypto');
var request = require('request-promise-native')
const uuidv4 = require('uuid/v4')

const SERVER_SETTINGS = require('js-yaml')
                        .safeLoad(require('fs')
                        .readFileSync(process.env.SETTINGS_FILE, 'utf8'))
                        .server || {}
const DEVICES_SETTINGS = require('js-yaml')
                         .safeLoad(require('fs')
                         .readFileSync(process.env.SETTINGS_FILE, 'utf8'))
                         .devices || {}

module.exports = {

  tableName: 'device',

  findTyped: function (criteria) {
    return new Promise((resolve, reject) => {
      if (criteria.type) {
        eval(criteria.type).findOne(criteria).exec((err, device) => {
          if (err) {
            console.log(`Error fetching ${criteria.type} device with criteria ${JSON.stringify(criteria)}`)
            reject(err)
          }
          resolve(device)
        })
      } else {
        Device.findOne(criteria).exec((err, device) => {
          if (err) {
            console.log(`Error fetching device with criteria ${JSON.stringify(criteria)}`)
            reject(err)
          }
          eval(device.type).findOne(criteria).exec((err, device) => {
            if (err) {
              console.log(`Error fetching ${device.type} device with criteria ${JSON.stringify(criteria)}`)
              reject(err)
            }
            resolve(device)
          })
        })
      }
    })
  },

  attributes: {

    id: {
      type: 'string',
      primaryKey: true,
      defaultsTo: function () { return uuidv4() },
      unique: true,
      index: true,
      uuidv4: true
    },

    type: {
      type: 'string',
      enum: ['Light', 'DimmableLight', 'Fan', 'Outlet', 'Scene'],
      required: true
    },

    address: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },

    model: {
      type: 'string',
      required: false
    },

    name: {
      type: 'string',
      required: true
    },

    description: {
      type: 'string',
      required: true
    },

    isAdvertised: {
      type: 'boolean',
      defaultsTo: true
    },

    smartThingsToken: {
      type: 'string'
    },

    smartThingsAppCallbackURIs: {
      type: 'array'
    },

    networkId: function () {
      var key = `isy:${SERVER_SETTINGS.instance_number || '01'}:${this.type}:${this.address}`
      return crypto.createHash('md5').update(key).digest('hex')
    },

    displayName: function () {
      return `${DEVICES_SETTINGS.name_prefix || ''} ${this.name} ${DEVICES_SETTINGS.name_suffix || ''}`.trim()
    },

    ssdpAdvertiseIP: function () {
      return sails.hooks.ssdp.advertiseIP()
    },

    ssdpAdvertisePort: function () {
      return sails.hooks.ssdp.advertisePort()
    },

    toJSON: function () {
      return {
        id: this.id,
        type: this.type,
        address: this.address,
        model: this.model,
        name: this.displayName(),
        description: this.description,
        network_id: this.networkId(),
        ip_address: this.ssdpAdvertiseIP(),
        ip_port: this.ssdpAdvertisePort()
      }
    },

    isyDevice: function () {
      return sails.hooks.isy.connection().getDevice(this.address)
    },

    getStatus: function () {
      return new Promise((resolve, reject) => {
        resolve(Object.assign({ command: 'status' }, this.currentState()))
      })
    },

    loadSmartThingsAppEndpoints: function () {
      return new Promise((resolve, reject) => {
        if (!this.smartThingsToken) {
          reject(new Error('Token not set'))
        }
        var options = {
          headers: {
            'Authorization': `Bearer ${this.smartThingsToken}`
          },
          uri: 'https://graph.api.smartthings.com/api/smartapps/endpoints',
          json: true
        }
        request(options)
        .then(result => {
          resolve(result.map(e => { return e.uri }))
        })
        .catch(reason => {
          reject(reason)
        })
      })
    },

    sendSmartThingsUpdate: function () {
      var body = { device: this.toJSON(), data: this.getStatus() }

      if (!this.smartThingsToken || !this.smartThingsAppCallbackURIs) {
        return null
      }

      console.log(`Sending ${JSON.stringify(body.data)} update for ${this.name}`)

      this.smartThingsAppCallbackURIs.forEach(uri => {
        var options = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.smartThingsToken}`
          },
          uri: `${uri}/update`,
          body: body,
          json: true
        }
        request(options)
        .then(result => {
          console.log(`Successfully sent update for ${this.name}`)
        })
        .catch(reason => {
          console.log(`Error sending update for ${this.name}`)
          console.log(reason)
        })
      })
    }
  }
}
