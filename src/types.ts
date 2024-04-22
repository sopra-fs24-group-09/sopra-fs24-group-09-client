export type User = {
  status: any;
  username: string;
  avatar: string;
  name: string;
  id: number;
  registerDate: Date;
  birthday: Date;
};

export type Room = {
  id: string | null;
  roomOwnerId: string | null;
  roomPlayersList: User[] | null;
  theme: string | null;
  status: string | null;
  maxPlayersNum: number | null;
  alivePlayersList: User[] | null;
  currentPlayerIndex: number | null;
  playToOuted: boolean | null;
};

// export type Base64audio = `data:audio/${string};base64,${string}`;
export type Base64audio = string;
