module.exports = {

  status: (req, res) => {
    MotionZone.findOne({ id: req.params.id, type: 'MotionZone' }).exec((err, motionZone) => {
      if (err) {
        return res.serverError(err)
      }
      if (!motionZone) {
        return res.notFound({ error: `Motion Zone with id ${req.params.id} not found` })
      }
      return res.json({ device: motionZone, result: motionZone.getStatus() })
    })
  }
}
