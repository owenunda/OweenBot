const {SlashCommandBuilder, EmbedBuilder} = require("discord.js")
const agentValorant = require("./json/agentValorant.json")

const randomAgent = () =>{
  let numRandom = Math.floor(Math.random() * (agentValorant.length - 1)) 
  return agentValorant[numRandom].img
}


module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName("random-agent")
    .setDescription("te da un agente random de valorant"),
    
    async execute(interaction){
      
        await interaction.reply(randomAgent())
    }
}