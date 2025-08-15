export interface Flight {
  id: number;
  date: string;
  pilotName: string;
  startTime: number;
  endTime: number;
  totalTime: number;
  comments: string;
  createdBy: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
}