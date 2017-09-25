module.exports = {

  index: (req, res) => {
    Device.find({ isAdvertised: true }).exec((err, devices) => {
      if (err) {
        return res.serverError(err)
      }
      return res.json({ device: devices })
    })
  },

  show: (req, res) => {
    Device.findOne(req.params.id).exec((err, device) => {
      if (err) {
        return res.serverError(err)
      }
      if (!device) {
        return res.notFound({ error: `Device with id ${req.params.id} not found` })
      }
      return res.json({ device: device })
    })
  },

  advertise: (req, res) => {
    Device.update(req.params.id, { isAdvertised: true }).exec((err, devices) => {
      if (err) {
        return res.serverError(err)
      }
      if (devices.length !== 1) {
        return res.notFound({ error: `Device with id ${req.params.id} not found` })
      }
      return res.json({ device: devices[0] })
    })
  },

  stopAdvertising: (req, res) => {
    Device.update(req.params.id, { isAdvertised: false }).exec((err, devices) => {
      if (err) {
        return res.serverError(err)
      }
      if (devices.length !== 1) {
        return res.notFound({ error: `Device with id ${req.params.id} not found` })
      }
      return res.json({ device: devices[0] })
    })
  },

  setToken: (req, res) => {
    Device.findTyped({ id: req.params.id }).then(device => {
      if (!device) {
        return res.notFound({ error: `Device with id ${req.params.id} not found` })
      }
      device.smartThingsToken = req.params.token
      device.loadSmartThingsAppEndpoints().then(result => {
        device.smartThingsAppCallbackURIs = result
        device.save(err => {
          if (err) {
            return res.serverError(err)
          }
          device.sendSmartThingsUpdate()
          return res.json({ device: device })
        })
      })
    }).catch(reason => {
      return res.serverError(reason)
    })
  },

  deleteToken: (req, res) => {
    Device.update(req.params.id, { smartThingsToken: null, smartThingsAppCallbackURIs: null }).exec((err, devices) => {
      if (err) {
        return res.serverError(err)
      }
      if (devices.length !== 1) {
        return res.notFound({ error: `Device with id ${req.params.id} not found` })
      }
      return res.json({ device: devices[0] })
    })
  }
}
