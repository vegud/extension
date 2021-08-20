export interface Entry {
  provider: string;
  id: string;
  language: string;
  filename: string;
  name: string;
  episode: string;
  path: string;
}

export interface Language {
  iso639_2: string;
  iso639Name: string;
}
