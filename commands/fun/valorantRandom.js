const {SlashCommandBuilder, EmbedBuilder} = require("discord.js")
const agentValorant = require("./json/agentValorant.json")

let imgAgent = ''
let nameAgent = ''

const randomAgent = () =>{
  const numRandom = Math.floor(Math.random() * (agentValorant.length - 1)) 
  imgAgent = agentValorant[numRandom].img
  nameAgent = agentValorant[numRandom].name
}

randomAgent()


const exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setAuthor({ name: `The random agent is ${nameAgent} 😉 `, iconURL: 'https://cdn4.iconfinder.com/data/icons/valorant-jett-and-killjoy-cute-chibi/2000/valorant_chibi_killjoy_jettvalorant_cute_jettcute_killjoycute-09-512.png'})
	.setImage(imgAgent)
	.setTimestamp()
  .setFooter({ text: 'thanks for using oweenbot ❤️', iconURL: 'https://www.techspot.com/images2/downloads/topdownload/2020/06/2020-06-09-ts3_thumbs-7fd-p_256.webp' });

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName("random-agent")
    .setDescription("te da un agente random de valorant"),
    
    async execute(interaction){
      
        await interaction.reply({ embeds: [exampleEmbed] })
    }
}