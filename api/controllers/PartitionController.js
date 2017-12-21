module.exports = {

  status: (req, res) => {
    Partition.findOne({ id: req.params.id, type: 'Partition' }).exec((err, partition) => {
      if (err) {
        return res.serverError(err)
      }
      if (!partition) {
        return res.notFound({ error: `Alarm partition with id ${req.params.id} not found` })
      }
      return res.json({ device: partition, result: partition.getStatus() })
    })
  },

  armStay: (req, res) => {
    Partition.findOne({ id: req.params.id, type: 'Partition' }).exec((err, partition) => {
      if (err) {
        return res.serverError(err)
      }
      if (!partition) {
        return res.notFound({ error: `Alarm partition with id ${req.params.id} not found` })
      }
      return res.json({ device: partition, result: partition.armStay() })
    })
  },

  armAway: (req, res) => {
    Partition.findOne({ id: req.params.id, type: 'Partition' }).exec((err, partition) => {
      if (err) {
        return res.serverError(err)
      }
      if (!partition) {
        return res.notFound({ error: `Alarm partition with id ${req.params.id} not found` })
      }
      return res.json({ device: partition, result: partition.armAway() })
    })
  },

  disarm: (req, res) => {
    Partition.findOne({ id: req.params.id, type: 'Partition' }).exec((err, partition) => {
      if (err) {
        return res.serverError(err)
      }
      if (!partition) {
        return res.notFound({ error: `Alarm partition with id ${req.params.id} not found` })
      }
      return res.json({ device: partition, result: partition.disarm(req.params.code) })
    })
  }
}
