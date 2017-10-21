var mongoose = require('mongoose')
var Schema = mongoose.Schema
mongoose.Promise = global.Promise
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

var dogSchema = new Schema({
	id: Schema.Types.ObjectId,
    owner: {
        type: Schema.Types.ObjectId,
        unique: true,
        require: [true, 'Must Enter a the dog owner']
    },
    name: {
        type: String,
        require: [true, 'Must Enter a name']
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
		enum: ['ADOPTED', 'FOSTERED', 'AVAILABLE']
	}
})

var dog = mongoose.model('dogs', dogSchema)

module.exports.register = (owner, name, breed, age, size, personality, dogState) => {
    dog.create({owner, name, breed, name, age, size, personality, dogState}, (err, doggos) => {
        callback(err, doggos)
    })
}

module.exports.findDog = (id, callback) => {
    dog.findOne({id}, (err, doggo) => {
        callback(err, doggo)
    })
}

module.exports.findAllDoggos = (callback) => {
    dog.find({}, (err, doggos) => {
        callback(err, doggos)
    })
}
