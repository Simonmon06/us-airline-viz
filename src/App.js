import './App.css';
import { Route, Routes } from "react-router-dom";
import { Navbar } from './navBar/Navbar';
import { Home } from './components/pages/Home';
import { Summary } from './components/pages/Summary';
import { Page3 } from './components/pages/Page3';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/page2" element={<Summary />} />
      <Route path="/page3" element={<Page3 />} />
      </Routes>
    </div>
  );
}

export default App;
