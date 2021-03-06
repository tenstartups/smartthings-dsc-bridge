var crypto = require('crypto')
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
      enum: ['ContactZone', 'FireZone', 'Keypad', 'MotionZone', 'Panel', 'Partition'],
      required: true
    },

    uid: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },

    name: {
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

    state: {
      type: 'string',
      required: false
    },

    networkId: function () {
      var key = `dsc:${SERVER_SETTINGS.instance_number || '01'}:${this.type}:${this.uid}`
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
        uid: this.uid,
        name: this.displayName(),
        network_id: this.networkId(),
        ip_address: this.ssdpAdvertiseIP(),
        ip_port: this.ssdpAdvertisePort()
      }
    },

    updateState: function (state) {
      this.state = state
      this.save(err => {
        if (err) {
          return res.serverError(err)
        }
      })
    },

    getStatus: function () {
      return Object.assign({ command: 'status' }, this.currentState())
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
      var body = { device: this.toJSON(), data: this.currentState() }

      if (!this.smartThingsToken || !this.smartThingsAppCallbackURIs) {
        return false
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
          json: true,
          resolveWithFullResponse: true
        }
        request(options)
        .then(result => {
          var rateLimitHeaders = {
            'X-RateLimit-Limit': result.headers['x-ratelimit-current'],
            'X-RateLimit-Current': result.headers['x-ratelimit-limit'],
            'X-RateLimit-TTL': result.headers['x-ratelimit-ttl']
          }
          console.log(`Successfully sent update for [${this.type}] ${this.name} - ${JSON.stringify(rateLimitHeaders)}`)
        })
        .catch(reason => {
          var rateLimitHeaders = {
            'X-RateLimit-Limit': reason.response.headers['x-ratelimit-current'],
            'X-RateLimit-Current': reason.response.headers['x-ratelimit-limit'],
            'X-RateLimit-TTL': reason.response.headers['x-ratelimit-ttl']
          }
          switch (reason.statusCode) {
            case 404:
              console.log(`Device not found sending update for [${this.type}] ${this.name} - ${JSON.stringify(rateLimitHeaders)}`)
              console.log(JSON.stringify(reason.error))
              this.smartThingsToken = null
              this.smartThingsAppCallbackURIs = null
              this.save(err => {
                if (err) {
                  throw err
                }
              })
              break
            case 429:
              console.log(`Rate limit sending update for [${this.type}] ${this.name} - ${JSON.stringify(rateLimitHeaders)}`)
              console.log(JSON.stringify(reason.error))
              break
            case undefined:
              throw reason
            default:
              console.log(`Error sending update for [${this.type}] ${this.name} - ${JSON.stringify(rateLimitHeaders)}`)
              console.log(JSON.stringify(reason.error))
              break
          }
        })
      })

      return true
    }
  }
}
