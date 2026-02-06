'use i18n';
import React from 'react';
import { Loader2, Terminal, Snowflake } from 'lucide-react';

export default function ControlPanel({ 
  stageTitle, 
  onRunTests, 
  isBusy, 
  isFrozen, 
  isEliminated, 
  runnerName, 
  isMyTest,
  terminalLogs,
  terminalEndRef
}) {
  return (
    <div className="panel-space flex-1 flex flex-col">
      <h3 className="font-pixel text-sm mb-4 text-green-600">
        {stageTitle}
      </h3>
      
      <button
        onClick={onRunTests}
        disabled={isBusy || isEliminated || isFrozen}
        className={`btn-space green w-full text-sm flex items-center justify-center gap-2 ${
          isBusy || isEliminated || isFrozen ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isBusy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isMyTest ? 'Testing...' : `${runnerName} testing...`}
          </>
        ) : isFrozen ? (
          <>
            <Snowflake className="w-4 h-4" />
            Systems Frozen
          </>
        ) : (
          <>
            <Terminal className="w-4 h-4" />
            Run Tests
          </>
        )}
      </button>

      {/* Terminal Output */}
      <div className="mt-4 bg-black border-4 border-brown-dark p-3 h-64 overflow-y-auto font-mono text-xs flex-1">
        {terminalLogs.length === 0 ? (
          <div className="text-green-400">Ready to compile...</div>
        ) : (
          terminalLogs.map((log, i) => (
            <div key={i} className="text-green-400 mb-1">
              {log}
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}