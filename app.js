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
        await res.send({
          type:InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          content
        });
        const userId = req.body.member.user.id;
        const username = req.body.member.user.global_name;
        //console.log(req.body.data.options);
        
        let options = req.body.data.options;
        
        
        const pattern = options.filter(option=>option["name"] == "pattern")[0].value;
        let dwell = options.filter(option=>option["name"] == "dwell")[0];
        let prop = options.filter(option=>option["name"] == "prop")[0];
        let camangle = options.filter(option=>option["name"] == "camangle")[0];
        let stereo = options.filter(option=>option["name"] == "stereo")[0];
        let hands = options.filter(option=>option["name"] == "hands")[0];
        let titre = options.filter(option=>option["name"] == "titre")[0];
      
        const siteswap_embed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle(`Génération d'un Siteswaps`)
          .setURL('https://jugglinglab.org/html/animinfo.html')
          .setAuthor({ name: username, iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
          .setDescription(pattern)
          .setFooter({ text: 'Basé sur le générateur jugglinglab.org', iconURL: 'https://i.imgur.com/AfFp7pu.png' });


        let url = `https://jugglinglab.org/anim?pattern=${pattern};colors=mixed`;
        
        if (dwell!= undefined){
          //dwell_value = (dwell_value>=2.0)?1.9:(dwell_value<=0)?0.1:dwell_value;
          //dwell_value = parseFloat(dwell_value).toFixed(1);
          
          url+=`;dwell=${dwell.value}`;
          siteswap_embed.addFields({ name: "Dwell :", value: dwell.value, inline: true })
        }
        if (prop != undefined){
          url+=`;prop=${prop.value}`;
          siteswap_embed.addFields({ name: "Prop :", value: prop.value, inline: true });
        }
        if (stereo!=undefined){
          url+=`;stereo=${stereo.value}`;
          siteswap_embed.addFields({ name: "Stereo :", value: stereo.value, inline: true });
        }
        if (camangle != undefined){
          url+=`;camangle=${camangle.value}`;
          siteswap_embed.addFields({ name: "Camera angle :", value: camangle.value, inline: true });
        }
        if (hands != undefined){
          url+=`;hands=${hands.value}`;
          siteswap_embed.addFields({ name: "Hands :", value: hands.value, inline: true });
        }
        if(titre != undefined){
          siteswap_embed.setTitle(titre.value);
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
          
          siteswap_embed.setImage(gifUrl);
          //const user = await client.fetch_user(userId);
          //const avatarUrl = user.displayAvatarURL({ format: 'png', dynamic: true });
          
          // content: `Génération du Siteswaps ${pattern}`,
          
          await DiscordRequest(`webhooks/${process.env.APP_ID}/${req.body.token}`, {
            method:"POST",
            body:{
              type:InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                embeds: [siteswap_embed],
              },
            }
          });
          
        } else {
          await DiscordRequest(`webhooks/${process.env.APP_ID}/${req.body.token}`, {
            method:"POST",
            body:{
              type:InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `Commande ${url} incorrecte`,
              },
            }
          });
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
