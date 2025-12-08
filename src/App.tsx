import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardModule } from './modules/dashboard/DashboardModule';
import { CalculatorModule } from './modules/calculator/CalculatorModule';
import { MarketModule } from './modules/market/MarketModule';
import { PortfolioModule } from './modules/portfolio/PortfolioModule';
import { ScenarioModule } from './modules/projections/ScenarioModule';
import { TradingProvider } from './context/TradingContext';

function App() {
  return (
    <TradingProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardModule />} />
            <Route path="/calculator" element={<CalculatorModule />} />
            <Route path="/market" element={<MarketModule />} />
            <Route path="/portfolio" element={<PortfolioModule />} />
            <Route path="/scenario" element={<ScenarioModule />} />
          </Routes>
        </Layout>
      </Router>
    </TradingProvider>
  );
}

export default App;
