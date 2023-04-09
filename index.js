const check = async() => {
  let spinner = require('./lib/spinner')
  console.log(require('chalk').keyword('aqua')('Memulai Quick check...'))
  
  spinner.start('check', 'Memeriksa File message.js ...')
  await new Promise(resolve => setTimeout(resolve, 2000));
  try {
	require('./handler/message')
	spinner.success('check', 'Tidak Ditemukan Error Pada message.js!')
  } catch (e) {
	spinner.close('check', 'Error Ditemukan!\n\n')
	console.log(e)
	process.exit()
  }
  
  spinner.start('check', 'Memeriksa File scraper.js ...')
  await new Promise(resolve => setTimeout(resolve, 2000));
  try {
	require('./lib/scraper')
	spinner.success('check', 'Tidak Ditemukan Error Pada scraper.js!')
  } catch (e) {
	spinner.close('check', 'Error Ditemukan!\n\n')
	console.log(e)
	process.exit()
  }
 return 1
}



const connect = async () => {
//require('./utils/cron')
const color = require('chalk')
const store = require('./store')
const { existsSync, watchFile } = require('fs')
let messageHandler = require('./handler/message')
let scraper = require('./lib/scraper')

/*  Database Read & Write  */
existsSync('./store/baileys_store.json') && store.readFromFile('./store/baileys_store.json')
setInterval(() => {
	store.writeToFile('./store/baileys_store.json')
}, 10000)

watchFile('./handler/message.js', () => {
	const dir = path.resolve('./handler/message.js')
	if (dir in require.cache) {
		delete require.cache[dir]
		messageHandler = require('./handler/message')
		console.log(color.keyword('turquoise')('[ INFO ]'), `Perubahan Pada File: message.js`)
	}
})
watchFile('./lib/scraper.js', () => {
	const dir = path.resolve('./lib/scraper.js')
	if (dir in require.cache) {
		delete require.cache[dir]
		scraper = require('./lib/scraper')
		console.log(color.keyword('turquoise')('[ INFO ]'), `Perubahan Pada File: scraper.js`)
	}
})


	const { default: WASocket, fetchLatestBaileysVersion, DisconnectReason, useMultiFileAuthState } = require('@adiwajshing/baileys')
    const Pino = require('pino')
    const { Boom } = require('@hapi/boom')
	const path = require('path')


	const { state, saveCreds } = await useMultiFileAuthState(path.resolve(`sesi`), Pino({ level: 'silent' }))
	let { version, isLatest } = await fetchLatestBaileysVersion()

	console.log(color.keyword('turquoise')('[ INFO ]'), `Versi: ${version}, Terbaru: ${isLatest}`)
	const conn = WASocket({
		printQRInTerminal: true,
		auth: state,
		logger: Pino({ level: 'silent' }),
		version,
	})
	store.bind(conn.ev)

	conn.ev.on('chats.set', () => {
		console.log('Mendapatkan Chat', store.chats.all().length)
	})

	conn.ev.on('contacts.set', () => {
		console.log('Mendapatkan Kontak', Object.values(store.contacts).length)
	})

	conn.ev.on('creds.update', saveCreds)

	conn.ev.on('connection.update', async (up) => {
		const { lastDisconnect, connection } = up
		if (connection === "close") {
		    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
			if (reason === DisconnectReason.badSession) {
			  console.log(color.red('[ FATAL ]'), `Bad Session File, Please Delete Session and Scan Again`);
			  process.exit();
			} else if (reason === DisconnectReason.connectionClosed) {
			  console.log(color.yellowBright('[ WARN ]'), "Connection closed, reconnecting....");
			  connect();
			} else if (reason === DisconnectReason.connectionLost) {
			  console.log(color.yellowBright('[ WARN ]'), "Connection Lost from Server, reconnecting...");
			  connect();
			} else if (reason === DisconnectReason.connectionReplaced) {
			  console.log(color.red('[ FATAL ]'), "Connection Replaced, Another New Session Opened, Please Close Current Session First");
			  process.exit();
			} else if (reason === DisconnectReason.loggedOut) {
			  console.log(color.red('[ FATAL ]'), `Session Logout From Device, Delete Folder Session And Rescan`);
			  process.exit();
			} else if (reason === DisconnectReason.restartRequired) {
			  console.log(color.yellowBright('[ WARN ]'), "Restart Required, Restarting...");
			  connect();
			} else if (reason === DisconnectReason.timedOut) {
			  console.log(color.yellowBright('[ WARN ]'), "Connection TimedOut, Reconnecting...");
			  connect();
			} else {
			  console.log(color.red('[ FATAL ]'), `Unknown DisconnectReason: ${reason}|${connection}`);
			  connect();
			}
		} else if (connection === "open") {
		    console.log(color.greenBright('[ SUCCESS ]'), 'Connection Succesfully!');
			setTimeout(_ => console.log(color.greenBright('[ SUCCESS ]'), 'Not Finding Error With Message Handler!'), 1500)
			console.log(color.keyword('turquoise')('[ INFO ]'), 'Initialized Message Handler...');
			console.log(color.greenBright(require('figlet').textSync("A I - B O T", {
              font: "Standard",
              horizontalLayout: "default",
              vertivalLayout: "default",
              whitespaceBreak: false,
            })))
		}
	})

	// messages.upsert
	conn.ev.on('messages.upsert', ({ messages, type }) => {
		if (type !== 'notify') return
		messageHandler(conn, messages[0], scraper)
	})

	conn.ev.on('group-participants.update', ({ id, participants, action }) => {
        console.log([id, participants, action])

	})

	// Handle error
  const unhandledRejections = new Map();
  process.on("unhandledRejection", (reason, promise) => {
    unhandledRejections.set(promise, reason);
    console.log("Unhandled Rejection at:", promise, "reason:", reason);
  });
  process.on("rejectionHandled", (promise) => {
    unhandledRejections.delete(promise);
  });
  process.on("Something went wrong", function (err) {
    console.log("Caught exception: ", err);
  });
}

check().then(_ => connect())