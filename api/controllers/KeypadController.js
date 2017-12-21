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
  }
}
