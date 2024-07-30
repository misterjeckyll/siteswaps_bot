import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';
import { SlashCommandBuilder } from 'discord.js';

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
	.setName('ss')
	.setDescription("Génère un gif d'un siteswaps, basé sur : https://jugglinglab.org/html/animinfo.html")
	.addStringOption(option =>
		option.setName('pattern')
			.setDescription('Le pattern à utiliser ex: <3p|3p> ou 333 ou (4,2x)(2x,4)')
      .setRequired(true))
  .addNumberOption(option => option.setName('dwell').setDescription("Nombre de battements d'un catch, entre 0.0 et 2.0").setMaxValue(2).setMinValue(0))
  .addStringOption(option => option.setName('prop').setDescription("type d'objet lancé").addChoices(
    {name:"Balles",value:"ball"},
    {name:"Anneaux",value:"ring"}))
  .addStringOption(option => option.setName('camangle').setDescription("Angle caméra (hauteur, angle); ex: (0,110) ou (10,75)"))
  .addBooleanOption(option => option.setName('stereo').setDescription("Activer l'affichage stereoscopique"))
  .addStringOption(option => option.setName('hands').setDescription());


//const SITESWAPS_COMMAND = siteswaps.toJson();

const ALL_COMMANDS = [TEST_COMMAND, siteswaps];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);