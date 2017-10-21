const DogModel = require('../models/Dog')

module.exports.findAllDoggos = async (req, res) => {
	try {
		DogModel.findAllDoggos((err, doggos) => {
			res.status(200).json(doggos)
		})
	} catch (err) {
		console.log(err);
		res.status(500).send(err)
	}
}
