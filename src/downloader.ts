import axios from "axios";
import { PodcastEpisode } from "./types";
import { Storage } from "./storage";
import fs from "node:fs";
import path from "node:path";
import cliProgress, { MultiBar } from "cli-progress";

export class EpisodeDownloader {
  constructor(private readonly outDir: string) {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  }

  public async downloadOne(
    podcastName: string,
    episode: PodcastEpisode,
    multibar: MultiBar,
    prefix = ""
  ) {
    const podcastPath = path.join(this.outDir, podcastName);
    if (!fs.existsSync(podcastPath)) fs.mkdirSync(podcastPath);

    const episodePath = path.join(podcastPath, prefix + episode.name + ".mp4");
    if (fs.existsSync(episodePath)) return;

    const barPayload = {
      filename: `${prefix}${podcastName} / ${episode.name}`,
    };
    const bar = multibar.create(100, 0, barPayload);

    const { data } = await axios.get<ArrayBuffer>(episode.audioUrl, {
      responseType: "arraybuffer",
      onDownloadProgress: (progressEvent) => {
        const progress = progressEvent.progress
          ? Number((progressEvent.progress * 100).toFixed(2))
          : 0;
        bar.update(progress, barPayload);
      },
    });

    fs.writeFileSync(episodePath, Buffer.from(data));

    bar.stop();
    multibar.remove(bar);
  }

  public async downloadMany(
    podcastName: string,
    episodes: Array<PodcastEpisode>,
    parallel: number = 10
  ) {
    const copy = JSON.parse(JSON.stringify(episodes));
    const asChuncks: Array<Array<PodcastEpisode>> = [];
    while (copy.length) asChuncks.push(copy.splice(0, parallel));

    const bar = new cliProgress.MultiBar(
      {
        format: " {bar} | {filename} | {value}/{total}",
      },
      cliProgress.Presets.shades_classic
    );

    for (let chunkIdx = 0; chunkIdx < asChuncks.length; chunkIdx++) {
      const chunk = asChuncks[chunkIdx];
      await Promise.all(
        chunk.map((episode, idx) =>
          this.downloadOne(
            podcastName,
            episode,
            bar,
            `${chunkIdx * parallel + idx + 1}.`
          )
        )
      );
    }
    bar.stop();
  }

  public async downloadPodcast(podcast: string, storage: Storage) {
    const episodes = await storage.load<PodcastEpisode[]>(podcast);
    if (!episodes) throw new Error(`"${podcast}" isn't cached`);
    await this.downloadMany(podcast, episodes);
  }
}
