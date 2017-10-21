const DogModel = require('../models/Dog')
const UserModel = require('../models/User')

module.exports.GetAllUsers = (done) => {
	return UserModel.getAllUser(done)
}

module.exports.GetUserById = (id, done) => {
	return UserModel.getUser(id, done)
}

module.exports.GetUserByFacebookId = (facebook_id, done) => {
	return UserModel.getUserByFacebookId(facebook_id, done)
}

module.exports.Register = (facebook_id, done) => {
	return UserModel.register(facebook_id, done)
}

module.exports.GetDogById = (id, done) => {
	return DogModel.getDogById(id, done)
}

module.exports.GetDogByBreed = (breed, done) => {
	return DogModel.getDogByBreed(breed, done)
}

module.exports.GetAllDoggos = (done) => {
	return DogModel.getAllDoggos(done)
}

module.exports.RegisterDoggo = (owner_id, name, breed, age, size, personality, dogState = 'AVAILABLE', done) => {
	DogModel.register(name, breed, age, size, personality, dogState, (err, doggo) => {
		if (err)
			done(err)
		return UserModel.linkDoggo(owner_id, doggo._id, done)
	})
}
