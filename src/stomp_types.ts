import { Base64audio } from "types";

export { Base64audio } from "types";

export type Timestamped<T> = {
    timestamp: number;
    message: T;
}

export type PlayerAudio = {
    userID: number;
    audioData: Base64audio;
}

export type PlayerAndRoomID = {
    userID: number;
    roomID: number;
}

export type AnswerGuess = {
    userID: number;
    roomID: number;
    guess: string;
    roundNum: number;
    currentSpeakerID: number;
}

export type StompResponse = {
    success: boolean;
    message: string; // error message
}