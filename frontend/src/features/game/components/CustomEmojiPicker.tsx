import { useState } from 'react';

// Unlock requirements for each category
const UNLOCK_REQUIREMENTS = {
  'Smileys': { totalMatches: 0, wins: 0 }, // Always unlocked
  'Animals': { totalMatches: 3, wins: 0 },
  'Food': { totalMatches: 6, wins: 5 },
  'Activities': { totalMatches: 10, wins: 3 },
  'Objects': { totalMatches: 15, wins: 5 },
  'Symbols': { totalMatches: 20, wins: 10 },
};

// Comprehensive emoji list organized by category
const EMOJI_CATEGORIES = {
  'Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
  'Animals': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🕸️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦥','🦦','🦨','🦩','🦚','🦜','🦢','🕊️','🐇','🦝','🦡','🐁','🐀','🐿️','🦔'],
  'Food': ['🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🥝','🍅','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲','🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦀','🦞','🦐','🦑','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯'],
  'Activities': ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩'],
  'Objects': ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴','💶','💷','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🧺','🧻','🪣','🧼','🪒','🧽','🧴','🛁','🛀','🧖','🚪','🪞','🪟','🛏️','🛋️','🪑','🚽','🪠','🚿','🛁','🪤','🪒','🧴','🧷','🧹','🧺','🧻','🪣','🧼','🪥','🪒','🧽'],
  'Symbols': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🈳','🈂️','🛂','🛃','🛄','🛅'],
};

interface CustomEmojiPickerProps {
  onSelect: (emoji: string) => void;
  usedEmojis?: string[]; // List of emojis already used by other players
  userStats?: { totalMatches: number; wins: number }; // User's game statistics
}

export const CustomEmojiPicker = ({ onSelect, usedEmojis = [], userStats = { totalMatches: 0, wins: 0 } }: CustomEmojiPickerProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Check if a category is unlocked
  const isCategoryUnlocked = (category: string): boolean => {
    if (category === 'All') return true;
    const req = UNLOCK_REQUIREMENTS[category as keyof typeof UNLOCK_REQUIREMENTS];
    if (!req) return true;
    return userStats.totalMatches >= req.totalMatches && userStats.wins >= req.wins;
  };

  // Get unlock message for locked category (short version for button)
  const getUnlockMessageShort = (category: string): string => {
    const req = UNLOCK_REQUIREMENTS[category as keyof typeof UNLOCK_REQUIREMENTS];
    if (!req) return '';
    const parts = [];
    if (req.totalMatches > 0) parts.push(`Games:${req.totalMatches}`);
    if (req.wins > 0) parts.push(`Wins:${req.wins}`);
    return parts.join(' ');
  };

  // Get unlock message for locked category
  const getUnlockMessage = (category: string): string => {
    const req = UNLOCK_REQUIREMENTS[category as keyof typeof UNLOCK_REQUIREMENTS];
    if (!req) return '';
    const parts = [];
    if (req.totalMatches > 0) parts.push(`${req.totalMatches} games`);
    if (req.wins > 0) parts.push(`${req.wins} wins`);
    return `Unlock: ${parts.join(' + ')}`;
  };

  // Filter emojis by category
  const displayEmojis = selectedCategory === 'All' 
    ? Object.entries(EMOJI_CATEGORIES)
        .filter(([category]) => isCategoryUnlocked(category))
        .flatMap(([, emojis]) => emojis)
    : EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES] || [];
  
  const categoryLocked = !isCategoryUnlocked(selectedCategory);

  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl w-52 max-h-64 flex flex-col z-50">
      {/* Category tabs */}
      <div className="flex gap-1 px-1.5 py-1.5 border-b border-slate-300 dark:border-slate-600 overflow-x-auto bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800" style={{ flexShrink: 0 }}>
        <button
          className={`px-1.5 py-0.5 text-xs font-bold rounded ${selectedCategory === 'Text' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-900 border-2 border-slate-400 hover:bg-slate-50'}`}
          onClick={() => onSelect('')}
          title="Use text (first letter)"
        >
          Text
        </button>
        <button
          className={`px-1.5 py-0.5 text-xs font-bold rounded ${selectedCategory === 'All' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-900 border-2 border-slate-400 hover:bg-slate-50'}`}
          onClick={() => setSelectedCategory('All')}
        >
          All
        </button>
        {Object.keys(EMOJI_CATEGORIES).map(cat => {
          const isUnlocked = isCategoryUnlocked(cat);
          const lockInfo = getUnlockMessageShort(cat);
          return (
            <button
              key={cat}
              className={`px-1.5 py-0.5 text-xs font-bold rounded whitespace-nowrap relative flex items-center gap-0.5 ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : isUnlocked
                    ? 'bg-white text-slate-900 border-2 border-slate-400 hover:bg-slate-50'
                    : 'bg-slate-300 text-slate-500 border-2 border-slate-400 opacity-60 hover:bg-slate-400'
              }`}
              onClick={() => setSelectedCategory(cat)}
              title={isUnlocked ? cat : getUnlockMessage(cat)}
            >
              {cat}
              {!isUnlocked && (
                <span className="text-[0.65rem] flex items-center gap-0.5">
                  <span>🔒</span>
                  <span className="opacity-80">{lockInfo}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Emoji grid */}
      <div className="flex-1 overflow-y-auto p-1">
        {categoryLocked ? (
          <div className="text-center py-8 px-4">
            <div className="text-4xl mb-2">🔒</div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category Locked
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {getUnlockMessage(selectedCategory)}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Your progress: {userStats.totalMatches} games, {userStats.wins} wins
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0.5">
            {displayEmojis.map((emoji, idx) => {
              const isUsed = usedEmojis.includes(emoji);
              return (
                <button
                  key={`${emoji}-${idx}`}
                  className={`text-lg p-1 rounded transition-colors ${
                    isUsed 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  onClick={() => !isUsed && onSelect(emoji)}
                  disabled={isUsed}
                  title={isUsed ? 'Already in use' : emoji}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        )}
        {displayEmojis.length === 0 && !categoryLocked && (
          <div className="text-center text-slate-400 py-8">
            No emojis found
          </div>
        )}
      </div>
    </div>
  );
};
