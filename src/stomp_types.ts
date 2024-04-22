import { Base64audio } from "types";

export { Base64audio } from "types";

export type Timestamped<T> = {
    timestamp: number;
    message: T;
}

export type PlayerAudio = {
    userID: string;
    audioData: Base64audio;
}

export type PlayerAndRoomID = {
    userID: string;
    roomID: number;
}

export type AnswerGuess = {
    userID: string;
    roomID: number;
    guess: string;
    roundNum: number;
    currentSpeakerID: number;
}

export type StompResponse = {
    success: boolean;
    message: string; // error message
}