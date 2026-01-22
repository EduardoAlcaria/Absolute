import { useState, useRef } from 'react';
import { ChevronLeft, User, LogOut } from 'lucide-react';
import BtnPrimary from './BtnPrimary';

const Section = ({ title, children }) => (
  <div className="bg-[#151517] rounded-3xl p-4 mb-3">
    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-4 px-1">{title}</p>
    {children}
  </div>
);

const Field = ({ label, defaultValue, inputRef, type = 'text', placeholder, mono = false }) => (
  <div className="mb-3">
    <label className="block text-zinc-500 text-xs font-medium mb-1.5 px-1">{label}</label>
    <input
      ref={inputRef}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      className={`w-full h-11 bg-[#1C1C1F] text-zinc-200 px-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#635BFF] placeholder-zinc-700 ${mono ? 'font-mono' : ''}`}
    />
  </div>
);

const ConfigTab = ({ user, onLogout, onSaveProfile, onBack }) => {
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const serverUrlRef = useRef(null);
  const [urlSaved, setUrlSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSave = () => {
    onSaveProfile({ username: usernameRef.current?.value || '', email: emailRef.current?.value || '' });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveServerUrl = () => {
    localStorage.setItem('serverUrl', (serverUrlRef.current?.value || '').trim());
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2000);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100dvh' }}>
      <div className="sticky top-0 z-10 bg-[#0B0B0C] px-4 py-3 flex items-center gap-3 border-b border-[#151517]">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1C1C1F] text-zinc-400 active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-white font-semibold text-base">Settings</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pt-4 pb-28">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#635BFF]/20 flex items-center justify-center mb-2">
            <User size={28} className="text-[#635BFF]" />
          </div>
          <p className="text-white font-semibold text-sm">{user?.username || 'Player'}</p>
          <p className="text-zinc-600 text-xs">{user?.email || 'No email set'}</p>
        </div>

        <Section title="Profile">
          <Field label="Username" defaultValue={user?.username || ''} inputRef={usernameRef} placeholder="Enter username" />
          <Field label="Email"    defaultValue={user?.email    || ''} inputRef={emailRef}    placeholder="Enter email" type="email" />
          <BtnPrimary onClick={handleSave} className="w-full mt-1">
            {profileSaved ? '✓ Saved' : 'Save Profile'}
          </BtnPrimary>
        </Section>

        <Section title="Server Connection">
          <p className="text-zinc-600 text-xs leading-relaxed mb-3 px-1">
            Set the backend URL for your device.<br />
            <span className="text-zinc-400">Real device: </span><span className="font-mono text-zinc-300">http://192.168.X.X:8000</span><br />
            <span className="text-zinc-400">Emulator: </span><span className="font-mono text-zinc-300">http://10.0.2.2:8000</span>
          </p>
          <Field
            label="API URL"
            defaultValue={localStorage.getItem('serverUrl') || 'http://localhost:8000'}
            inputRef={serverUrlRef}
            placeholder="http://192.168.1.X:8000"
            type="url"
            mono
          />
          <BtnPrimary onClick={handleSaveServerUrl} className="w-full mt-1">
            {urlSaved ? '✓ Saved' : 'Save URL'}
          </BtnPrimary>
        </Section>

        <Section title="Account">
          <button
            onClick={onLogout}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 text-red-400 text-sm font-semibold active:scale-95 active:brightness-90 transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </Section>

        <p className="text-center text-zinc-700 text-xs pb-4">Absolute v1.0</p>
      </div>
    </div>
  );
};

export default ConfigTab;
