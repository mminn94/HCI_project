import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import PDFUpload from "./components/PDFUpload";
import TodayPage from './pages/TodayPage';
import Calendar from 'react-calendar';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <Router>
      <div className="App">
        <h1 className="text-2xl font-bold text-center my-6">📚 SmartStudy</h1>
        
        {/* 버튼을 제목 바로 아래에! */}
        <TodayButton />
        <CalendarButton />

        <Routes>
          <Route path="/" element={<PDFUpload />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path='/calendar' element={<CalendarPage />}/>
        </Routes>
      </div>
    </Router>
  );
}

function TodayButton() {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-4">
      <button
        onClick={() => navigate("/today")}
        className="px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300">
        오늘 할 일 보러가기
      </button>
    </div>
  );
}

function CalendarButton(){
  const navigate = useNavigate();

  return(
    <div className='text-center mb-4'>
      <button
      onClick={() => navigate("/calendar")}
      className='px-4 py-1 text-gray rounded bg-gray-200 hover:bg-gray-300'>
        캘린더 보러가기
      </button>
    </div>
  )
}

export default App;
