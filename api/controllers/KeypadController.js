module.exports = {

  status: (req, res) => {
    Keypad.findOne({ id: req.params.id, type: 'Keypad' }).exec((err, keypad) => {
      if (err) {
        return res.serverError(err)
      }
      if (!keypad) {
        return res.notFound({ error: `Keypad with id ${req.params.id} not found` })
      }
      return res.json({ device: keypad, result: keypad.getStatus() })
    })
  }
}
