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
		unique: true,
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

module.exports.getUser = (id, callback) => {
    user.findOne({id}, (err, user) => {
        callback(err, user)
    })
}

module.exports.getUserByFacebookId = (facebook_id, callback) => {
    user.findOne({facebook_id}, (err, user) => {
        callback(err, user)
    })
}

module.exports.getAllUser = (callback) => {
    user.find({}, (err, users) => {
        callback(err, users)
    })
}

module.exports.linkDoggo = (facebook_id, doggoId, callback) => {
	user.findOneAndUpdate({facebook_id},  {$push: {"dogs": doggoId}}, callback)
}

module.exports.deleteDoggo = (facebook_id, doggoId, callback) => {
	user.findOneAndUpdate({facebook_id},  {$pull: {"dogs": doggoId}}, callback)
}
