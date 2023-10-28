import './App.css';
import { Route, Routes } from "react-router-dom";
import { Navbar } from './navBar/Navbar';
import { Home } from './components/pages/Home';
import { Page2 } from './components/pages/Page2';
import { Page3 } from './components/pages/Page3';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/page2" element={<Page2 />} />
      <Route path="/page3" element={<Page3 />} />
      </Routes>
    </div>
  );
}

export default App;
