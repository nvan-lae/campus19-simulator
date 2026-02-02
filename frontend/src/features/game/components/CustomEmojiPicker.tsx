import { useState } from 'react';

// Comprehensive emoji list organized by category
const EMOJI_CATEGORIES = {
  'Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
  'Animals': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷️','🕸️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦥','🦦','🦨','🦩','🦚','🦜','🦢','🕊️','🐇','🦝','🦡','🐁','🐀','🐿️','🦔'],
  'Food': ['🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🥝','🍅','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🥨','🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲','🥣','🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦀','🦞','🦐','🦑','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯'],
  'Activities': ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤼','🤸','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🎰','🧩'],
  'Objects': ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💸','💵','💴','💶','💷','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','💈','⚗️','🔭','🔬','🕳️','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🧺','🧻','🪣','🧼','🪒','🧽','🧴','🛁','🛀','🧖','🚪','🪞','🪟','🛏️','🛋️','🪑','🚽','🪠','🚿','🛁','🪤','🪒','🧴','🧷','🧹','🧺','🧻','🪣','🧼','🪥','🪒','🧽'],
  'Symbols': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🈳','🈂️','🛂','🛃','🛄','🛅'],
};

const ALL_EMOJIS = Object.values(EMOJI_CATEGORIES).flat();

interface CustomEmojiPickerProps {
  onSelect: (emoji: string) => void;
  usedEmojis?: string[]; // List of emojis already used by other players
}

export const CustomEmojiPicker = ({ onSelect, usedEmojis = [] }: CustomEmojiPickerProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter emojis by category
  const displayEmojis = selectedCategory === 'All' 
    ? ALL_EMOJIS 
    : EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES] || [];

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
        {Object.keys(EMOJI_CATEGORIES).map(cat => (
          <button
            key={cat}
            className={`px-1.5 py-0.5 text-xs font-bold rounded whitespace-nowrap ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-900 border-2 border-slate-400 hover:bg-slate-50'}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="flex-1 overflow-y-auto p-1">
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
        {displayEmojis.length === 0 && (
          <div className="text-center text-slate-400 py-8">
            No emojis found
          </div>
        )}
      </div>
    </div>
  );
};
