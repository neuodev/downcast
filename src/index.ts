import dotenv from "dotenv";
import { Podcast } from "./podcast";
import { Storage } from "./storage";
import { EpisodeDownloader } from "./downloader";
import axios from "axios";
import { PodcastEpisode } from "./types";

dotenv.config({});

async function main() {
  const userId = process.env.TADDY_USER_ID;
  const apiKey = process.env.TADDY_API_KEY;
  if (!userId) throw new Error('Missing "TADDY_USER_ID" environment variables');
  if (!apiKey) throw new Error('Missing "TADDY_API_KEY" environment variables');

  const storage = new Storage("cache/");

  const query = "Huberman Lab";
  //   const podcast = new Podcast(userId, apiKey);
  //   const episodes = await podcast.getPodcastEpisodes(query);
  //   storage.save(query, episodes);

  const result = storage.load<PodcastEpisode[]>(query);
  if (!result) throw new Error("Query is not cached");
  const downloader = new EpisodeDownloader("downloads");
  await downloader.downloadPodcast(query, storage);
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
