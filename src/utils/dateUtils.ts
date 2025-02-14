import { BusinessDay } from '../types/types';

// 祝日APIのレスポンス型
type HolidayResponse = {
  [key: string]: string;
};

export const isBusinessDay = async (date: Date): Promise<boolean> => {
  // 土日チェック
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  // 祝日チェック（内閣府の祝日APIを使用）
  const year = date.getFullYear();
  const response = await fetch(
    `https://holidays-jp.github.io/api/v1/${year}/date.json`
  );
  const holidays: HolidayResponse = await response.json();
  
  const dateStr = date.toISOString().split('T')[0];
  return !holidays[dateStr];
};

export const getBusinessDays = async (startDate: Date, endDate: Date): Promise<BusinessDay[]> => {
  const days: BusinessDay[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    days.push({
      date: new Date(currentDate),
      isBusinessDay: await isBusinessDay(currentDate)
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}; 