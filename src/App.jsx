import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TradingProvider } from './context/TradingContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Market from './components/Market';
import StockDetail from './components/StockDetail';
import Portfolio from './components/Portfolio';
import Leaderboard from './components/Leaderboard';
import { Toaster } from 'sonner';

function App() {
  return (
    <TradingProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/market" element={<Market />} />
            <Route path="/market/:symbol" element={<StockDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
          <Toaster position="top-center" richColors />
        </Layout>
      </Router>
    </TradingProvider>
  );
}

export default App;
