module.exports = {

  status: (req, res) => {
    ContactZone.findOne({ id: req.params.id, type: 'ContactZone' }).exec((err, contactZone) => {
      if (err) {
        return res.serverError(err)
      }
      if (!contactZone) {
        return res.notFound({ error: `Contact Zone with id ${req.params.id} not found` })
      }
      console.log(`STATUS requested for ${contactZone.name}`)
      return res.json({ device: contactZone, result: contactZone.getStatus() })
    })
  }
}
