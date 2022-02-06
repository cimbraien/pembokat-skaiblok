import "dotenv/config";
import { Client, Intents, TextChannel } from "discord.js";
import { config } from "./config";
import { REST } from "@discordjs/rest";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { Routes } from "discord-api-types/v9";
import "axios";
import axios, { AxiosError } from "axios";
const CronJob = require("cron").CronJob;

const client = new Client({ intents: Intents.FLAGS.GUILDS });

const commands = [
  new SlashCommandSubcommandBuilder()
    .setName("testkontol")
    .setDescription("description test kontol"),
];
const rest = new REST({ version: "9" }).setToken(config.TOKEN);
(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
      {
        body: commands,
      },
    );
    console.log("commands registered");
  } catch (err) {
    console.log(err);
  }
})();

let channel: TextChannel;
let players = config.watchedPlayers;
let playersStatus: Array<{ name: string; online: boolean }> = [];

let authorization = `Authorization `;

const setupLoginStatusReporter = async (player: string) => {
  playersStatus.push({ name: player, online: false });
  const getUUID = await axios.get(
    `https://api.mojang.com/users/profiles/minecraft/${player}`,
  );
  const uuid: string = getUUID.data.id;
  const job = new CronJob("*/10 * * * * *", async () => {
    try {
      const getOnlineStatus = await axios.get(
        `https://api.hypixel.net/status?uuid=${uuid}&key=${config.HYPIXEL_API_KEY}`,
      );
      const isOnline: boolean = getOnlineStatus.data.session.online;
      const index = playersStatus.findIndex((p) => p.name == player);
      if (isOnline == playersStatus[index].online) return;
      playersStatus[index].online = isOnline;
      channel.send(`${player} is ${isOnline ? "online" : "offline"}`);
    } catch (error: unknown | AxiosError) {
      if (axios.isAxiosError(error)) console.log(error.code);
    }
  });
  job.start();
};

client.once("ready", async () => {
  console.log("bot ready");
  channel = (await client.channels.fetch(config.CHANNEL_ID)) as TextChannel;
  players.forEach((p) => {
    setupLoginStatusReporter(p);
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName, channelId } = interaction;
  if (channelId != config.CHANNEL_ID) return;
  if (commandName == "testkontol") {
    await interaction.reply("testkintil");
  }
});

client.login(config.TOKEN);
