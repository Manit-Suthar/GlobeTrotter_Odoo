import { TripStop, TripActivity } from '../services/itinerary.service';

export interface DayGroup {
  date: string;
  dayNumber: number;
  activities: TripActivity[];
}

export function groupActivitiesByDay(stop: TripStop): DayGroup[] {
  const start = new Date(stop.start_date);
  const end = new Date(stop.end_date);
  
  const days: Record<string, DayGroup> = {};
  
  let current = new Date(start);
  let dayNum = 1;
  // If end is before start somehow, or same day, loop runs at least once
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    days[dateStr] = {
      date: dateStr,
      dayNumber: dayNum,
      activities: []
    };
    current.setDate(current.getDate() + 1);
    dayNum++;
  }
  
  const firstDay = start.toISOString().split('T')[0];
  
  stop.activities.forEach(act => {
    if (act.scheduled_date && days[act.scheduled_date]) {
      days[act.scheduled_date].activities.push(act);
    } else {
      // fallback to first day
      if (days[firstDay]) {
         days[firstDay].activities.push(act);
      } else {
         // safety
         const key = Object.keys(days)[0];
         if(key) days[key].activities.push(act);
      }
    }
  });
  
  Object.values(days).forEach(day => {
    day.activities.sort((a, b) => {
      const timeA = a.scheduled_time || '00:00';
      const timeB = b.scheduled_time || '00:00';
      return timeA.localeCompare(timeB);
    });
  });

  return Object.values(days);
}
