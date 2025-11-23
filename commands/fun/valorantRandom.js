import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from 'node:fs';
const agentValorant = JSON.parse(
  fs.readFileSync(new URL('./json/agentValorant.json', import.meta.url), 'utf-8')
);

let imgAgent = "";
let nameAgent = "";
let numRandom = 0;

const randomAgent = (role) => {
  switch (role) {
    case "role_sentinel":
      numRandom = Math.floor(
        Math.random() * (agentValorant.centinela.length - 1)
      );
      imgAgent = agentValorant.centinela[numRandom].img;
      nameAgent = agentValorant.centinela[numRandom].name;
      break;
    case "role_duelist":
      numRandom = Math.floor(
        Math.random() * (agentValorant.duelista.length - 1)
      );
      imgAgent = agentValorant.duelista[numRandom].img;
      nameAgent = agentValorant.duelista[numRandom].name;
      break;
    case "role_initiator":
      numRandom = Math.floor(
        Math.random() * (agentValorant.iniciadore.length - 1)
      );
      imgAgent = agentValorant.iniciadore[numRandom].img;
      nameAgent = agentValorant.iniciadore[numRandom].name;
      break;
    case "role_controller":
      numRandom = Math.floor(
        Math.random() * (agentValorant.controlador.length - 1)
      );
      imgAgent = agentValorant.controlador[numRandom].img;
      nameAgent = agentValorant.controlador[numRandom].name;
      break;
    default:
      break;
  }
  const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setAuthor({
      name: `Your random agent is ${nameAgent} 😉`,
      iconURL:
        "https://cdn4.iconfinder.com/data/icons/valorant-jett-and-killjoy-cute-chibi/2000/valorant_chibi_killjoy_jettvalorant_cute_jettcute_killjoycute-09-512.png",
    })
    .setImage(imgAgent)
    .setTimestamp()
    .setFooter({
  text: "Thanks for using OweenBot ❤️",
      iconURL:
        "https://www.techspot.com/images2/downloads/topdownload/2020/06/2020-06-09-ts3_thumbs-7fd-p_256.webp",
    });
  return { embeds: [exampleEmbed] };
};
export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName("random-agent")
    .setDescription("Get a random Valorant agent")
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("Agent role")
        .setRequired(true)
        .addChoices(
          { name: "Sentinel", value: "role_sentinel" },
          { name: "Duelist", value: "role_duelist" },
          { name: "Initiator", value: "role_initiator" },
          { name: "Controller", value: "role_controller" }
        )
    ),

  async execute(interaction) {
    const role = interaction.options.getString("role");
    await interaction.reply(randomAgent(role));
  },
};
