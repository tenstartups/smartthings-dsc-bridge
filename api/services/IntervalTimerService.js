module.exports = {
  interval: function (func, wait, times) {
    var interv = (
      function (w, t) {
        return function () {
          if (typeof t === 'undefined' || t-- > 0) {
            setTimeout(interv, w)
            try {
              func(null)
            } catch (e) {
              t = 0
              throw e.toString()
            }
          }
        }
      }
    )(wait, times)

    setTimeout(interv, wait)
  }
}
