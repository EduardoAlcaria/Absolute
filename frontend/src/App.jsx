import { useState, useEffect, useRef, useCallback } from 'react';
import api from './api';
import { STATUSES, STYLES, VIEWS, PROTECTED_TITLES, loadGCMap, saveGCMap } from './constants';
import useSwipe from './hooks/useSwipe';

import SplashScreen from './components/SplashScreen';
import SearchPage from './components/SearchPage';
import InfoModal from './components/InfoModal';
import ShareSheet from './components/ShareSheet';
import GamesView from './components/GamesView';
import CategoriesView from './components/CategoriesView';
import CategoryDetailView from './components/CategoryDetailView';
import ConfigTab from './components/ConfigTab';
import CategoryAssignSheet from './components/CategoryAssignSheet';
import BottomNav from './components/BottomNav';

const USER_ID = 1;

const App = () => {
  const [showStartup, setShowStartup] = useState(true);
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [gameCategoryIds, setGameCategoryIds] = useState(loadGCMap);
  const [catBanners, setCatBanners] = useState({});

  const [currentView, setCurrentView] = useState('games');
  const [detailCat, setDetailCat] = useState(null);

  const [activeTab, setActiveTab] = useState('all');
  const [librarySearch, setLibrarySearch] = useState('');
  const [showLibrarySearch, setShowLibrarySearch] = useState(false);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [shareGame, setShareGame] = useState(null);
  const [infoGame, setInfoGame] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [assignOpen, setAssignOpen] = useState(false);

  const [user, setUser] = useState({ id: USER_ID, username: 'Player1', email: 'player@example.com' });

  const savedScrollRef = useRef(0);

  const navigate = useCallback((dir) => {
    savedScrollRef.current = window.scrollY;
    setCurrentView((prev) => {
      const next = VIEWS.indexOf(prev) + dir;
      return next >= 0 && next < VIEWS.length ? VIEWS[next] : prev;
    });
  }, []);

  const swipeHandlers = useSwipe({ onLeft: () => navigate(1), onRight: () => navigate(-1) });

  useEffect(() => {
    if (currentView === 'games') {
      requestAnimationFrame(() => window.scrollTo(0, savedScrollRef.current));
    }
  }, [currentView]);

  useEffect(() => {
    if (showStartup) return;
    api.getCategories(USER_ID).then((cats) => {
      if (cats?.length) {
        const statusIds = new Set(STATUSES.map((s) => s.id));
        setCategories(cats.filter((c) => !statusIds.has(c.id)).map((c) => ({ ...c, isDefault: false })));
      }
    });
    loadGames();
  }, [showStartup]);

  const loadGames = async () => {
    setIsLoading(true);
    const rows = await api.getGames(USER_ID);
    setGames((rows ?? []).map((g) => ({ ...g, image: g.image_url || null })));
    setIsLoading(false);
  };

  const handleAddGame = async (gameData) => {
    if (games.some((g) => g.igdb_id === gameData.id)) return;
    let image = gameData.cover_url || null;
    if (!image) {
      const coverData = await api.getGameCovers(gameData.id);
      image = coverData?.cover_url || null;
    }
    const saved = await api.addGame(USER_ID, {
      igdb_id:   gameData.id,
      title:     gameData.name,
      genre:     gameData.genre || '',
      image_url: image || '',
      status:    'to-play',
    });
    if (saved) setGames((prev) => [...prev, { ...saved, image: saved.image_url || null }]);
    return saved;
  };

  const handleStatusChange = async (gameId, newStatus) => {
    setGames((prev) =>
      prev.map((g) => g.id === gameId ? { ...g, status: newStatus, rating: newStatus !== 'beaten' ? null : g.rating } : g)
    );
    await api.updateGameStatus(USER_ID, gameId, newStatus);
  };

  const handleRatingChange = async (gameId, rating) => {
    setGames((prev) => prev.map((g) => (g.id === gameId ? { ...g, rating } : g)));
    await api.updateGameRating(USER_ID, gameId, rating);
  };

  const handleAddCategory = async (cat) => {
    const saved = await api.addCategory(USER_ID, cat);
    if (saved) setCategories((prev) => [...prev, { ...saved, isDefault: false }]);
  };

  const handleDeleteCategories = async (ids) => {
    await Promise.all(ids.map((id) => api.deleteCategory(USER_ID, id)));
    setCategories((prev) => prev.filter((c) => !ids.includes(c.id)));
    setGameCategoryIds((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((gid) => { next[gid] = next[gid].filter((cid) => !ids.includes(cid)); });
      saveGCMap(next);
      return next;
    });
  };

  const handleUpdateCategory = async (id, newLabel) => {
    const ok = await api.updateCategory(USER_ID, id, newLabel);
    if (ok) setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, label: newLabel } : c)));
  };

  const handleAssignCategories = (catIds) => {
    setGameCategoryIds((prev) => {
      const next = { ...prev };
      [...selectedIds].forEach((gid) => { next[String(gid)] = catIds; });
      saveGCMap(next);
      return next;
    });
  };

  const handleAssignSingle = (gameId, catIds) => {
    setGameCategoryIds((prev) => {
      const next = { ...prev, [String(gameId)]: catIds };
      saveGCMap(next);
      return next;
    });
  };

  const handleGameLongPress = (game) => {
    if (PROTECTED_TITLES.has(game.title?.toLowerCase().trim())) return;
    setSelectMode(true);
    setSelectedIds(new Set([game.id]));
  };

  const handleToggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleDeleteSelected = async () => {
    const ids = [...selectedIds];
    await Promise.all(ids.map((id) => api.deleteGame(USER_ID, id)));
    setGames((prev) => prev.filter((g) => !ids.includes(g.id)));
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const cancelSelectMode = () => { setSelectMode(false); setSelectedIds(new Set()); };

  const handleNavigate = (viewId) => {
    savedScrollRef.current = window.scrollY;
    setCurrentView(viewId);
    if (selectMode) cancelSelectMode();
  };

  const handleSaveProfile = (data) => setUser((prev) => ({ ...prev, ...data }));
  const handleLogout = () => { setUser(null); alert('Logged out.'); };

  const existingIgdbIds = new Set(games.map((g) => g.igdb_id).filter(Boolean));

  if (showStartup) return <SplashScreen onComplete={() => setShowStartup(false)} />;

  if (showSearchModal) {
    return (
      <div className="bg-[#0B0B0C]" style={{ minHeight: '100dvh' }}>
        <style>{STYLES}</style>
        <SearchPage
          onClose={() => setShowSearchModal(false)}
          onAddGame={handleAddGame}
          onAssignCategories={handleAssignSingle}
          categories={categories}
          existingIgdbIds={existingIgdbIds}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] overflow-x-hidden" {...swipeHandlers}>
      <style>{STYLES}</style>

      <InfoModal game={infoGame} onClose={() => setInfoGame(null)} />

      {currentView === 'games' && (
        <GamesView
          games={games}
          categories={categories}
          gameCategoryIds={gameCategoryIds}
          isLoading={isLoading}
          selectMode={selectMode}
          selectedIds={selectedIds}
          librarySearch={librarySearch}
          showLibrarySearch={showLibrarySearch}
          activeTab={activeTab}
          onSetActiveTab={setActiveTab}
          onSetLibrarySearch={setLibrarySearch}
          onToggleLibrarySearch={() => setShowLibrarySearch((v) => !v)}
          onOpenSearch={() => setShowSearchModal(true)}
          onStatusChange={handleStatusChange}
          onRatingChange={handleRatingChange}
          onShare={(g) => setShareGame(g)}
          onInfo={setInfoGame}
          onGameLongPress={handleGameLongPress}
          onToggleSelect={handleToggleSelect}
          onDeleteSelected={handleDeleteSelected}
          onTag={() => setAssignOpen(true)}
          onCancelSelect={cancelSelectMode}
        />
      )}

      {currentView === 'categories' && !detailCat && (
        <CategoriesView
          categories={categories}
          games={games}
          gameCategoryIds={gameCategoryIds}
          catBanners={catBanners}
          onSetBanner={(id, url) => setCatBanners((prev) => ({ ...prev, [id]: url }))}
          onAddCategory={handleAddCategory}
          onDeleteCategories={handleDeleteCategories}
          onUpdateCategory={handleUpdateCategory}
          onEnterCategory={setDetailCat}
          swipeHandlers={swipeHandlers}
        />
      )}

      {currentView === 'categories' && detailCat && (
        <CategoryDetailView
          category={detailCat}
          games={games}
          gameCategoryIds={gameCategoryIds}
          catBanners={catBanners}
          onStatusChange={handleStatusChange}
          onBack={() => setDetailCat(null)}
        />
      )}

      {currentView === 'config' && (
        <ConfigTab
          user={user}
          onLogout={handleLogout}
          onSaveProfile={handleSaveProfile}
          onBack={() => setCurrentView('games')}
        />
      )}

      <BottomNav currentView={currentView} onNavigate={handleNavigate} />

      {shareGame && <ShareSheet game={shareGame} onClose={() => setShareGame(null)} />}

      {assignOpen && (
        <CategoryAssignSheet
          categories={categories}
          gameIds={[...selectedIds]}
          gameCategoryIds={gameCategoryIds}
          onApply={handleAssignCategories}
          onClose={() => setAssignOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
