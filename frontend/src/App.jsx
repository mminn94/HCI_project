import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import PDFUpload from "./pages/PDFUpload";
import TodayPage from './pages/TodayPage';
import Calendar from 'react-calendar';
import CalendarPage from './pages/CalendarPage';
import QuizPage from './pages/QuizPage';
import MainPage from './pages/MainPage';
import LongTermPage from './pages/LongTermPage';
import ShortTermPage from './pages/ShortTermPage';
import HowToUse from './pages/HowToUse';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<MainPage />}/>
          <Route path='/howtouse' element={<HowToUse />} />
          <Route path="/upload" element={<PDFUpload />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path='/calendar' element={<CalendarPage />}/>
          <Route path='/quiz' element= {<QuizPage />}/>
          <Route path='/longterm' element={<LongTermPage />}/>
          <Route path='/shortterm' element={<ShortTermPage />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;