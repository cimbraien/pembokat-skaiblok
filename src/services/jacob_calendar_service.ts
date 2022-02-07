import { Client, Message, TextChannel } from "discord.js";
import { Collection } from "mongodb";
import { JacobCalendarEmbed } from "../embeds/jacob_calendar_embed";
import { JacobCalendarUtil } from "../utils/jacob_calendar_util";

const CronJob = require("cron").CronJob;

export interface EventDetail {
  month: string;
  day: number;
  timestamp: number;
  crops: Array<string>;
}

const DELAY = 30;

export class JacobCalendarService {
  private message: Message;

  constructor(private channel: TextChannel, private coll: Collection) {
    this.runLoop();
  }

  async runLoop() {
    await this.sendOrEditReport(false);
    const job = new CronJob(`*/${DELAY} * * * * *`, async () => {
      await this.sendOrEditReport(true);
    });
    job.start();
  }

  async sendOrEditReport(editMode: boolean) {
    const events = await this.getNextThreeEventDetails();
    const embed = JacobCalendarEmbed(events);
    if (editMode) {
      await this.message.edit({ embeds: [embed] });
      return;
    }
    this.message = await this.channel.send({ embeds: [embed] });
  }

  async getNextThreeEventDetails(): Promise<Array<EventDetail>> {
    const nextEventId = JacobCalendarUtil.getNextEventId();
    const eventsDetails = [];
    for (let i = 0; i < 3; i++) {
      const event = await this.fetchEvent(
        JacobCalendarUtil.getYearNow(),
        nextEventId + i,
      );
      eventsDetails.push(event);
    }
    return eventsDetails;
  }

  async fetchEvent(year: number, eventId: number): Promise<EventDetail> {
    try {
      const event = await this.coll.findOne({ year, eventid : eventId });
      const dayofyear = JacobCalendarUtil.getDayOfEvent(eventId);
      const day = JacobCalendarUtil.getDayOfMonth(dayofyear);
      const monthNum = JacobCalendarUtil.getMonth(dayofyear);
      const month = JacobCalendarUtil.getMonthString(monthNum);
      const timestamp = JacobCalendarUtil.getTimestamp(year, dayofyear);
      const crops = event.crops;
      return {
        month,
        day,
        timestamp,
        crops,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
