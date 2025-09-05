
export interface Band {
  name: string;
  isFavorite: boolean;
}

export interface Concert {
  bandName: string;
  date: string;
  city: string;
  country: string;
  venue: string;
  ticketUrl: string;
  isFavorite: boolean;
}
