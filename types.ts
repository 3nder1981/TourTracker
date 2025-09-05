
export interface Band {
  name: string;
  isFavorite: boolean;
}

export interface Concert {
  id: string;
  bandName: string;
  date: string;
  city: string;
  country: string;
  venue: string;
  ticketUrl: string;
  isFavorite: boolean;
  reminderDays: number | null;
  ticketPurchased: boolean;
}
