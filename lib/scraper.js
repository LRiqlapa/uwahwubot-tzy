const axios = require("axios");
const fetch = require("node-fetch");
const cheerio = require("cheerio");

async function wp(query) {
  let data = await fetch(
    "https://www.peakpx.com/en/search?q=" +
      query +
      "&page=" +
      Math.floor(Math.random() * (20 - 1 + 1) + 1)
  )
  let resuit = []
  let $ = cheerio.load(await data.text())
  $("#list_ul > li").each((i, el) => {
    let img = $(el).find("figure > a").find("img").attr("data-src")
    if (!img) return
    resuit.push(img.replace(/-thumbnail/g, ""))
  })
  return resuit
}

async function ml(id, zoneId) {
  return new Promise(async (resolve, reject) => {
    axios
      .post(
        "https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store",
        new URLSearchParams(
          Object.entries({
            productId: "1",
            itemId: "2",
            catalogId: "57",
            paymentId: "352",
            gameId: id,
            zoneId: zoneId,
            product_ref: "REG",
            product_ref_denom: "AE"
          })
        ),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Referer: "https://www.duniagames.co.id/",
            Accept: "application/json"
          }
        }
      )
      .then((response) => {
        resolve(response.data.data.gameDetail);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// comment due to api limit
// async function ai(text, imagemode) {
//   const { Configuration, OpenAIApi } = require("openai");
//   try {
//     const configuration = new Configuration({
//       apiKey: "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"
//     });
//     const openai = new OpenAIApi(configuration);
//     let response = null;
//     if (!imagemode) {
//       response = await openai.createCompletion({
//         model: "text-davinci-003",
//         prompt: text,
//         temperature: 0.3,
//         max_tokens: 2000,
//         top_p: 1.0,
//         frequency_penalty: 0.0,
//         presence_penalty: 0.0
//       });
//       return `${response.data.choices[0].text}`;
//     } else {
//       response = await openai.createImage({
//         prompt: text,
//         n: 1,
//         size: "512x512"
//       });
//       return `${response.data.data[0].url}`;
//     }
//   } catch (error) {
//     if (error.response) {
//       console.log(error)
//       return { status: error.response.status, message: error.response.statusText };
//     } else {
//       console.log(error);
//       return { status: error.message };
//     }
//   }
// }

async function caller(num) {
  let truecallerjs = require("truecallerjs");
  let PhoneNum = require("awesome-phonenumber");
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  let phone = PhoneNum(`+${num}`);
  let countryCode = phone.getRegionCode("international");
  let sn = await truecallerjs.searchNumber({
    number: num,
    countryCode,
    installationId:
      "a1i0C--YgalT8F_-oQRJv2Ow26hLNn3k9Ob5_ZGeA8VPNlM3ojvCCc_7t6JvxX_m",
    output: "JSON"
  });
  sn = JSON.parse(sn);
  let caption =
    `\t\t\t\t乂 *⺀ TRUE-CALLER ⺀* 乂\n\n` +
    `*◦ Number :* ${phone.getNumber("international")}\n` +
    `*◦ Name :* ${sn?.data?.[0]?.name || "-"}\n` +
    `*◦ Number Type :* ${sn?.data?.[0]?.phones?.[0]?.numberType || "-"}\n` +
    `*◦ Carrier :* ${sn?.data?.[0]?.phones?.[0]?.carrier || "-"}\n` +
    `*◦ Type :* ${sn?.data?.[0]?.phones?.[0]?.type || "-"}\n` +
    `*◦ Country Code :* ${regionNames.of(countryCode) || "-"}\n` +
    `*◦ Address :* ${sn?.data?.[0]?.addresses?.[0]?.city || "-"}\n` +
    `*◦ Timezone :* ${sn?.data?.[0]?.addresses?.[0]?.timeZone || "-"}\n\n` +
    `*◦ Clarification :*\n` +
    `*_Details about the number you are looking for are not always true._*`;

  return caption;
}

function kuso(q) {
  let query = encodeURIComponent(q);
  return new Promise(async function (resolve, reject) {
    let res = await axios.get("https://kusonime.com/?s=" + query);

    const $ = await cheerio.load(res.data);
    const linkanime1 = await $('div[class="content"] > h2 > a');
    let link1 = await linkanime1.attr("href");
    if (!link1) return reject(`Anime ${q} Tidak Ditemukan!`);
    let _res = await axios.get(link1);
    let links360 = await [];
    let links480 = await [];
    let links720 = await [];
    let links1080 = await [];
    const $$ = await cheerio.load(_res.data);
    const rootContent = $$('div[class="venser"]');
    const rootBody = rootContent.find('div[class="lexot"]');
    const rootInfo = rootBody.children('div[class="info"]');

    await $$(".dlbod > .smokeddl > .smokeurl > a").each(
      async (index, value) => {
        let link360 = await $$(value).attr("href");
        await links360.push({ link360 });
      }
    );

    await $$(".dlbod > .smokeddl > .smokeurl + .smokeurl > a").each(
      async (index, value) => {
        let link480 = await $$(value).attr("href");
        await links480.push({ link480 });
      }
    );

    await $$(".dlbod > .smokeddl > .smokeurl + .smokeurl + .smokeurl > a").each(
      async (index, value) => {
        let link720 = await $$(value).attr("href");
        await links720.push({ link720 });
      }
    );

    await $$(
      ".dlbod > .smokeddl > .smokeurl + .smokeurl + .smokeurl + .smokeurl > a"
    ).each(async (index, value) => {
      let link1080 = await $$(value).attr("href");
      await links1080.push({ link1080 });
    });

    let judul = await $$('div[class="post-thumb"] > h1[class="jdlz"]').text();
    let genre = await $$('div[class="info"] > p:nth-child(2)').text();
    let totaleps = await $$('div[class="info"] > p:nth-child(7)').text();
    let durasi = await $$('div[class="info"] > p:nth-child(9)').text();
    let tglrilis = await $$('div[class="info"] > p:nth-child(10)').text();
    let result360 = await JSON.stringify(links360)
      .replace(/,/g, "\n")
      .replace(/"/g, "")
      .replace(/link360/g, "")
      .replace(/{/g, "")
      .replace(/}/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "");
    let result480 = await JSON.stringify(links480)
      .replace(/,/g, "\n")
      .replace(/"/g, "")
      .replace(/link480/g, "")
      .replace(/{/g, "")
      .replace(/}/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "");
    let result720 = await JSON.stringify(links720)
      .replace(/,/g, "\n")
      .replace(/"/g, "")
      .replace(/link720/g, "")
      .replace(/{/g, "")
      .replace(/}/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "");
    let result1080 = await JSON.stringify(links1080)
      .replace(/,/g, "\n")
      .replace(/"/g, "")
      .replace(/link1080/g, "")
      .replace(/{/g, "")
      .replace(/}/g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "");
    let thumb = $$('div[class="post-thumb"] > img').attr("src");
    let desk = $$('div[class="venser"]')
      .find('div[class="lexot"]')
      .children("p")
      .first()
      .text();
    let type = $$(rootInfo.children("p").get(4)).text().split(":")[1].trim();
    let rate = $$(rootInfo.children("p").get(7)).text().split(":")[1].trim();
    let status = $$(rootInfo.children("p").get(5)).text().split(":")[1].trim();
    let producer = $$(rootInfo.children("p").get(3))
      .text()
      .split(":")[1]
      .trim();

    resolve({
      result: {
        judul,
        thumb,
        desk,
        genre: genre.split(": ")[1],
        status,
        produser: producer,
        rate,
        type,
        link: link1,
        total_eps: totaleps.split(": ")[1],
        durasi: durasi.split(": ")[1],
        tgl_rilis: tglrilis.split(": ")[1],
        result: {
          360: [
            ...new Set(
              result360
                .replace(/:/g, "")
                .replace(/https\/\//g, "https://")
                .split("\n")
            )
          ],
          480: [
            ...new Set(
              result480
                .replace(/:/g, "")
                .replace(/https\/\//g, "https://")
                .split("\n")
            )
          ],
          720: [
            ...new Set(
              result720
                .replace(/:/g, "")
                .replace(/https\/\//g, "https://")
                .split("\n")
            )
          ],
          1080: [
            ...new Set(
              result1080
                .replace(/:/g, "")
                .replace(/https\/\//g, "https://")
                .split("\n")
            )
          ]
        }
      }
    });
  });
}

// 'https://api.site-shot.com/?url=https://enka.network/u/839102841/&width=1280&height=840&userkey=4AAIEYKBJARKG36I4ZOGNMCUSO'
// https://api.screenshotmachine.com?key=cf419d&url=screenshotmachine.com&dimension=1024x768'
async function ss(url = "", full = false, type = "desktop", dimensi = false) {
  type = type.toLowerCase();
  if (!["desktop", "tablet", "phone"].includes(type)) type = "desktop";
  let form = new URLSearchParams();
  form.append("url", url);
  form.append("device", type);
  if (!!dimensi) form.append("dimension", dimensi);
  if (!!full) form.append("full", "on");
  form.append("cacheLimit", 0);
  let res = await axios({
    url: "https://www.screenshotmachine.com/capture.php",
    method: "post",
    data: form
  });
  let cookies = res.headers["set-cookie"];
  let buffer = await axios({
    url: "https://www.screenshotmachine.com/" + res.data.link,
    headers: { cookie: cookies.join("") },
    responseType: "arraybuffer"
  });
  return Buffer.from(buffer.data);
}

module.exports = { wp, ml, caller, kuso, ss };
