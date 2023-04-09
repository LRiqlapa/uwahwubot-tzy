const { Image } = require("node-webpmux");

async function addExif(
    buffer,
    packname,
    author,
    categories = [""],
    extra = {}
  ) {
    const img = new Image();
    const json = {
      "sticker-pack-id": "Re7Pntx masbro",
      "sticker-pack-name": packname,
      "sticker-pack-publisher": author,
      emojis: ["⚙️", "😭", "😂", "😘"],
      "is-avatar-sticker": 1,
      "apa-mau-colong": "yaha hayukkk",
      ...extra
    };
    let exifAttr = Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41,
      0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    let jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
    let exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    await img.load(buffer);
    img.exif = exif;
    return await img.save(null);
  }

  module.exports = {addExif}