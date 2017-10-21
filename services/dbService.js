const DogModel = require('../models/Dog')
const UserModel = require('../models/User')

module.exports.FindAllUsers = (done) => {
	return UserModel.findAllUser(done)
}

module.exports.RegisterDoggo = (owner_id, name, breed, age, size, personality, dogState = 'AVAILABLE', done) => {
	DogModel.register(name, breed, age, size, personality, dogState, (err, doggo) => {
		if (err)
			done(err)
		return UserModel.linkDoggo(owner_id, doggo._id, done)
	})
}
