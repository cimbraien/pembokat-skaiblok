import "dotenv/config";
import { Client, Intents, TextChannel } from "discord.js";
import { config } from "./config";
import "axios";
import { LoginStatusService } from "./services/login_status_service";
import { JacobCalendarService } from "./services/jacob_calendar_service";
import { Db } from "mongodb";
import { MongoModel } from "./dbs/mongo";

const client = new Client({ intents: Intents.FLAGS.GUILDS });
let channel: TextChannel;

let mongoDb: Db;

client.once("ready", async () => {
  console.log("bot ready");
  channel = (await client.channels.fetch(config.CHANNEL_ID)) as TextChannel;
  await initDbs();
  initServices();
});

const initDbs = async () => {
  const mongoModel = new MongoModel();
  await mongoModel.connect();
  mongoDb = mongoModel.db;
};

const initServices = () => {
  new LoginStatusService(channel);
  new JacobCalendarService(channel, mongoDb.collection("jacob_calendar"));
};

client.login(config.TOKEN);
