'use i18n';
import React from 'react';
import Ship, { getShipType } from '../Ship';

export default function PlayersList({ players, currentPlayerId }) {
  const playerList = Object.values(players || {});
  const alivePlayers = playerList.filter(p => p.isAlive);
  const eliminatedPlayers = playerList.filter(p => p.isEliminated);

  return (
    <div className="panel-space flex-shrink-0">
      <h3 className="font-pixel text-sm mb-3 text-gray-900">PLAYERS</h3>
      
      <div className="space-y-2">
        <p className="font-game text-lg text-green-600">ALIVE</p>
        {alivePlayers.map((player, index) => (
          <div key={player.id} className="flex items-center gap-2">
            <Ship type={getShipType(playerList.indexOf(player))} size="sm" />
            <span className="font-game text-sm text-gray-900">
              {player.username}
              {player.id === currentPlayerId && ' (You)'}
            </span>
          </div>
        ))}
      </div>

      {eliminatedPlayers.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="font-game text-lg text-red-600">ELIMINATED</p>
          {eliminatedPlayers.map((player, index) => (
            <div key={player.id} className="flex items-center gap-2 opacity-50">
              <Ship type={getShipType(playerList.indexOf(player))} size="sm" />
              <span className="font-game text-sm line-through text-gray-600">
                {player.username}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}