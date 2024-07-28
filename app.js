import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { EmbedBuilder } from 'discord.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));


const ss_record = [];


/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
    
    switch (name){
      case 'test':
        message(res, 'hello world ' + getRandomEmoji());
        break;
      case 'ss':
        const userId = req.body.member.user.id;
        const pattern = req.body.data.options[0].value;
        
        const url = `https://jugglinglab.org/anim?pattern=${pattern};colors=mixed`;
        const response = await fetch(url);
        const html = await response.text();
        const dom = new JSDOM(html);
        const imgElement = dom.window.document.querySelector('img');


        if (imgElement) {
          //save pattern in memory
          ss_record.push('${userId}-${pattern}');
          
          const gifUrl = imgElement.src;
          
          
          const siteswap_embed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Génération du Siteswaps ${pattern}' )
          .setURL('https://jugglinglab.org/html/animinfo.html')
          .setAuthor({ name: userId, iconURL: '', url: 'https://discord.js.org' })
          .setDescription('Some description here')
          //.setThumbnail('https://i.imgur.com/AfFp7pu.png')
          .addFields(
            { name: 'Regular field title', value: 'Some value here' },
            { name: '\u200B', value: '\u200B' },
          )
          .setImage(gifUrl)
          .setTimestamp()
          .setFooter({ text: 'Basé sur le générateur jugglinglab.org', iconURL: '' });
          
          // content: `Génération du Siteswaps ${pattern}`,
          
          await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              embeds: [siteswap_embed],
            },
          });
          
        } else {
          message(res, `Pattern ${pattern} incorrect`);
        }

        break;
    }
  }
});

function message(res, content){
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: content,
        },
  });
}

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
