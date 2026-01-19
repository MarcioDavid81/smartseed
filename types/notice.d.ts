export type Notice = {
  id: number;
  title: { rendered: string };
  date: string;
  acf: {
    slug: string;
    content: string;
    thumbnail: string;
    subtitle: string;
    category: { name: string };
    author: { data: { display_name: string } };
  };
};