import { MessageEmbed } from "discord.js";
import { PlayerStatus } from "../services/login_status_service";

export const LoginStatusEmbed = (
  playersStatus: Array<PlayerStatus>,
): MessageEmbed => {
  const online = playersStatus
    .filter((p) => p.online)
    .map((p) => p.name)
    .join(`\n`) || "--------";
  const offline =
    playersStatus
      .filter((p) => !p.online)
      .map((p) => p.name)
      .join(`\n`) || "--------";

  const message = new MessageEmbed()
    .setColor("RED")
    .setTitle("Hypixel Player Online Status")
		.setTimestamp();
  message.addField("🟢", online);
  message.addField("🔴", offline);
  return message;
};
