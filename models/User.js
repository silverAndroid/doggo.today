const mongoose = require('mongoose')
const MODEL_NAME = 'User'

class UserModel {

	createModel = () => {
		if (mongoose.models[MODEL_NAME]) {
      		return mongoose.model(MODEL_NAME)
    	}
    	return mongoose.model(MODEL_NAME, this.createSchema())
	}

	createSchema= () => {
		var schema = new mongoose.Schema({
			id: { type: String, required: true, unique: true },
			external_id: { type: String, required: true, index: true },
			dogType: { type: String, required: true },
			dogSize: { type: String, required: false },
			created: { type: Date, default: Date.now },
		})

		schema.statics.register = async (facebook_id, name, breed, age, size, personality) => {
			return this.create({facebook_id, name, breed, age, size, personality})
		}

		schema.statics.findUserByExternalId = async (external_id) => {
      		return this.find({external_id}).exec()
    	}

		return schema
	}

}

module.exports = UserModel
