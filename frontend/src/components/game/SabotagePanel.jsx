'use i18n';
import React from 'react';
import { motion } from 'framer-motion';
import { Snowflake, Bug } from 'lucide-react';

export default function SabotagePanel({ onSabotage, isFrozen }) {
  return (
    <motion.div
      className="panel-space flex-1"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <h3 className="font-pixel text-lg mb-4 text-red-600">SABOTAGE</h3>
      <div className="space-y-3">
        <button
          onClick={() => onSabotage('FREEZE')}
          disabled={isFrozen}
          className={`w-full btn-space red text-sm flex items-center justify-center gap-2 ${
            isFrozen ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Snowflake className="w-4 h-4" />
          Jam Comms (5s)
        </button>
        <button
          onClick={() => onSabotage('CORRUPT')}
          className="w-full btn-space red text-sm flex items-center justify-center gap-2"
        >
          <Bug className="w-4 h-4" />
          Inject Malware
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-red-100 border-2 border-red-500 rounded">
        <p className="font-pixel text-xs text-red-800 mb-2">IMPOSTER TIPS:</p>
        <p className="font-game text-sm text-gray-800">
          • Jam: Freezes typing for 5s
          <br />
          • Corrupt: Adds code errors
        </p>
      </div>
    </motion.div>
  );
}