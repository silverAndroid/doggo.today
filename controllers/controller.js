const DB = require('../services/dbService')


module.exports.test = (req, res) => {

	DB.FindAllUsers((err, users) => {
		if(!err){
			res.status(200).send(users)
		}else{
			res.status(500).json(err)
		}
	})

}
