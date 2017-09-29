module.exports = {

  status: (req, res) => {
    Outlet.findOne({ id: req.params.id, type: 'Outlet' }).exec((err, outlet) => {
      if (err) {
        return res.serverError(err)
      }
      if (!outlet) {
        return res.notFound({ error: `Outlet with id ${req.params.id} not found` })
      }
      return res.json({ device: outlet, result: outlet.getStatus() })
    })
  },

  refresh: (req, res) => {
    Outlet.findOne({ id: req.params.id, type: 'Outlet' }).exec((err, outlet) => {
      if (err) {
        return res.serverError(err)
      }
      if (!outlet) {
        return res.notFound({ error: `Outlet with id ${req.params.id} not found` })
      }
      return res.json({ device: outlet, result: outlet.refreshStatus() })
    })
  },

  on: (req, res) => {
    Outlet.findOne({ id: req.params.id, type: 'Outlet' }).exec((err, outlet) => {
      if (err) {
        return res.serverError(err)
      }
      if (!outlet) {
        return res.notFound({ error: `Outlet with id ${req.params.id} not found` })
      }
      return res.json({ device: outlet, result: outlet.turnOn() })
    })
  },

  off: (req, res) => {
    Outlet.findOne({ id: req.params.id, type: 'Outlet' }).exec((err, outlet) => {
      if (err) {
        return res.serverError(err)
      }
      if (!outlet) {
        return res.notFound({ error: `Outlet with id ${req.params.id} not found` })
      }
      return res.json({ device: outlet, result: outlet.turnOff() })
    })
  }
}
