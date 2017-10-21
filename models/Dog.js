var mongoose = require('mongoose')
const MODEL_NAME = 'Dog'

class DogSchema {

	createModel = () => {
		if (mongoose.models[MODEL_NAME]) {
      		return mongoose.model(MODEL_NAME)
    	}
    	return mongoose.model(MODEL_NAME, this.createSchema())
	}

	createSchema = () => {
		var schema = new Schema({
			external_id: String,
			name: String,
			breed: String,
			age: String,
			size: String,
			personality: String
		})

		schema.statics.register = async (facebook_id, name, breed, age, size, personality) => {
			return this.create({facebook_id, name, breed, age, size, personality})
		}

		schema.statics.findDoggo = async (facebook_id, callback) => {
		    return this.find({facebook_id}).exec()
		}

		schema.statics.findAll = async () => {
			return this.find({}).exec()
		}

		return schema
	}

}

module.exports = DogSchema
