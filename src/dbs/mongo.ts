import { Db, MongoClient } from "mongodb";
import { config } from "../config";

export class MongoModel {
  private client: MongoClient;
  public db: Db;

  async connect() {
    this.client = new MongoClient(config.MONGO_URI);
		await this.client.connect();
		console.log("connected");
    this.db = this.client.db(config.MONGO_DB_NAME);
	}
}
