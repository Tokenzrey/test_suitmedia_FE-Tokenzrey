export interface SuitmediaIdeas {
  data: IdeaPost[];
  links: Links;
  meta: Meta;
}
export interface IdeaPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  published_at: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  small_image: IdeaImage[];
  medium_image: IdeaImage[];
}
export interface IdeaImage {
  id: number;
  mime: string;
  file_name: string;
  url: string;
}
export interface Links {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}
export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  links: Link[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}
export interface Link {
  url?: string;
  label: string;
  active: boolean;
}
