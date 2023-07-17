export type Podcast = {
  uuid: string;
  name: string;
  itunesId: string;
  description: string;
  imageUrl: string;
  itunesInfo: {
    uuid: string;
    publisherName: string;
    baseArtworkUrlOf: string;
  };
  episodes: Array<{
    uuid: string;
    name: string;
    description: string;
    audioUrl: string;
  }>;
};

export type PodcastEpisode = {
  uuid: string;
  name: string;
  description: string;
  audioUrl: string;
};
