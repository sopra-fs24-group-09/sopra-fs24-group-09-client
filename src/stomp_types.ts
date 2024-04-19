import { Base64audio } from "types";

type Timestamped<T> = {
    timestamp: number;
    data: T;
}

export type PlayerAudio = {
    userID: number;
    audioData: Base64audio;
}