import axios, { AxiosInstance } from "axios";
import { PodcastEpisode } from "./types";

export class Podcast {
  backendUrl = "https://api.taddy.org";
  client: AxiosInstance;

  constructor(userId: string, apiKey: string) {
    this.client = axios.create({
      baseURL: this.backendUrl,
      headers: {
        "X-USER-ID": userId,
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
    });
  }

  public async getPodcastEpisodes(name: string): Promise<PodcastEpisode[]> {
    const { getPodcastSeries } = await this.makeQuery<{
      getPodcastSeries: { uuid: string; totalEpisodesCount: number };
    }>(`
        {
          getPodcastSeries(name:"${name}"){
            uuid
            totalEpisodesCount
          }
        }
      `);

    const pageLimit = 25;
    const pageCount = Math.ceil(
      getPodcastSeries.totalEpisodesCount / pageLimit
    );
    const episodes: Array<PodcastEpisode> = [];

    for (let page = 1; page <= pageCount; page++) {
      const result = await this.makeQuery<{
        getPodcastSeries: { uuid: string; episodes: Array<PodcastEpisode> };
      }>(`
            {
                getPodcastSeries(name:"${name}"){
                    uuid
                    episodes (
                        page: ${page},
                        limitPerPage: ${pageLimit}
                    ){
                        uuid
                        name
                        description
                        audioUrl
                        
                    }
                }
            }
          `);

      episodes.push(...result.getPodcastSeries.episodes);
    }

    return episodes;
  }

  private async makeQuery<T>(query: string): Promise<T> {
    const { data } = await this.client.post<{ data: T }>("/", { query });
    return data.data;
  }
}
