var Device = require('./Device')

module.exports =  _.merge(_.cloneDeep(Device), {
  attributes: {
    currentState: function () {
      return { status: this.state }
    },

    setState: function (state) {
      this.state = state
    }
  }
})
