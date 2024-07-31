import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
/*
**
 * Utility function to handle deferred messages
 * @param {string} appId - The application ID
 * @param {string} token - The interaction token
 * @param {object} data - The data to send in the final response
 * @returns {Promise<void>}
 */
export async function sendDeferredembed(appId, token, embed) {
  const url = `https://discord.com/api/v10/webhooks/${appId}/${token}`;
  // Stringify payloads
  // Use node-fetch to make requests
  const res = await fetch(url, {
    method:'POST',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    body: JSON.stringify({
      embeds: [embed],
    })
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  return res;

}
export async function sendDeferredMessage(appId, token, message) {
  const url = `https://discord.com/api/v10/webhooks/${appId}/${token}`;
  // Stringify payloads
  // Use node-fetch to make requests
  const res = await fetch(url, {
    method:'POST',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    body: JSON.stringify({
      content: message,
    })
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  return res;

}

/**
 * Utility function to get the username for a given user ID
 * @param {string} userId - The user ID to fetch the username for
 * @param {string} token - The bot token for authentication
 * @returns {Promise<string>} - The username of the user
 */
export async function getUsername(userId, token) {
  const endpoint = `https://discord.com/api/v9/users/${userId}`;
  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const res = await fetch(endpoint, options);
  if (!res.ok) {
    throw new Error(`Discord API request failed: ${res.statusText}`);
  }
  const userData = await res.json();
  return userData.username;
}