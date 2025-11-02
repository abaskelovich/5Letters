
import React, { useState, useEffect, useCallback } from 'react';
import { getWords, validateWord } from './services/geminiService';
import { LetterState, Guess, GameStatus } from './types';
import { WORD_LENGTH, MAX_ATTEMPTS } from './constants';
import GameBoard from './components/GameBoard';
import Modal from './components/Modal';

const evaluateGuess = (guess: string, target: string): Guess => {
  const result: Guess = [];
  const targetLetters = target.split('');

  // Pass 1: Find correct letters (green)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === target[i]) {
      result[i] = { char: guess[i], state: LetterState.Correct };
      targetLetters[i] = ''; // Mark as used
    }
  }

  // Pass 2: Find present (yellow) and absent (gray) letters
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (!result[i]) {
      const char = guess[i];
      const presentIndex = targetLetters.indexOf(char);
      if (presentIndex !== -1) {
        result[i] = { char, state: LetterState.Present };
        targetLetters[presentIndex] = ''; // Mark as used
      } else {
        result[i] = { char, state: LetterState.Absent };
      }
    }
  }
  return result;
};


const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.Playing);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<number>(0);
  const [targetWord, setTargetWord] = useState<string>('');
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [wordList, setWordList] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const newGame = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const words = await getWords();
    setWordList(words);
    if (words.length > 0) {
        setTargetWord(words[Math.floor(Math.random() * words.length)]);
    } else {
        setError("Не удалось загрузить слова. Попробуйте обновить страницу.");
    }
    setGuesses([]);
    setCurrentAttempt(0);
    setCurrentGuess('');
    setStatus(GameStatus.Playing);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    newGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    if (value.length <= WORD_LENGTH && /^[а-яё]*$/.test(value)) {
      setCurrentGuess(value);
    }
  };
  
  const handleGuessSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentGuess.length !== WORD_LENGTH || status !== GameStatus.Playing) {
      setError("Слово должно состоять из 5 букв.");
      setTimeout(() => setError(null), 2000);
      return;
    }

    setIsChecking(true);
    setError(null);
    
    const isValid = await validateWord(currentGuess);
    
    if (!isValid) {
      setIsChecking(false);
      setError("Такого слова нет в словаре.");
      setTimeout(() => setError(null), 2000);
      return;
    }

    const evaluated = evaluateGuess(currentGuess, targetWord);
    setGuesses([...guesses, evaluated]);
    setCurrentAttempt(currentAttempt + 1);
    setCurrentGuess('');
    setIsChecking(false);

    if (currentGuess === targetWord) {
      setStatus(GameStatus.Won);
    } else if (currentAttempt + 1 >= MAX_ATTEMPTS) {
      setStatus(GameStatus.Lost);
    }
  };
  
  if (isLoading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl font-bold mb-4">Загрузка...</h1>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <header className="mb-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-wider uppercase">5 Букв</h1>
            <p className="text-gray-400">Угадай слово за {MAX_ATTEMPTS} попыток</p>
        </header>

        <main className="flex flex-col items-center">
            <GameBoard guesses={guesses} currentGuess={currentGuess} currentAttempt={currentAttempt} />
            
            {status === GameStatus.Playing && (
                <form onSubmit={handleGuessSubmit} className="mt-6 w-full max-w-xs">
                    <input
                        type="text"
                        value={currentGuess}
                        onChange={handleInputChange}
                        maxLength={WORD_LENGTH}
                        className="w-full p-3 text-center bg-gray-800 border-2 border-gray-600 rounded-md text-xl uppercase tracking-[0.2em] focus:outline-none focus:border-yellow-500 transition-colors"
                        placeholder="_ _ _ _ _"
                        autoFocus
                        disabled={isChecking}
                    />
                    <button type="submit" disabled={isChecking || currentGuess.length < WORD_LENGTH} className="w-full mt-3 p-3 bg-yellow-500 text-gray-900 font-bold rounded-md hover:bg-yellow-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isChecking ? 'Проверка...' : 'Угадать'}
                    </button>
                </form>
            )}
             {error && <div className="mt-4 text-red-400 bg-red-900/50 px-4 py-2 rounded-md">{error}</div>}
        </main>
        
        <Modal
            isOpen={status === GameStatus.Won || status === GameStatus.Lost}
            title={status === GameStatus.Won ? 'Вы победили!' : 'Вы проиграли!'}
            message={status === GameStatus.Lost ? `Загаданное слово было: ${targetWord.toUpperCase()}` : 'Отличная работа!'}
            onConfirm={newGame}
            confirmText="Играть снова"
        />
    </div>
  );
};

export default App;
