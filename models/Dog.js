var mongoose = require('mongoose')
var Schema = mongoose.Schema
mongoose.Promise = global.Promise
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

var dogSchema = new Schema({
	id: Schema.Types.ObjectId,
    name: {
        type: String,
    },
    breed: {
        type: String
    },
	age: {
        type: String
    },
	size: {
		type: String
	},
	personality: {
		type: String
	},
	dogState: {
		type: String,
		enum: ['ADOPTED', 'FOSTERED', 'AVAILABLE'],
		default: 'AVAILABLE'
	}
})

var dog = mongoose.model('dogs', dogSchema)

module.exports.register = (name, breed, age, size, personality, dogState, callback) => {
    dog.create({name, breed, name, age, size, personality, dogState}, (err, doggo) => {
		callback(err, doggo)
	})
}

module.exports.getDogById = (id, callback) => {
    dog.findOne({id}, (err, doggo) => {
        callback(err, doggo)
    })
}

module.exports.getDogByBreed = (breed, callback) => {
	dog.findOne({breed}, (err, doggo) => {
        callback(err, doggo)
    })
}

module.exports.getAllDoggos = (callback) => {
    dog.find({}, (err, doggos) => {
        callback(err, doggos)
    })
}

module.exports.getAvailableDoggos = (callback) => {
	dog.find({dogState: 'AVAILABLE'}, callback)
}
