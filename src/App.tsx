import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { EmployeeScheduleList } from './components/EmployeeScheduleList';

function App() {
  return (
    <HashRouter>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">勤務スケジュール管理システム</h1>
        <div className="bg-white rounded-lg shadow">
          <Routes>
            <Route path="*" element={<EmployeeScheduleList />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App; 