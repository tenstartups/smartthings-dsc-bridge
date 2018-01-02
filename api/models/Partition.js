var Device = require('./Device')

module.exports =  _.merge(_.cloneDeep(Device), {
  attributes: {
    currentState: function () {
      return { status: this.state }
    },

    armStay: function () {
      if (sails.hooks.alarmdecoder.currentStatus() !== 'armed_stay') {
        sails.hooks.alarmdecoder.sendKeys('\x04\x04\x04')
      }
    },

    armAway: function () {
      if (sails.hooks.alarmdecoder.currentStatus() !== 'armed_away') {
        sails.hooks.alarmdecoder.sendKeys('\x05\x05\x05')
      }
    },

    disarm: function (code) {
      if (sails.hooks.alarmdecoder.currentStatus() !== 'disarmed') {
        sails.hooks.alarmdecoder.sendKeys(`#${code}`)
      }
    }
  }
})
