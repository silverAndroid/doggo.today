var mongoose = require('mongoose')
var Schema = mongoose.Schema
mongoose.Promise = global.Promise
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

var userSchema = new Schema({
	id: Schema.Types.ObjectId,
    dogs: {
        type: [Schema.Types.ObjectId]
    },
	facebook_id: {
        type: String,
		required: true
    },
	desiredDogType: {
		type: String
	},
	desiredDogSize: {
		type: String
	},
	created: {
		type: Date,
		default: Date.now
	}
})

var user = mongoose.model('users', userSchema)

module.exports.register = (facebook_id, callback) => {
    user.create({facebook_id}, callback)
}

module.exports.findUser = (id, callback) => {
    user.findOne({id}, (err, user) => {
        callback(err, user)
    })
}

module.exports.findAllUser = (callback) => {
    user.find({}, (err, users) => {
        callback(err, users)
    })
}
