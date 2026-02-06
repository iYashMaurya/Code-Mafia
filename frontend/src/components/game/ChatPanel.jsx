'use i18n';
import React from 'react';

export default function ChatPanel({ 
  messages, 
  chatMessage, 
  onMessageChange, 
  onSendMessage, 
  isEliminated, 
  isFrozen,
  chatEndRef 
}) {
  return (
    <div className="panel-space h-48 flex flex-col">
      <h3 className="font-pixel text-sm mb-3 text-gray-900">CHAT</h3>
      
      <div className="flex-1 overflow-y-auto mb-3 space-y-2 min-h-0">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message-space">
            {msg.system ? (
              <span className="font-game text-sm italic text-gray-600">{msg.text}</span>
            ) : (
              <>
                <span className="font-game text-sm font-bold text-orange">
                  {msg.username}:
                </span>
                <span className="font-game text-sm ml-2 text-gray-900">{msg.text}</span>
              </>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {!isEliminated && (
        <div className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={onMessageChange}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Type message..."
            className="input-space flex-1 text-sm py-1"
            disabled={isFrozen}
          />
          <button
            onClick={onSendMessage}
            disabled={isFrozen}
            className={`btn-space green text-xs px-4 ${isFrozen ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            SEND
          </button>
        </div>
      )}
    </div>
  );
}