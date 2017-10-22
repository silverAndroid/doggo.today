const DB = require('../services/dbService')


module.exports.test = (req, res) => {

	DB.RegisterDoggo("1234", "doggo6", "chiwawa", "2", "HUGE", "nervous", "AVAILABLE", (err, data) => {
		if(!err){
			return res.status(200).json(data)
		}else{
			return res.status(500).json(err)
		}
	})

}


module.exports.createUser = (req, res) => {

	DB.Register("1234", (err, data) => {
		if(!err){
			return res.status(200).json(data)
		}else{
			return res.status(500).json(err)
		}
	})

}

module.exports.GetAvailableDoggos = (req, res) => {
	DB.GetAvailableDoggos((err, data) => {
		if(!err){
			return res.status(200).json(data)
		}else{
			return res.status(500).json(err)
		}
	})
}
