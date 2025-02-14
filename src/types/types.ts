export type WorkType = {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
};

export type WorkSchedule = {
  id: string;
  workType: WorkType;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
}; 