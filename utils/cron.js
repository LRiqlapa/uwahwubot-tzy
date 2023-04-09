const cron = require('node-cron')
const { writeDatabase } = require('.')

cron.schedule('0 6 * * *', () => {
	let users = require('../database/users.json')
	let limit = 10
	for (let user of users) {
		users[user].limit = limit
	}

	writeDatabase('users', users)
})
