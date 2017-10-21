const DogModel = require('../models/Dog')
const Dog = new DogModel().createModel()

module.exports.findAllDoggos = async (req, res) => {
	try {
		console.log("SENDING");
		// Dog.findAll((err, dogs) => {
		// 	console.log("YAY");
		// 	res.status(200).json(dogs)
		// })

		const dogs = await Dog.findAll()

		res.status(200).json(dogs)

	} catch (err) {
		console.log(err);
		res.status(500).send(err)
	}
}
