import React, { useState } from 'react';
import { WorkType, WorkSchedule, BaseWorkType, HalfDayWorkType } from '../types/types';
import { findEmployeeById } from '../services/employeeService';
import { isBusinessDay } from '../utils/dateUtils';

interface WorkScheduleFormProps {
  onSubmit: (schedule: Omit<WorkSchedule, 'id'>) => void;
}

type FormData = {
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  workType: WorkType;
};

export const WorkScheduleForm: React.FC<WorkScheduleFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    employeeName: '',
    startDate: '',
    endDate: '',
    workType: '出社'
  });

  const [error, setError] = useState<string>('');
  const baseWorkTypes: BaseWorkType[] = ['出社', '在宅', '午前休', '午後休', '休暇'];
  const halfDayWorkTypes: HalfDayWorkType[] = ['出社', '在宅'];

  const [selectedBaseType, setSelectedBaseType] = useState<BaseWorkType>('出社');
  const [selectedHalfDayType, setSelectedHalfDayType] = useState<HalfDayWorkType>('出社');

  const handleEmployeeIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, employeeId: value }));
    
    const employee = findEmployeeById(value);
    if (employee) {
      setFormData(prev => ({ ...prev, employeeName: employee.name }));
      setError('');
    } else {
      setFormData(prev => ({ ...prev, employeeName: '' }));
      if (value) {
        setError('社員が見つかりません');
      }
    }
  };

  const validateDates = (startDate: Date, endDate: Date): boolean => {
    if (endDate < startDate) {
      setError('終了日は開始日より後の日付を選択してください');
      return false;
    }
    return true;
  };

  const handleWorkTypeChange = (baseType: BaseWorkType) => {
    setSelectedBaseType(baseType);
    let newWorkType: WorkType = baseType;
    
    if (baseType === '午前休') {
      newWorkType = `午前休_午後${selectedHalfDayType}` as WorkType;
    } else if (baseType === '午後休') {
      newWorkType = `午後休_午前${selectedHalfDayType}` as WorkType;
    }

    setFormData(prev => ({
      ...prev,
      workType: newWorkType
    }));
  };

  const handleHalfDayTypeChange = (halfDayType: HalfDayWorkType) => {
    setSelectedHalfDayType(halfDayType);
    const newWorkType = selectedBaseType === '午前休'
      ? `午前休_午後${halfDayType}`
      : `午後休_午前${halfDayType}`;
    
    setFormData(prev => ({
      ...prev,
      workType: newWorkType as WorkType
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (!validateDates(startDate, endDate)) {
      return;
    }

    const isStartDateBusiness = await isBusinessDay(startDate);
    const isEndDateBusiness = await isBusinessDay(endDate);

    if (!isStartDateBusiness || !isEndDateBusiness) {
      setError('選択された期間に銀行営業日以外の日付が含まれています');
      return;
    }

    onSubmit({
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      startDate,
      endDate,
      workType: formData.workType
    });
  };

  const formatWorkType = (workType: WorkType) => {
    if (!workType.includes('_')) return workType;
    const [base, half] = workType.split('_');
    return `${base}（${half}）`;
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-6">勤務予定登録</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          社員番号
        </label>
        <input
          type="text"
          value={formData.employeeId}
          onChange={handleEmployeeIdChange}
          className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          placeholder="例: E001"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          社員名
        </label>
        <input
          type="text"
          value={formData.employeeName}
          className="w-full p-2 border rounded bg-gray-100"
          readOnly
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          開始日
        </label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          終了日
        </label>
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          min={formData.startDate}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          勤務形態
        </label>
        <select
          value={selectedBaseType}
          onChange={(e) => handleWorkTypeChange(e.target.value as BaseWorkType)}
          className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          required
        >
          {baseWorkTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {(selectedBaseType === '午前休' || selectedBaseType === '午後休') && (
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            {selectedBaseType === '午前休' ? '午後の勤務形態' : '午前の勤務形態'}
          </label>
          <select
            value={selectedHalfDayType}
            onChange={(e) => handleHalfDayTypeChange(e.target.value as HalfDayWorkType)}
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
            required
          >
            {halfDayWorkTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      )}

      <div className="text-sm text-gray-600 mb-4">
        設定する勤務形態：{formatWorkType(formData.workType)}
      </div>

      {error && (
        <div className="mb-4 text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none disabled:bg-gray-400"
        disabled={!!error || !formData.employeeName}
      >
        登録
      </button>
    </form>
  );
};

export default WorkScheduleForm; 