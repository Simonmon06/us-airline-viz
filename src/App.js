import './App.css';
import { Route, Routes } from "react-router-dom";
import { Navbar } from './navBar/Navbar';
import { Home } from './components/pages/Home';
import { StatPage } from './components/pages/StatPage';
import './beautifyTable.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/page2" element={<StatPage />} />
      </Routes>
    </div>
  );
}

export default App;
