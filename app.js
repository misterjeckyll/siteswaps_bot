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
import { EmbedBuilder} from 'discord.js';


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
        const username = req.body.member.user.global_name;
        const pattern = req.body.data.options[0].value;

        let dwell = req.body.data.options[1];
        let prop = req.body.data.options[2];
        let camangle = req.body.data.options[3];
        let stereo = req.body.data.options[4];
        let stereo_value;
        
        
        
        let dwell_value;
        if (dwell!= undefined){
          dwell_value = dwell.value;
          dwell_value = (dwell_value>=2.0)?1.9:(dwell_value<=0)?0.1:dwell_value;
          dwell_value = (dwell_value).toFixed(1).toString();
        }else{
          dwell_value = "1.3";
        }
        
        let url = `https://jugglinglab.org/anim?pattern=${pattern};colors=mixed;dwell=${dwell_value}`;
        if (prop != undefined){
          url+=`;prop=${prop.value}`;
        }
        if (stereo!=undefined){
          url+=`;stereo=${stereo.value}`;
        }
        if (camangle != undefined){
          url+=`;camangle=${camangle.value}`;
        }
        console.log(url);
        const response = await fetch(url);
        const html = await response.text();
        const dom = new JSDOM(html);
        const imgElement = dom.window.document.querySelector('img');


        if (imgElement) {
          //save pattern in memory
          //ss_record.push('${userId}-${pattern}');
          
          const gifUrl = imgElement.src;
          //const user = await client.fetch_user(userId);
          //const avatarUrl = user.displayAvatarURL({ format: 'png', dynamic: true });
          
          const siteswap_embed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle(`Génération d'un Siteswaps`)
          .setURL('https://jugglinglab.org/html/animinfo.html')
          .setAuthor({ name: username, iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
          .setDescription(pattern)
          .setImage(gifUrl)
          .setTimestamp()
          .setFooter({ text: 'Basé sur le générateur jugglinglab.org', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
          
          if(dwell!=undefined){
            siteswap_embed.addFields({ name: "Dwell :", value: dwell_value, inline: true })
          }
          // content: `Génération du Siteswaps ${pattern}`,
          
          await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              embeds: [siteswap_embed],
            },
          });
          
        } else {
          message(res, `Commande ${url} incorrecte`);
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
