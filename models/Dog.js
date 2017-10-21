var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/doggo')

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
mongoose.Promise = global.Promise

const MODEL_NAME = 'Dog'

class DogSchema {

	createModel() {
		if (mongoose.models[MODEL_NAME]) {
      		return mongoose.model(MODEL_NAME)
    	}
    	return mongoose.model(MODEL_NAME, this.createSchema())
	}

	createSchema() {
		var schema = new mongoose.Schema({
			external_id: String,
			name: String,
			breed: String,
			age: String,
			size: String,
			personality: String,
			dogState: { type: String, enum: ['ADOPTED', 'FOSTERED', 'AVAILABLE'] }
		})

		schema.statics.register = async (facebook_id, name, breed, age, size, personality, dogState) => {
			return this.create({facebook_id, name, breed, age, size, personality})
		}

		schema.statics.findDoggo = async (facebook_id) => {
		    return this.find({facebook_id}).exec()
		}

		schema.statics.findAvailableDoggos = async () => {
			return this.find({dogState: 'AVAILABLE'}).exec()
		}

		schema.statics.findAll = async function () {
			return this.find({}).exec()
		}

		return schema
	}

}

module.exports = DogSchema
