import axios, { AxiosError } from "axios";
import { Client, Message, TextChannel } from "discord.js";
import EventEmitter from "events";
import { config } from "../config";
import { LoginStatusEmbed } from "../embeds/login_status_embed";
const CronJob = require("cron").CronJob;

export interface PlayerStatus {
  name: string;
  uuid: string;
  online: boolean;
}

const MAX_REQUEST_PER_MIN = 115;

export class LoginStatusService {
  private playersStatus: Array<PlayerStatus> = [];
  private delay: number = 60;
  private loginStatusEvent: EventEmitter;
  private message: Message;

  constructor(private client: Client, private channel: TextChannel) {
    this.loginStatusEvent = new EventEmitter();
    this.init();
  }

  async init() {
    await this.importPlayers();
    this.delay = Math.ceil(
      60 / (MAX_REQUEST_PER_MIN / this.playersStatus.length),
    );
    this.runLoop();
    await this.initMessage();
  }

  async initMessage() {
    try {
      this.message = await this.channel.send({
        embeds: [LoginStatusEmbed(this.playersStatus)],
      });
    } catch (error) {
      console.log(error);
    }
  }

  async importPlayers() {
    const players = config.watchedPlayers;
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const getUUID = await axios.get(
        `https://api.mojang.com/users/profiles/minecraft/${p}`,
      );
      const uuid: string = getUUID.data.id;
      this.playersStatus.push({
        name: p,
        uuid,
        online: false,
      });
    }
  }

  async getOnlineStatus(p: PlayerStatus): Promise<boolean> {
    const getPlayer = await axios.get(
      `https://api.hypixel.net/status?uuid=${p.uuid}&key=${config.HYPIXEL_API_KEY}`,
    );
    return getPlayer.data.session.online;
  }

  async refreshStatus() {
    let changed = false;
    for (let i = 0; i < this.playersStatus.length; i++) {
      const p = this.playersStatus[i];
      const isOnline = await this.getOnlineStatus(p);
      if (p.online == isOnline) continue;
      changed = isOnline;
      p.online = isOnline;
    }
    if (changed) this.loginStatusEvent.emit("statusChange");
  }

  runLoop() {
    const job = new CronJob(`*/${this.delay} * * * * *`, async () => {
      await this.refreshStatus();
    });
    job.start();
    this.onStatusChange();
  }

  onStatusChange() {
    this.loginStatusEvent.on("statusChange", async () => {
      await this.message.edit({
        embeds: [LoginStatusEmbed(this.playersStatus)],
      });
    });
  }
}
