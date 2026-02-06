import { useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';

const getUserId = () => {
  let userId = localStorage.getItem('code-mafia-userId');
  
  if (!userId) {

    userId = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('code-mafia-userId', userId);
    console.log('Generated new userId:', userId);
  } else {
    console.log('Using existing userId:', userId);
  }
  
  return userId;
};

export function useWebSocket(roomId) {
  const { state, dispatch } = useGame();

  const WS_BASE =
  import.meta.env.VITE_WS_URL || 'ws://localhost:8080';

  useEffect(() => {
    if (!roomId) {
      console.log('⚠️ No roomId provided');
      return;
    }

    const userId = getUserId();

    console.log('Connecting to room:', roomId, 'with userId:', userId);
    
    const ws = new WebSocket(`${WS_BASE}/ws?room=${roomId}&userId=${userId}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      dispatch({ type: 'SET_CONNECTED', payload: true });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received:', message.type);

        switch (message.type) {
          case 'ERROR_ACCESS_DENIED':
            alert(message.data.message || 'Cannot join - game already started');
            window.location.href = '/';
            return;

          case 'INIT':
            console.log('   INIT - PlayerID:', message.data.playerID);
            console.log('   Reconnect:', message.data.isReconnect);
            
            dispatch({ type: 'SET_PLAYER_ID', payload: message.data.playerID });
            dispatch({ type: 'SET_ROOM_ID', payload: message.data.roomID });
            
            const username = state.username || localStorage.getItem('username');
            
            if (username && username.trim()) {
              ws.send(JSON.stringify({
                type: 'JOIN',
                data: { username: username }
              }));
            }
            break;

          case 'SELF':
            dispatch({ 
              type: 'SET_PLAYERS', 
              payload: { 
                ...state.players, 
                [message.data.id]: message.data 
              } 
            });
            break;

          case 'PLAYER_LIST':
            dispatch({ type: 'SET_PLAYERS', payload: message.data });
            break;

          case 'GAME_STATE':
            dispatch({ type: 'SET_GAME_STATE', payload: message.data });
            break;

          case 'SYNC_TIMER':
            dispatch({ type: 'SYNC_TIMER', payload: message.data });
            break;

          case 'CHANGE_SCENE':
            dispatch({ type: 'CHANGE_SCENE', payload: message.data });
            break;

          case 'VOTE_UPDATE':
            dispatch({ type: 'UPDATE_VOTES', payload: message.data });
            break;

          case 'VOTE_RESULT':
            dispatch({ 
              type: 'ADD_MESSAGE', 
              payload: { 
                text: message.data.eliminated 
                  ? `${state.players[message.data.eliminated]?.username} was eliminated!`
                  : 'No one was eliminated.',
                system: true 
              } 
            });
            break;

          case 'ALL_VOTES_IN':
            dispatch({
              type: 'ADD_MESSAGE',
              payload: { text: message.data.message, system: true }
            });
            break;

          case 'TEST_LOCKED':
            dispatch({ type: 'TEST_LOCKED', payload: message.data });
            break;

          case 'TEST_COMPLETE':
            dispatch({ type: 'TEST_COMPLETE', payload: message.data });
            break;

          case 'TEST_CANCELLED':
            dispatch({ type: 'TEST_CANCELLED', payload: message.data });
            break;

          case 'ERROR_BUSY':
            dispatch({ type: 'ERROR_BUSY', payload: message.data });
            break;

          case 'PLAYER_ELIMINATED':
            dispatch({ 
              type: 'ADD_MESSAGE', 
              payload: { 
                text: `${message.data.username} was eliminated!`,
                system: true 
              } 
            });
            break;

          case 'CHAT':
            dispatch({ type: 'ADD_MESSAGE', payload: message.data });
            break;

          case 'GAME_ENDED':
            if (message.data.finalState) {
              dispatch({ type: 'SET_GAME_STATE', payload: message.data.finalState });
            }
            dispatch({ type: 'SET_PHASE', payload: 'GAME_OVER' });
            dispatch({ 
              type: 'ADD_MESSAGE', 
              payload: { 
                text: `Game ended: ${message.data.reason}`,
                system: true 
              } 
            });
            break;

          case 'ERROR':
            console.error('  Server error:', message.data.message);
            dispatch({
              type: 'ADD_MESSAGE',
              payload: { text: 'Error: ' + message.data.message, system: true }
            });
            break;

          case 'NEW_HOST_ASSIGNED':
            dispatch({
              type: 'ADD_MESSAGE',
              payload: { text: ` ${message.data.newHostName} is now the host`, system: true }
            });
            break;

          default:
            console.warn(' Unknown message:', message.type);
        }
      } catch (error) {
        console.error(' Parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error(' WebSocket error:', error);
      dispatch({ type: 'SET_CONNECTED', payload: false });
    };

    ws.onclose = () => {
      console.log(' WebSocket disconnected');
      dispatch({ type: 'SET_CONNECTED', payload: false });
    };

    dispatch({ type: 'SET_WS', payload: ws });

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId]);

  const sendMessage = useCallback((type, data) => {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify({ type, data }));
    }
  }, [state.ws]);

  return { sendMessage, connected: state.connected };
}