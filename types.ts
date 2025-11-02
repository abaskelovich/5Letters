
export enum LetterState {
  Correct, 
  Present, 
  Absent,  
  Empty,   
  Typing,  
}

export interface Letter {
  char: string;
  state: LetterState;
}

export type Guess = Letter[];

export enum GameStatus {
  Playing,
  Won,
  Lost,
}
