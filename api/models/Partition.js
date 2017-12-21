var Device = require('./Device')

module.exports =  _.merge(_.cloneDeep(Device), {
  attributes: {
    currentState: function () {
      return { status: this.state }
    },

    setState: function (state) {
      this.state = state
    },

    armStay: function () {
      sails.hooks.alarmdecoder.sendKeys('\x04\x04\x04')
    },

    armAway: function () {
      sails.hooks.alarmdecoder.sendKeys('\x05\x05\x05')
    },

    disarm: function (code) {
      sails.hooks.alarmdecoder.sendKeys(`#${code}`)
    }
  }
})
