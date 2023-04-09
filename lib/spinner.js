let spin = require('spinnies')

const spinner = { 
  "interval": 200,
  "frames": ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']
}

let globalSpinner;


const getGlobalSpinner = (disableSpins = false) => {
  if(!globalSpinner) globalSpinner = new spin({ color: 'white', succeedColor: 'white', spinner, disableSpins});
  return globalSpinner;
}

spins = getGlobalSpinner(false)

const start = (id, text) => {
	spins.add(id, {text: text})
		/*setTimeout(() => {
			spins.succeed('load-spin', {text: 'Suksess'})
		}, Number(wait) * 1000)*/
	}
const info = (id, text) => {
	spins.update(id, {text: text})
}
const success = (id, text) => {
	spins.succeed(id, {text: text})

	}

const close = (id, text) => {
	spins.fail(id, {text: text})
}

module.exports = { start, info, success, close }




// function take(tes) {
// tes = {
// 	"namemap": {
// 		"akuoumaru": "Akuoumaru",
// 		"alleyhunter": "Alley Hunter"
// 	}
// }

// start('abc', 'Mengambil data db...')

// // setTimeout(_ => {
// //   close('yaha', 'Gagal Mengambil')
// // }, 4500)

// setTimeout(_ => {
//   success('abc', 'Selesai!')
//   tes = Object.keys(tes.namemap)

//   fs.writeFileSync('./weapon.json', JSON.stringify(tes))

//   console.log(tes)
// //   start('yaha', 'Loading baru')
// }, 1500)
// }


