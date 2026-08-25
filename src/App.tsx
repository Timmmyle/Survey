import { useState, useEffect } from 'react';
import { BrandSurveyRespondent } from './components/survey/BrandSurveyRespondent';
import { AdminDashboard } from './components/survey/AdminDashboard';
import { Clipboard, BarChart3, HelpCircle } from 'lucide-react';

interface ParsedRoute {
  route: 'survey' | 'admin';
}

function App() {
  // Simple, bulletproof hash routing system
  const parseRoute = (): ParsedRoute => {
    const path = window.location.pathname;
    const hash = window.location.hash;

    if (hash === '#/admin' || path === '/admin' || path.endsWith('/admin')) {
      return { route: 'admin' };
    }
    return { route: 'survey' };
  };

  const initialRoute = parseRoute();
  const [currentRoute, setCurrentRoute] = useState<'survey' | 'admin'>(initialRoute.route);

  // Listen to hash and browser back/forward buttons
  useEffect(() => {
    const handleRouteUpdate = () => {
      const parsed = parseRoute();
      setCurrentRoute(parsed.route);
    };
    window.addEventListener('popstate', handleRouteUpdate);
    window.addEventListener('hashchange', handleRouteUpdate);
    return () => {
      window.removeEventListener('popstate', handleRouteUpdate);
      window.removeEventListener('hashchange', handleRouteUpdate);
    };
  }, []);

  const navigateToRoute = (newRoute: 'survey' | 'admin') => {
    window.location.hash = newRoute === 'admin' ? '#/admin' : '#/survey';
    setCurrentRoute(newRoute);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Universal Top Header - Visible ONLY in Admin view to isolate respondents */}
      {currentRoute === 'admin' && (
        <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Logo area */}
            <div
              onClick={() => navigateToRoute('survey')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="bg-amber-500 p-2 rounded-lg text-slate-950">
                <Clipboard className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xs tracking-tight flex flex-col items-start leading-none gap-0.5">
                <span className="text-white">Liên đoàn Lân Sư Rồng Việt Nam</span>
                <span className="text-amber-500 font-bold text-[8px] uppercase tracking-wider">Cổng khảo sát mỹ thuật</span>
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => navigateToRoute('survey')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 select-none ${
                  (currentRoute as string) === 'survey'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Khảo sát
              </button>
              
              <button
                onClick={() => navigateToRoute('admin')}
                className={`px-3 py-1.5 text-xs font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 select-none ${
                  currentRoute === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Trang quản trị
              </button>
            </div>

          </div>
        </header>
      )}

      {/* Main page content area */}
      <main className="flex-1 w-full mx-auto">
        {currentRoute === 'survey' && (
          <BrandSurveyRespondent
            onBackToAdmin={() => navigateToRoute('admin')}
          />
        )}
        
        {currentRoute === 'admin' && (
          <div className="container mx-auto px-4 py-8">
            <AdminDashboard />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
