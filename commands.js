import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';
const { SlashCommandBuilder } = require('discord.js');

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
};



const siteswaps = new SlashCommandBuilder()
	.setName('Siteswaps')
	.setDescription("Génère un gif d'un siteswaps, basé sur : https://jugglinglab.org/html/animinfo.html")
	.addStringOption(option =>
		option.setName('pattern')
			.setDescription('Le pattern à utiliser ex: <3p|3p> ou 333')
      .setRequired(true));


const SITESWAPS_COMMAND = siteswaps.ToJson();

const ALL_COMMANDS = [TEST_COMMAND, SITESWAPS_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);