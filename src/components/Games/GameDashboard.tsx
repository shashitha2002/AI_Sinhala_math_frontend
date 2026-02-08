import React, { useState } from 'react';
import MathGame from './MathGame';
import NumberSequenceGame from './NumberSequenceGame';
import AlgebraSolverGame from './AlgebraSolverGame';
import GeometryPuzzleGame from './GeometryPuzzleGame';
import ActivityCalendar from './ActivityCalendar';
import { useTranslation } from '../../hooks/useTranslation';
import { CalculatorIcon, PuzzlePieceIcon, ChartBarIcon } from '@heroicons/react/24/outline'; // PlayIcon unused in this file

interface GameDashboardProps {
    user?: any;
}

const GameDashboard: React.FC<GameDashboardProps> = ({ user }) => {
    const { t } = useTranslation();
    const [selectedGame, setSelectedGame] = useState('quick-math');

    const games = [
        { id: 'quick-math', name: t('games.quickMath') || 'Quick Math', icon: CalculatorIcon, component: MathGame },
        { id: 'number-sequence', name: t('games.numberSequence') || 'Number Sequence', icon: ChartBarIcon, component: NumberSequenceGame },
        { id: 'algebra-solver', name: t('games.algebraSolver') || 'Algebra Solver', icon: CalculatorIcon, component: AlgebraSolverGame },
        { id: 'geometry-puzzle', name: t('games.geometryPuzzle') || 'Geometry Puzzle', icon: PuzzlePieceIcon, component: GeometryPuzzleGame }
    ];

    const SelectedGameComponent = games.find(g => g.id === selectedGame)?.component || MathGame;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="mb-4 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 break-words">{t('games.mathGames') || 'Math Games'}</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('games.playAndPractice') || 'Play games to practice your math skills!'}</p>
            </div>

            {/* Game Type Selector */}
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {games.map((game) => {
                    const Icon = game.icon;
                    return (
                        <button
                            key={game.id}
                            onClick={() => setSelectedGame(game.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedGame === game.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-md'
                                : 'border-gray-200 dark:border-dominant-700 bg-white dark:bg-dominant-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-dominant-600 hover:shadow-sm'
                                }`}
                        >
                            <Icon className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                            <span className="text-xs sm:text-sm font-medium text-center">{game.name}</span>
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Game Area */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                    <SelectedGameComponent />
                </div>

                {/* Activity Calendar */}
                <div className="lg:col-span-1 order-1 lg:order-2">
                    <ActivityCalendar userId={user?._id} />
                </div>
            </div>
        </div>
    );
};

export default GameDashboard;
