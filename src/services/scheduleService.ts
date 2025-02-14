import { WorkSchedule } from '../types/types';

// ローカルストレージのキー
const SCHEDULE_STORAGE_KEY = 'workSchedules';

// モックデータ（初期データ）
const initialSchedules: WorkSchedule[] = [
  {
    id: '1',
    employeeId: 'E001',
    employeeName: '山田太郎',
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-02-15'),
    workType: '出社'
  },
  {
    id: '2',
    employeeId: 'E002',
    employeeName: '鈴木花子',
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-02-16'),
    workType: '在宅'
  }
];

// スケジュールの取得
export const getSchedules = (): WorkSchedule[] => {
  const storedData = localStorage.getItem(SCHEDULE_STORAGE_KEY);
  if (!storedData) {
    // 初期データを保存して返す
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(initialSchedules));
    return initialSchedules;
  }

  // 日付文字列をDateオブジェクトに変換
  return JSON.parse(storedData, (key, value) => {
    if (key === 'startDate' || key === 'endDate') {
      return new Date(value);
    }
    return value;
  });
};

// スケジュールの追加
export const addSchedule = (schedule: Omit<WorkSchedule, 'id'>): WorkSchedule => {
  const schedules = getSchedules();
  const newSchedule: WorkSchedule = {
    ...schedule,
    id: Date.now().toString() // 簡易的なID生成
  };
  
  schedules.push(newSchedule);
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
  
  return newSchedule;
};

// スケジュールの更新
export const updateSchedule = (schedule: WorkSchedule): void => {
  const schedules = getSchedules();
  const index = schedules.findIndex(s => s.id === schedule.id);
  
  if (index !== -1) {
    schedules[index] = schedule;
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
  }
};

// スケジュールの削除
export const deleteSchedule = (id: string): void => {
  const schedules = getSchedules();
  const filteredSchedules = schedules.filter(s => s.id !== id);
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(filteredSchedules));
}; 