const {SlashCommandBuilder, EmbedBuilder} = require("discord.js")
const agentValorant = require("./json/agentValorant.json")

const randomAgent = () =>{
  let numRandom = Math.floor(Math.random() * (agentValorant.length - 1)) 
  return agentValorant[numRandom].img
}

const exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle('Some title')
	.setURL('https://discord.js.org/')
	.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
	.setDescription('Some description here')
	.setThumbnail('https://i.imgur.com/AfFp7pu.png')
	.addFields(
		{ name: 'Regular field title', value: 'Some value here' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
	)
	.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
	.setImage('https://i.imgur.com/AfFp7pu.png')
	.setTimestamp()
	.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });


module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName("random-agent")
    .setDescription("te da un agente random de valorant"),
    
    async execute(interaction){
      
        await interaction.reply(randomAgent())
    }
}