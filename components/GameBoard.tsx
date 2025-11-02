
import React from 'react';
import { Guess, Letter, LetterState } from '../types';
import { MAX_ATTEMPTS, WORD_LENGTH } from '../constants';

interface GameBoardProps {
  guesses: Guess[];
  currentGuess: string;
  currentAttempt: number;
}

const getCellStyle = (state: LetterState): string => {
  switch (state) {
    case LetterState.Correct:
      return 'bg-yellow-500 border-yellow-500 text-white';
    case LetterState.Present:
      return 'bg-gray-100 border-gray-100 text-gray-900';
    case LetterState.Absent:
      return 'bg-gray-700 border-gray-700 text-white';
    case LetterState.Typing:
        return 'bg-gray-900 border-gray-500 text-gray-100';
    case LetterState.Empty:
    default:
      return 'bg-gray-900 border-gray-600';
  }
};

const Cell: React.FC<{ letter?: Letter }> = ({ letter }) => {
  const char = letter?.char || '';
  const state = letter?.state ?? LetterState.Empty;
  const style = getCellStyle(state);
  const animationClass = state !== LetterState.Empty && state !== LetterState.Typing ? 'animate-flip' : '';

  return (
    <div
      className={`w-14 h-14 sm:w-16 sm:h-16 border-2 rounded-md flex items-center justify-center text-3xl font-bold uppercase transition-all duration-300 ${style} ${animationClass}`}
    >
      {char}
    </div>
  );
};

const GameRow: React.FC<{ guess?: Guess }> = ({ guess }) => (
  <div className="grid grid-cols-5 gap-1.5">
    {Array.from({ length: WORD_LENGTH }).map((_, i) => (
      <Cell key={i} letter={guess?.[i]} />
    ))}
  </div>
);

const CurrentRow: React.FC<{ currentGuess: string }> = ({ currentGuess }) => {
    const letters = currentGuess.padEnd(WORD_LENGTH, ' ').split('');
    const guess: Guess = letters.map(char => ({
        char: char.trim(),
        state: char.trim() ? LetterState.Typing : LetterState.Empty,
    }));
    return <GameRow guess={guess} />;
};

const GameBoard: React.FC<GameBoardProps> = ({ guesses, currentGuess, currentAttempt }) => {
  const emptyRowsCount = MAX_ATTEMPTS - guesses.length - 1;

  return (
    <div className="flex flex-col gap-1.5 p-2">
      {guesses.map((guess, i) => (
        <GameRow key={i} guess={guess} />
      ))}
      {currentAttempt < MAX_ATTEMPTS && <CurrentRow currentGuess={currentGuess} />}
      {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, i) => <GameRow key={i} />)}
    </div>
  );
};

export default GameBoard;
