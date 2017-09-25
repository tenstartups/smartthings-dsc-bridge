module.exports = {

  token: (req, res) => {
    var token = req.params.token
    Server.update({}, { smartThingsToken: token }).exec((err, record) => {
      if (err) {
        return res.serverError(err)
      } else {
        var server = sails.hooks.server.singleton()
        server.smartThingsToken = token
        server.loadSmartThingsEndpoints()
        return res.json({ hub: record })
      }
    })
  }
}
