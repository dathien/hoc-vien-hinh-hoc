import React from 'react';
import { Footer } from './components/common/Footer';
import { Header } from './components/common/Header';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { OnboardingTour } from './components/common/OnboardingTour';
import { AchievementsPage } from './pages/AchievementsPage';
import { ArenaPage } from './pages/ArenaPage';
import { CampaignPage } from './pages/CampaignPage';
import { GradesPage } from './pages/GradesPage';
import { GuidePage } from './pages/GuidePage';
import { HomePage } from './pages/HomePage';
import { LabPage } from './pages/LabPage';
import { LibraryPage } from './pages/LibraryPage';
import { SettingsPage } from './pages/SettingsPage';
import { TeacherPage } from './pages/TeacherPage';
import { AppProvider, useApp } from './store/AppContext';

const AppShell: React.FC = () => {
  const { page } = useApp();

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage />;
      case 'lab':
        return <LabPage />;
      case 'campaign':
        return <CampaignPage />;
      case 'grades':
        return <GradesPage />;
      case 'arena':
        return <ArenaPage />;
      case 'library':
        return <LibraryPage />;
      case 'teacher':
        return <TeacherPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'guide':
        return <GuidePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F9FC] dark:bg-slate-950 text-[#172033] dark:text-slate-100 transition-colors">
      <OfflineIndicator />
      <Header />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
      <OnboardingTour />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
