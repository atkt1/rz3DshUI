import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { Navbar } from './components/layout/navbar';
import { Hero } from './components/sections/hero';
import { Features } from './components/sections/features';
import { Pricing } from './components/sections/pricing';
import { CTA } from './components/sections/cta';
import { Footer } from './components/layout/footer';
import { AuthPage } from './components/auth/auth-page';
import { DashboardPage } from './pages/DashboardPage';

function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}