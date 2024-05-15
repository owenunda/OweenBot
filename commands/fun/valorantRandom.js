const {SlashCommandBuilder, EmbedBuilder} = require("discord.js")
const agentValorant = require("./json/agentValorant.json")


let imgAgent = ''
let nameAgent = ''
let numRandom = 0

const randomAgent = (role) =>{
  switch (role) {
    case 'role_centinela':
      numRandom = Math.floor(Math.random() * (agentValorant.centinela.length - 1))
      imgAgent = agentValorant.centinela[numRandom].img
      nameAgent = agentValorant.centinela[numRandom].name
      break;
    case 'role_duelista':
      numRandom = Math.floor(Math.random() * (agentValorant.duelista.length - 1))
      imgAgent = agentValorant.duelista[numRandom].img
      nameAgent = agentValorant.duelista[numRandom].name
      break;
    case 'role_iniciador':
      numRandom = Math.floor(Math.random() * (agentValorant.iniciadore.length - 1))
      imgAgent = agentValorant.iniciadore[numRandom].img
      nameAgent = agentValorant.iniciadore[numRandom].name
      break;
    case 'role_Controlador':
      numRandom = Math.floor(Math.random() * (agentValorant.controlador.length - 1))
      imgAgent = agentValorant.controlador[numRandom].img
      nameAgent = agentValorant.controlador[numRandom].name
      break;
    default:
      break;
  }
  const exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
 	.setAuthor({ name: `The random agent is ${nameAgent} 😉 `, iconURL: 'https://cdn4.iconfinder.com/data/icons/valorant-jett-and-killjoy-cute-chibi/2000/valorant_chibi_killjoy_jettvalorant_cute_jettcute_killjoycute-09-512.png'})
 	.setImage(imgAgent)
 	.setTimestamp()
   .setFooter({ text: 'thanks for using oweenbot ❤️', iconURL: 'https://www.techspot.com/images2/downloads/topdownload/2020/06/2020-06-09-ts3_thumbs-7fd-p_256.webp' });
   return { embeds: [exampleEmbed] }
 }
module.exports = {
    cooldown: 3,
    data: new SlashCommandBuilder()
    .setName("random-agent")
    .setDescription("te da un agente random de valorant")
    .addStringOption(option => 
      option.setName('role')
      .setDescription('agent role')
      .setRequired(true)
      .addChoices(
        { name: 'centinela', value: 'role_centinela' },
				{ name: 'duelista', value: 'role_duelista' },
				{ name: 'iniciador', value: 'role_iniciador' },
        { name: 'controlador', value: 'role_Controlador' },
      )),
    
    async execute(interaction){
      const role =  interaction.options.getString('role');
      await interaction.reply(randomAgent(role))
    }
}