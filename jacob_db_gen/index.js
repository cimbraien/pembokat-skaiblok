const MONGO_URI = "mongodb://localhost:27017";
const { MongoClient } = require("mongodb");
const prompt = require("prompt-async");

const client = new MongoClient(MONGO_URI);

const cropMap = {
  c: "Carrot",
  nw: "Nether Wart",
  po: "Potato",
  cac: "Cactus",
  m: "Melon",
  co: "Cocoa Beans",
  mu: "Mushroom",
  s: "Sugar Cane",
  w: "Wheat",
  p: "Pumpkin",
};

let year;
let eventid;
let coll;

const init = async () => {
  await client.connect();
  const db = client.db("pembokatskaiblok");
  coll = db.collection("jacob_calendar");
  year = parseInt((await prompt.get("Year"))["Year"]);
  eventid = parseInt((await prompt.get("Start index"))["Start index"]) || 0;
  loop();
};

const loop = async () => {
  console.log(`Year ${year}, eventId ${eventid}`);
  const { crops } = await prompt.get("crops");
  if (crops.split(" ").length != 3) {
    console.log("Wrong format");
    loop();
    return;
  }
  const cropsData = crops.split(" ").map((c) => cropMap[c]);
  if (cropsData.includes(undefined)) {
    console.log("Wrong crop index");
    loop();
    return;
  }

  await coll.updateOne(
    { year: year, eventid: eventid },
    {
      $set: { year, eventid, crops: cropsData },
    },
    { upsert: true },
  );
  eventid++;
  loop();
};

init();
