import { Gamepad2, LayoutGrid, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'games',      icon: <Gamepad2   size={22} />, label: 'Games'      },
  { id: 'categories', icon: <LayoutGrid size={22} />, label: 'Categories' },
  { id: 'config',     icon: <Settings   size={22} />, label: 'Settings'   },
];

const BottomNav = ({ currentView, onNavigate }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-[#0B0B0C]/95 backdrop-blur-sm border-t border-[#151517] pb-safe z-30">
    <div className="flex justify-around px-4 py-2">
      {NAV_ITEMS.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-all active:scale-90 ${
            currentView === id ? 'text-[#635BFF]' : 'text-zinc-600'
          }`}
        >
          {icon}
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default BottomNav;
