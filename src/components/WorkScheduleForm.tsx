import React, { useState } from 'react';
import { WorkType, WorkSchedule } from '../types/types';

const WorkScheduleForm: React.FC = () => {
  const [schedule, setSchedule] = useState<WorkSchedule>({
    employeeId: '',
    startDate: '',
    endDate: '',
    workType: '出社'
  });

  const workTypes: WorkType[] = ['出社', '在宅', '午前休', '午後休', '休暇'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ここでデータを送信する処理を追加
    console.log(schedule);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSchedule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-4">
      <div className="mb-4">
        <label className="block mb-2">社員ID：</label>
        <input
          type="text"
          name="employeeId"
          value={schedule.employeeId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">開始日：</label>
        <input
          type="date"
          name="startDate"
          value={schedule.startDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">終了日：</label>
        <input
          type="date"
          name="endDate"
          value={schedule.endDate}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">勤務形態：</label>
        <select
          name="workType"
          value={schedule.workType}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          {workTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        登録
      </button>
    </form>
  );
};

export default WorkScheduleForm; 