import React, { useMemo } from 'react';
import { MapPin, BedDouble, Clock, IndianRupee, CalendarDays } from 'lucide-react';
import type { Itinerary, TripStop, TripActivity } from '../../services/itinerary.service';

interface TripTimelineProps {
  itinerary: Itinerary;
}

// Distinct hues per stop so a city is recognisable in both the bar and the day rows.
const STOP_COLORS = [
  { bar: 'bg-teal-500', soft: 'bg-teal-50', text: 'text-teal-700', ring: 'border-teal-200', dot: 'bg-teal-500' },
  { bar: 'bg-indigo-500', soft: 'bg-indigo-50', text: 'text-indigo-700', ring: 'border-indigo-200', dot: 'bg-indigo-500' },
  { bar: 'bg-amber-500', soft: 'bg-amber-50', text: 'text-amber-700', ring: 'border-amber-200', dot: 'bg-amber-500' },
  { bar: 'bg-rose-500', soft: 'bg-rose-50', text: 'text-rose-700', ring: 'border-rose-200', dot: 'bg-rose-500' },
  { bar: 'bg-violet-500', soft: 'bg-violet-50', text: 'text-violet-700', ring: 'border-violet-200', dot: 'bg-violet-500' },
  { bar: 'bg-cyan-600', soft: 'bg-cyan-50', text: 'text-cyan-700', ring: 'border-cyan-200', dot: 'bg-cyan-600' },
];

const DAY_MS = 86400000;

const startOfDay = (value: string) => {
  const d = new Date(value);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const addDays = (ms: number, days: number) => new Date(ms + days * DAY_MS);

const fmtShort = (d: Date) => d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
const fmtWeekday = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short' });

interface DayCell {
  date: Date;
  stop: TripStop | null;
  colorIndex: number;
  activities: TripActivity[];
  isFirstOfStop: boolean;
}

export const TripTimeline: React.FC<TripTimelineProps> = ({ itinerary }) => {
  const { days, totalDays, totalCost, stopSpans } = useMemo(() => {
    const tripStart = startOfDay(itinerary.start_date);
    const tripEnd = startOfDay(itinerary.end_date);
    const span = Math.max(Math.round((tripEnd - tripStart) / DAY_MS) + 1, 1);

    // Which stop (if any) covers each calendar day of the trip.
    const cells: DayCell[] = [];
    const seenStops = new Set<string>();

    for (let i = 0; i < span; i++) {
      const date = addDays(tripStart, i);
      const dayMs = date.getTime();

      const stopIndex = itinerary.stops.findIndex(s => {
        const s0 = startOfDay(s.start_date);
        const s1 = startOfDay(s.end_date);
        return dayMs >= s0 && dayMs <= s1;
      });

      const stop = stopIndex >= 0 ? itinerary.stops[stopIndex] : null;
      const dayKey = date.toISOString().slice(0, 10);

      const activities = stop
        ? stop.activities.filter(a => !a.scheduled_date || a.scheduled_date === dayKey)
            .sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''))
        : [];

      const isFirstOfStop = !!stop && !seenStops.has(stop.id);
      if (stop) seenStops.add(stop.id);

      cells.push({ date, stop, colorIndex: stopIndex, activities, isFirstOfStop });
    }

    // Proportional widths for the journey bar.
    const spans = itinerary.stops.map((stop, idx) => {
      const s0 = startOfDay(stop.start_date);
      const s1 = startOfDay(stop.end_date);
      const nights = Math.max(Math.round((s1 - s0) / DAY_MS), 1);
      return { stop, idx, nights };
    });

    const cost = itinerary.stops.reduce((sum, stop) => {
      const acts = stop.activities.reduce((s, a) => s + (a.cost_estimate || 0), 0);
      const s0 = startOfDay(stop.start_date);
      const s1 = startOfDay(stop.end_date);
      const nights = Math.max(Math.round((s1 - s0) / DAY_MS), 1);
      const stay = stop.hotel ? stop.hotel.price_per_night * nights : 0;
      return sum + acts + stay;
    }, 0);

    return { days: cells, totalDays: span, totalCost: cost, stopSpans: spans };
  }, [itinerary]);

  const totalActivities = itinerary.stops.reduce((n, s) => n + s.activities.length, 0);
  const totalNights = stopSpans.reduce((n, s) => n + s.nights, 0);

  if (itinerary.stops.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
        <CalendarDays size={36} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-bold">Your timeline will appear once this trip has stops.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
        {[
          { label: totalDays === 1 ? 'Day' : 'Days', value: totalDays },
          { label: itinerary.stops.length === 1 ? 'City' : 'Cities', value: itinerary.stops.length },
          { label: totalActivities === 1 ? 'Activity' : 'Activities', value: totalActivities },
          { label: 'Est. cost', value: `₹${totalCost.toLocaleString()}` },
        ].map((stat, i) => (
          <div key={i} className={`px-4 py-4 text-center ${i > 1 ? 'border-t sm:border-t-0 border-gray-100' : ''}`}>
            <div className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Journey bar — each city sized by how long you stay */}
      <div className="p-5 sm:p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">Your route</h3>
          <span className="text-xs font-bold text-gray-400">
            {fmtShort(new Date(itinerary.start_date))} — {fmtShort(new Date(itinerary.end_date))}
          </span>
        </div>

        <div className="flex w-full h-11 rounded-xl overflow-hidden shadow-inner bg-gray-100">
          {stopSpans.map(({ stop, idx, nights }) => {
            const color = STOP_COLORS[idx % STOP_COLORS.length];
            return (
              <div
                key={stop.id}
                className={`${color.bar} flex items-center justify-center min-w-0 px-2 transition-all hover:brightness-110`}
                style={{ flexGrow: nights, flexBasis: 0 }}
                title={`${stop.city_name} · ${nights} ${nights === 1 ? 'night' : 'nights'}`}
              >
                <span className="text-white text-xs sm:text-sm font-black truncate drop-shadow-sm">
                  {stop.city_name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
          {stopSpans.map(({ stop, idx, nights }) => {
            const color = STOP_COLORS[idx % STOP_COLORS.length];
            return (
              <div key={stop.id} className="inline-flex items-center text-xs font-bold text-gray-600">
                <span className={`w-2.5 h-2.5 rounded-full mr-2 ${color.dot}`} />
                {stop.city_name}
                <span className="text-gray-400 font-medium ml-1.5">
                  · {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
              </div>
            );
          })}
          <div className="inline-flex items-center text-xs font-medium text-gray-400">
            {totalNights} nights total
          </div>
        </div>
      </div>

      {/* Day-by-day rail */}
      <div className="p-5 sm:p-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-4">Day by day</h3>

        <div className="space-y-0">
          {days.map((day, i) => {
            const color = day.stop ? STOP_COLORS[day.colorIndex % STOP_COLORS.length] : null;
            const isLast = i === days.length - 1;

            return (
              <div key={i} className="flex gap-3 sm:gap-4">
                {/* Date gutter */}
                <div className="w-12 sm:w-14 flex-shrink-0 text-right pt-1">
                  <div className="text-xs font-black text-gray-400 uppercase">{fmtWeekday(day.date)}</div>
                  <div className="text-base font-black text-gray-900 leading-tight">{day.date.getDate()}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">
                    {day.date.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>

                {/* Rail */}
                <div className="flex flex-col items-center flex-shrink-0 pt-2">
                  <div className={`w-3 h-3 rounded-full ring-4 ring-white z-10 ${color ? color.dot : 'bg-gray-200'}`} />
                  {!isLast && <div className={`w-0.5 flex-1 min-h-[2.5rem] ${color ? color.bar : 'bg-gray-100'} opacity-30`} />}
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 pb-5 ${isLast ? '' : ''}`}>
                  {!day.stop ? (
                    <div className="text-sm font-bold text-gray-300 pt-1.5">Unscheduled</div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className={`inline-flex items-center text-sm font-black ${color!.text}`}>
                          <MapPin size={13} className="mr-1" /> {day.stop.city_name}
                        </span>
                        {day.isFirstOfStop && day.stop.hotel && (
                          <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md border ${color!.soft} ${color!.text} ${color!.ring}`}>
                            <BedDouble size={11} className="mr-1" /> {day.stop.hotel.name}
                          </span>
                        )}
                      </div>

                      {day.activities.length > 0 ? (
                        <div className="mt-2 space-y-1.5">
                          {day.activities.map(act => (
                            <div
                              key={act.id}
                              className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
                            >
                              {act.scheduled_time && (
                                <span className="inline-flex items-center text-xs font-black text-gray-500 tabular-nums flex-shrink-0">
                                  <Clock size={11} className="mr-1" />{act.scheduled_time}
                                </span>
                              )}
                              <span className="text-sm font-bold text-gray-900 truncate flex-1">{act.custom_name}</span>
                              {act.cost_estimate > 0 && (
                                <span className="inline-flex items-center text-xs font-bold text-gray-500 flex-shrink-0">
                                  <IndianRupee size={10} />{act.cost_estimate.toLocaleString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-1.5 text-xs font-bold text-gray-300">Nothing planned yet</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
