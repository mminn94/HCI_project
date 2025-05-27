import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import PDFUpload from "./pages/PDFUpload";
import TodayPage from './pages/TodayPage';
import Calendar from 'react-calendar';
import CalendarPage from './pages/CalendarPage';

import MainPage from './pages/MainPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<MainPage />}/>
          <Route path="/upload" element={<PDFUpload />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path='/calendar' element={<CalendarPage />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;