import "dotenv/config";
import { Client, Intents, TextChannel } from "discord.js";
import { config } from "./config";
import "axios";
import { LoginStatusService } from "./services/login_status_service";

const client = new Client({ intents: Intents.FLAGS.GUILDS });

let channel: TextChannel;

client.once("ready", async () => {
  console.log("bot ready");
  channel = (await client.channels.fetch(config.CHANNEL_ID)) as TextChannel;
  initServices();
});

const initServices = ()=>{
  new LoginStatusService(client, channel);
}

client.login(config.TOKEN);
