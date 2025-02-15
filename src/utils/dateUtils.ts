import { BusinessDay } from '../types/types';

// 祝日データをキャッシュ
let holidayCache: { [key: string]: boolean } = {};

// 日付をYYYY-MM-DD形式の文字列に変換
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 営業日判定（同期処理に変更）
export const isBusinessDay = (date: Date): boolean => {
  const dateStr = formatDate(date);
  
  // キャッシュにあればそれを返す
  if (dateStr in holidayCache) {
    return !holidayCache[dateStr];
  }

  const dayOfWeek = date.getDay();
  // 土日は営業日でない
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // TODO: 実際の環境では祝日APIを使用
  // ここではモックデータを使用
  holidayCache[dateStr] = false;
  return true;
};

// 日付の種類を判定
export const getDayType = (date: Date): 'sunday' | 'saturday' | 'holiday' | 'weekday' => {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) return 'sunday';
  if (dayOfWeek === 6) return 'saturday';
  
  // TODO: 実際の環境では祝日APIを使用
  const dateStr = formatDate(date);
  if (holidayCache[dateStr]) return 'holiday';
  
  return 'weekday';
};

// 期間内の日付を取得（営業日判定付き）
export const getBusinessDays = (startDate: Date, endDate: Date): BusinessDay[] => {
  const days: BusinessDay[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    days.push({
      date: new Date(currentDate),
      isBusinessDay: isBusinessDay(currentDate)
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};

// 週の開始日（日曜日）を取得
export const getWeekStartDate = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(date.getDate() - date.getDay());
  return result;
}; 