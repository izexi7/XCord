const ffmpeg = require('fluent-ffmpeg');
const fs = require("fs");
const tmp = require("tmp");
const { AttachmentBuilder } = require("discord.js");

async function convertMp4ToGif(mp4Urls) {
    const gifFiles = [];
    for (const mp4Url of mp4Urls) {
      const fileResponse = await fetch(mp4Url);
      if (fileResponse.ok) {
        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mp4Filename = mp4Url.split('/').pop();
        const tempMp4File = tmp.fileSync({ postfix: '.mp4' });
        fs.writeFileSync(tempMp4File.name, buffer);
        const tempGifFile = tmp.fileSync({ postfix: '.gif' });
        await new Promise((resolve, reject) => {
          ffmpeg(tempMp4File.name)
            .toFormat('gif')
            .on('end', () => {
              gifFiles.push(new AttachmentBuilder(tempGifFile.name, { name: mp4Filename.replace('.mp4', '.gif') }));
              resolve();
            })
            .on('error', (err) => {
              console.error(`Error converting ${mp4Filename} to GIF: ${err.message}`);
              reject(err);
            })
            .save(tempGifFile.name);
        });
      } else {
        console.error(`Error downloading the MP4: ${mp4Url}`);
      }
    }
    return gifFiles;
  }

module.exports = { convertMp4ToGif };