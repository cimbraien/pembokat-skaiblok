import { MessageEmbed } from "discord.js";
import { EventDetail } from "../services/jacob_calendar_service";
import { JacobCalendarUtil } from "../utils/jacob_calendar_util";

export const JacobCalendarEmbed = (
  eventDetails: Array<EventDetail>,
): MessageEmbed => {
  const message = new MessageEmbed()
    .setColor("RED")
    .setTitle("Jacob Calendar")
    .setTimestamp();
  for (let i = 0; i < eventDetails.length; i++) {
    const eventDetail = eventDetails[i];
    const timeToEvent = JacobCalendarUtil.getFormattedTimeUntilTimestamp(
      eventDetail.timestamp,
    );
    message.addField(
      `${eventDetail.month}  -  ${eventDetail.day}\t(${timeToEvent})`,
      eventDetail.crops.join("\n"),
    );
  }
  return message;
};
