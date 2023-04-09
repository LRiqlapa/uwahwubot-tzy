const {
  WASocket,
  proto,
  getContentType,
  downloadContentFromMessage
} = require("@adiwajshing/baileys");
// const { PassThrough } = require('stream')
const moment = require("moment-timezone");
// const ffmpeg = require('fluent-ffmpeg')
const chalk = require("chalk");
//const fs = require('fs')
//const { help } = require('../utils/message')
const { writeDatabase } = require("../utils");
const { ss } = require("../lib/scraper");
//const scraper = require('../lib/scraper')
//const { M } = require('qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel')

const color = (text, color) => {
  return !color ? chalk.green(text) : chalk.keyword(color)(text);
};

module.exports = async (conn, msg, scraper) => {
  if (msg.key && msg.key.remoteJid === "status@broadcast") return;
  // if (msg.key && !msg.key.fromMe) return;
  //if (moment().unix() - msg.messageTimestamp > 5 * 60) return
  if (!msg.message) return;

  let owner = ["6283844009539@s.whatsapp.net"];
  let limit = 10;
  const db = require("../database/users.json");

  const time = moment().tz("Asia/Jakarta").format("HH:mm:ss");

  conn.downloadM = async (m, filename = "") => {
    if (!m || !(m.url || m.directPath)) return Buffer.alloc(0);
    let mime = (m.msg || m).mimetype || "";
    let messageType = m.type
      ? m.type.replace(/Message/gi, "")
      : mime.split("/")[0];
    let fs = require("fs");
    const stream = await downloadContentFromMessage(m, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    if (filename) await fs.promises.writeFile(filename, buffer);
    return filename && fs.existsSync(filename) ? filename : buffer;
  };

  let quoted = () => {
    let mess = msg?.message;
    let type = Object.keys(mess)[0];
    let kontek = mess[type]?.contextInfo?.quotedMessage;
    if (!mess || !kontek) return null;
    let id = mess[type]?.contextInfo?.stanzaId;
    type = Object.keys(kontek)[0];
    let hasil = kontek[type];
    if (typeof hasil === "string") return { text: hasil, type, id };
    let text = hasil?.text || hasil?.caption || "";
    return { ...hasil, text, type, id };
  };

  let type = getContentType(msg.message);
  msg.msg = msg.message[type];
  const quotedType =
    getContentType(
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    ) || null;
  if (type == "ephemeralMessage") {
    msg.message = msg.message.ephemeralMessage.message;
    msg.message = msg.message.ephemeralMessage.message.viewOnceMessage;
  }
  if (type == "viewOnceMessage") {
    msg.message = msg.message.viewOnceMessage.message;
  }

  const botId = conn.user.id.includes(":")
    ? conn.user.id.split(":")[0] + "@s.whatsapp.net"
    : conn.user.id;

  const from = msg.key.remoteJid;
  // if (from !== '6288221368771@whatsapp.net') return
  const body =
    type == "conversation"
      ? msg.message?.conversation
      : msg.message[type]?.caption || msg.message[type]?.text || "";
  const responseMessage =
    type == "listResponseMessage"
      ? msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ""
      : type == "buttonsResponseMessage"
      ? msg.message?.buttonsResponseMessage?.selectedButtonId || ""
      : "";
  const isGroup = from.endsWith("@g.us");

  var sender = isGroup ? msg.key.participant : msg.key.remoteJid;
  sender = sender.includes(":")
    ? sender.split(":")[0] + "@s.whatsapp.net"
    : sender;
  const senderName = msg.pushName;
  const senderNumber = sender.split("@")[0];

  const groupMetadata = isGroup ? await conn.groupMetadata(from) : null;
  const groupName = groupMetadata?.subject || "";
  const groupMembers = groupMetadata?.participants || [];
  const groupAdmins = groupMembers.filter((v) => v.admin).map((v) => v.id);

  const isCmd = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\\\©^]/.test(body);
  const prefix = isCmd ? body[0] : "";
  const isGroupAdmins = groupAdmins.includes(sender);
  const isBotGroupAdmins = groupMetadata && groupAdmins.includes(botId);
  const isOwner = owner.includes(sender);

  let command = isCmd
    ? body.slice(1).trim().split(" ").shift().toLowerCase()
    : "";
  // let responseId =
  //   msg?.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
  //   msg?.message?.buttonsResponseMessage?.selectedButtonId ||
  //   null;
  let args = body.trim().split(" ").slice(1);
  let text = body.replace(command, "").slice(1).trim();

  let user = db[sender];

  if (!user) {
    db[sender] = { limit };
    user = db[sender];
    writeDatabase("users", db);
  }

  // if (!user.limit && isCmd) {
  // 	return reply('Limit sudah terpakai habis.')
  // }

  // if (user.limit && isCmd) {
  // 	db[from].limit--
  // 	writeDatabase('users', db)
  // }

  // return this.charAt(0).toUpperCase() + this.slice(1, this.length)

  let mentioned =
    msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  const isImage = type == "imageMessage";
  const isVideo = type == "videoMessage";
  const isAudio = type == "audioMessage";
  const isSticker = type == "stickerMessage";
  const isContact = type == "contactMessage";
  const isLocation = type == "locationMessage";

  // const isQuoted = type == "extendedTextMessage";
  // const isQuotedImage = isQuoted && quotedType == "imageMessage";
  // const isQuotedVideo = isQuoted && quotedType == "videoMessage";
  // const isQuotedAudio = isQuoted && quotedType == "audioMessage";
  // const isQuotedSticker = isQuoted && quotedType == "stickerMessage";
  // const isQuotedContact = isQuoted && quotedType == "contactMessage";
  // const isQuotedLocation = isQuoted && quotedType == "locationMessage";

  var mediaType = type;
  var stream;
  if (
    quoted() &&
    (quotedType == "imageMessage" ||
      quotedType == "videoMessage" ||
      quotedType == "audioMessage" ||
      quotedType == "stickerMessage")
  ) {
    mediaType = quotedType;
    msg.message[mediaType] =
      msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[
        mediaType
      ];
    stream = await downloadContentFromMessage(
      msg.message[mediaType],
      mediaType.replace("Message", "")
    ).catch(console.error);
  }

  if (!isGroup && !isCmd)
    console.log(
      color(`[ ${time} ]`, "white"),
      color("[ PRIVATE ]", "aqua"),
      color(body.slice(0, 50), "white"),
      "from",
      color(senderNumber, "yellow")
    );
  if (isGroup && !isCmd)
    console.log(
      color(`[ ${time} ]`, "white"),
      color("[  GROUP  ]", "aqua"),
      color(body.slice(0, 50), "white"),
      "from",
      color(senderNumber, "yellow"),
      "in",
      color(groupName, "yellow")
    );
  if (!isGroup && isCmd)
    console.log(
      color(`[ ${time} ]`, "white"),
      color("[ COMMAND ]", "aqua"),
      color(body, "white"),
      "from",
      color(senderNumber, "yellow")
    );
  if (isGroup && isCmd)
    console.log(
      color(`[ ${time} ]`, "white"),
      color("[ COMMAND ]", "aqua"),
      color(body, "white"),
      "from",
      color(senderNumber, "yellow"),
      "in",
      color(groupName, "yellow")
    );

  function reply(text, image) {
    if (!image) return conn.sendMessage(from, { text: text }, { quoted: msg });
    let buff = Buffer.isBuffer(image) ? true : false;
    conn.sendMessage(
      from,
      { image: buff ? image : { url: image }, caption: text },
      { quoted: msg }
    );
  }

  switch (command) {
    case 'ya': 
    reply('6288221368771@whatsapp.net')
    break
    case "menu": {
      reply(
        "Daftar Perintah:\n\ngenshin\nwp\nai\nimg\ncaller\nkuso\n\nGunakan prefix contoh: #ai"
      );
      break;
    }
    case "s": {
      if (!quoted()) return reply("Reply a sticker!");
      let stiker = false;
      try {
        let [packname, ...author] = text.split("|");
        author = (author || []).join("|");
        let mime = quoted().mimetype || "";
        if (!/webp/.test(mime)) reply("Reply sticker!");
        let img = await conn.downloadM(quoted());
        if (!img) reply("Reply a sticker!");
        stiker = await require("../lib/sticker").addExif(
          img,
          packname || "",
          author || ""
        );
      } catch (e) {
        console.error(e);
        if (Buffer.isBuffer(e)) stiker = e;
      } finally {
        if (stiker)
          conn.sendMessage(from, { sticker: stiker }, { quoted: msg });
        else reply("Conversion failed");
      }
      break;
    }
    case "chara": {
      let fetch = require('node-fetch')
      let res = await fetch(
        `https://api.jikan.moe/v4/characters?q=${text}`
      );
      if (!res.ok) throw await res.text();
      let json = await res.json();
      if (!json.data[0]) return reply('tidak ditemukan :/')
      let { name, name_kanji, nicknames, url, images, mal_id, about } = json.data[0];
      let charaingfo = `[ *CHARACTER* ]\n
🔑 *Id Character:* ${mal_id}
💬 *Name:* ${name}
💭 *Nickname:* ${nicknames[0] || '-'}
㊙️ *Kanji Names:* ${name_kanji || '-'}
🔗 *Link Detail:* ${url}
ℹ️ *About:* ${about || '-'}`;
      reply(charaingfo, images.jpg.image_url);
     break
    }
    case "genshin": {
      if (!text)
        return reply(
          `Mencari profil akun genshin via uid.\n\nContoh:\n${prefix}${command} 840000000`
        );
      text = text ? text : 839102841;
      await reply("Mohon tunggu...");
      let b = await scraper.ss(
        `https://enka.network/u/${text}/`,
        false,
        "desktop",
        "1280x840"
      );
      reply("Nih akunmu", b);
      break;
    }
    case "wp": {
      if (!text)
        return reply(
          `Mencari wallpaper.\n\nContoh:\n${prefix}${command} Galaxy`
        );
      let func = await scraper.wp(text);
      if (!func[0]) return reply("Tidak Ditemukan!");
      let result = func[Math.floor(Math.random() * func.length)];
      reply("Query: " + text, result);
      break;
    }
    case "ai": {
      if (!text)
        return reply(
          `Chat dengan AI.\n\nContoh:\n${prefix}${command} Apa itu bot`
        );
      await reply("Mohon Tunggu...");
      let ai = await scraper.ai(text);
      if (ai.status)
        return reply(`${ai.message ? ai.message : `Error : ` + ai.status}`);
      reply(ai);
      break;
    }
    case "img": {
      if (!text)
        return reply(
          `Membuat gambar dari AI.\n\nContoh:\n${prefix}${command} Candy house in the middle snow`
        );
      await reply("Mohon Tunggu...");
      let ai = await scraper.ai(text, true);
      if (ai.status)
        return reply(`${ai.message ? ai.message : `Error : ` + ai.status}`);
      reply(text, ai);
      break;
    }
    case "caller": {
      let num = (args[0] || "").replace(/\D/g, "");
      if (num.startsWith("0") || !num)
        return reply(
          `Mencari Info Nomor.\n\nContoh:\n${prefix + command} ${senderNumber}`
        );
      let tru = await scraper.caller(num);
      reply(
        tru,
        "https://images.livemint.com/img/2021/11/22/1600x900/truecaller-logo-white-1x1_1637570636078_1637570642989.png"
      );
      break;
    }
    case "kuso": {
      if (!text) return reply("Masukkan Anime yg ingin anda cari!");
      let res = await scraper.kuso(text);
      let teks = `
[ *${res.result.judul}* ]
(${res.result.type})

⩗ Genre     : *${res.result.genre}*
⩗ Status    : *${res.result.status}*
⩗ Produser  : *${res.result.produser}*
⩗ Rate      : *${res.result.rate}*
⩗ Rilis     : *${res.result.tgl_rilis}*

⩗ Total eps : *${res.result.total_eps}*
⩗ Durasi    : *${res.result.durasi}*
⩗ Link      : *${res.result.link}*

${res.result.desk}


⩗ Download:
• *360p*: 
-${res.result.result[360].join("\n-")}

• *480p*: 
-${res.result.result[480].join("\n-")}

• *720p*: 
-${res.result.result[720].join("\n-")}

• *1080p*: 
-${res.result.result[1080].join("\n-")}     
`;
      reply(teks, res.result.thumb);
      break;
    }
    default:
      if (body.startsWith("=> ")) {
        if (!isOwner) return;
        // function Return(sul) {
        //     sat = JSON.stringify(sul, null, 2)
        //     bang = util.format(sat)
        //         if (sat == undefined) {
        //             bang = require('util').format(sul)
        //         }
        //         return reply(bang)
        // }
        try {
          let re = require("util").format(
            eval(`(async () => { ${body.slice(3)} })()`)
          );
          reply(re);
        } catch (e) {
          reply(String(e));
        }
      } else if (body.startsWith("> ")) {
        if (!isOwner) return;
        try {
          let evaled = await eval(body.slice(2));
          if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);
          await reply(evaled);
        } catch (err) {
          await reply(String(err));
        }
      } else if (body.startsWith("$ ")) {
        if (!isOwner) return;
        const { exec } = require("child_process");
        exec(body.slice(2), (err, stdout) => {
          if (err) return reply(`${err}`);
          if (stdout) return reply(stdout);
        });
      } else if (isCmd) {
        reply(
          `Perintah Tidak Tersedia!\n\nSilahkan Cek Di ${prefix}menu Perintah`
        );
      }
      break;
  }
};
