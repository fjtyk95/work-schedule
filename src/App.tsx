import React from 'react';
import WorkScheduleForm from './components/WorkScheduleForm';

const App: React.FC = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-center mt-8">出勤予定登録</h1>
      <WorkScheduleForm />
    </div>
  );
};

export default App; 