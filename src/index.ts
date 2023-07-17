import dotenv from "dotenv";
import { Podcast } from "./podcast";
import { Storage } from "./storage";
import axios from "axios";

dotenv.config({});

async function main() {
  const userId = process.env.TADDY_USER_ID;
  const apiKey = process.env.TADDY_API_KEY;
  if (!userId) throw new Error('Missing "TADDY_USER_ID" environment variables');
  if (!apiKey) throw new Error('Missing "TADDY_API_KEY" environment variables');

  const podcast = new Podcast(userId, apiKey);
  const storage = new Storage("cache/");

  const query = "The Tim Ferriss Show";
  const result = await podcast.getPodcastEpisodes(query);
  storage.save(query, result);
  console.log({ result });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(
      axios.isAxiosError(err) ? err.response?.data || err.message : err
    );
    process.exit(1);
  });
