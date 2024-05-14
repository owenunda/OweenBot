const {SlashCommandBuilder} = require("discord.js")



module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
    .setName("random-agent")
    .setDescription("te da un agente random de valorant"),
    
    async execute(interaction){
      const agentesValorant = ["Astra","Brimstone","Harbor","Omen","Viper","Jett","Neon","Phoenix","Raze","Reyna","Yoru","Iso","Breach","Fade", "Gekko","KAY/O","Skye","Sova","Chamber","Cypher","Deadlock","Killjoy","Sage","clove"]
      const randomAgent = () =>{
        let numRandom = Math.floor(Math.random() * (agentesValorant.length - 1)) 
        return agentesValorant[numRandom]
      } 
        await interaction.reply(randomAgent())
    }
}