const DogModel = require('../models/Dog')
const Dog = new DogModel().createModel()
mongoose.Promise = global.Promise

module.exports.findAllDoggos = async (req, res) => {
	try {
		const dogs = await Dog.findAll()

		res.status(200).json(dogs)
	} catch (err) {
		console.log(err);
		res.status(500).send(err)
	}
}
