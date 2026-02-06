'use i18n';
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import Ship, { getShipType } from './Ship';
import Starfield from './Starfield';

export default function Lobby({ onStartGame }) {
  const { state } = useGame();
  const [isStarting, setIsStarting] = useState(false);
  
  const playerList = Object.values(state.players || {});
  const currentPlayer = state.players?.[state.playerId];
  const isHost = currentPlayer?.isHost;
  const canStart = playerList.length >= 3;

  console.log('🎮 Lobby Debug:', {
    playerId: state.playerId,
    currentPlayer,
    isHost,
    playerCount: playerList.length,
    canStart,
    players: state.players
  });

  // ✅ FIX: Debounce start button
  const handleStartGame = () => {
    if (isStarting) {
      console.log('⚠️ Start already in progress, ignoring click');
      return;
    }
    
    setIsStarting(true);
    console.log('🎮 Starting game...');
    onStartGame();
    
    // Reset after 3 seconds (in case something fails)
    setTimeout(() => {
      setIsStarting(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <Starfield />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="panel-space w-full max-w-2xl relative z-10"
      >
        {/* Title with Glow */}
        <motion.h1
          className="font-pixel text-4xl text-center mb-8 text-gray-900"
          animate={{ textShadow: ['0 0 10px #ffb366', '0 0 20px #ff9933', '0 0 10px #ffb366'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          CODE MAFIA LOBBY
        </motion.h1>

        {/* Room Code */}
        <div className="mb-8 text-center">
          <p className="font-game text-2xl mb-2 text-gray-700">Room Code</p>
          <div className="inline-block bg-white border-4 border-brown-dark px-8 py-4 shadow-pixel">
            <span className="font-pixel text-3xl text-gray-900">{state.roomId}</span>
          </div>
        </div>

        {/* Players List */}
        <div className="mb-8">
          <h2 className="font-game text-3xl mb-4 text-gray-900">
            Players ({playerList.length}/5)
          </h2>
          
          <div className="space-y-3">
            {playerList.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="player-card-space"
              >
                <Ship type={getShipType(index)} size="lg" />
                <div className="flex-1">
                  <span className="font-game text-2xl text-gray-900">
                    {player.username}
                    {player.id === state.playerId && " (You)"}
                  </span>
                </div>
                {player.isHost && (
                  <div className="bg-orange border-2 border-brown-dark px-4 py-1 shadow-pixel-sm">
                    <span className="font-pixel text-xs text-gray-900">HOST</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Start Button or Waiting */}
        {isHost ? (
          <div>
            {!canStart && (
              <motion.p
                className="font-game text-xl text-red-600 mb-4 text-center"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Need at least 3 players to start
              </motion.p>
            )}
            <button
              onClick={handleStartGame}
              disabled={!canStart || isStarting}
              className={`btn-space green w-full ${(!canStart || isStarting) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isStarting ? 'STARTING...' : 'START GAME'}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-game text-2xl text-gray-700 mb-4">
              Waiting for host to start...
            </p>
            <div className="spinner-space mx-auto"></div>
          </div>
        )}
      </motion.div>
    </div>
  );
}