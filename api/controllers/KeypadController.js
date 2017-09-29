module.exports = {

  status: (req, res) => {
    Fan.findOne({ id: req.params.id, type: 'Fan' }).exec((err, fan) => {
      if (err) {
        return res.serverError(err)
      }
      if (!fan) {
        return res.notFound({ error: `Fan with id ${req.params.id} not found` })
      }
      console.log(`STATUS requested for ${fan.name}`)
      fan.getStatus().then(result => {
        return res.json({ device: fan, result: result })
      }).catch(reason => {
        return res.serverError(reason)
      })
    })
  },

  off: (req, res) => {
    Fan.findOne({ id: req.params.id, type: 'Fan' }).exec((err, fan) => {
      if (err) {
        return res.serverError(err)
      }
      if (!fan) {
        return res.notFound({ error: `Fan with id ${req.params.id} not found` })
      }
      console.log(`OFF command received for ${fan.name}`)
      fan.turnOff().then(result => {
        return res.json({ device: fan, result: result })
      }).catch(reason => {
        return res.serverError(reason)
      })
    })
  },

  low: (req, res) => {
    Fan.findOne({ id: req.params.id, type: 'Fan' }).exec((err, fan) => {
      if (err) {
        return res.serverError(err)
      }
      if (!fan) {
        return res.notFound({ error: `Fan with id ${req.params.id} not found` })
      }
      console.log(`LOW command received for ${fan.name}`)
      fan.setLow().then(result => {
        return res.json({ device: fan, result: result })
      }).catch(reason => {
        return res.serverError(reason)
      })
    })
  },

  medium: (req, res) => {
    Fan.findOne({ id: req.params.id, type: 'Fan' }).exec((err, fan) => {
      if (err) {
        return res.serverError(err)
      }
      if (!fan) {
        return res.notFound({ error: `Fan with id ${req.params.id} not found` })
      }
      console.log(`MEDIUM command received for ${fan.name}`)
      fan.setMedium().then(result => {
        return res.json({ device: fan, result: result })
      }).catch(reason => {
        return res.serverError(reason)
      })
    })
  },

  high: (req, res) => {
    Fan.findOne({ id: req.params.id, type: 'Fan' }).exec((err, fan) => {
      if (err) {
        return res.serverError(err)
      }
      if (!fan) {
        return res.notFound({ error: `Fan with id ${req.params.id} not found` })
      }
      console.log(`HIGH command received for ${fan.name}`)
      fan.setHigh().then(result => {
        return res.json({ device: fan, result: result })
      }).catch(reason => {
        return res.serverError(reason)
      })
    })
  }
}
