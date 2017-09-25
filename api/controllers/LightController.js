module.exports = {

  status: (req, res) => {
    Light.findOne({ id: req.params.id, type: 'Light' }).exec((err, light) => {
      if (err) {
        return res.serverError(err)
      }
      if (!light) {
        return res.notFound({ error: `Light with id ${req.params.id} not found` })
      }
      console.log(`STATUS requested for ${light.name}`)
      return res.json({ device: light, result: light.getStatus() })
    })
  },

  refresh: (req, res) => {
    Light.findOne({ id: req.params.id, type: 'Light' }).exec((err, light) => {
      if (err) {
        return res.serverError(err)
      }
      if (!light) {
        return res.notFound({ error: `Light with id ${req.params.id} not found` })
      }
      console.log(`REFRESH command received for ${light.name}`)
      return res.json({ device: light, result: light.refreshStatus() })
    })
  },

  on: (req, res) => {
    Light.findOne({ id: req.params.id, type: 'Light' }).exec((err, light) => {
      if (err) {
        return res.serverError(err)
      }
      if (!light) {
        return res.notFound({ error: `Light with id ${req.params.id} not found` })
      }
      console.log(`ON command received for ${light.name}`)
      return res.json({ device: light, result: light.turnOn() })
    })
  },

  off: (req, res) => {
    Light.findOne({ id: req.params.id, type: 'Light' }).exec((err, light) => {
      if (err) {
        return res.serverError(err)
      }
      if (!light) {
        return res.notFound({ error: `Light with id ${req.params.id} not found` })
      }
      console.log(`OFF command received for ${light.name}`)
      return res.json({ device: light, result: light.turnOff() })
    })
  }
}
