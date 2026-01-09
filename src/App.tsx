import { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Log from './pages/Log';
import Plans from './pages/Plans';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import Splash from './pages/Splash';
import { Toaster } from 'sonner';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const theme = useAppStore(state => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <Splash />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/log" element={<Log />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          classNames: {
            toast: 'rounded-2xl border-none shadow-xl bg-white/90 backdrop-blur-md font-medium',
            title: 'text-base',
            description: 'text-slate-500',
            actionButton: 'bg-blue-500',
            cancelButton: 'bg-slate-200',
          },
          style: {
            borderRadius: '16px',
            padding: '16px',
          }
        }}
      />
    </Router>
  );
}

export default App;
