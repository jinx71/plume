import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

// Compact relative time for the feed: "12s", "5m", "3h", "2d", then a date.
export const timeAgo = (date) => {
  const d = dayjs(date);
  const diffSec = dayjs().diff(d, 'second');
  if (diffSec < 60) return `${Math.max(diffSec, 1)}s`;
  const diffMin = dayjs().diff(d, 'minute');
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = dayjs().diff(d, 'hour');
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = dayjs().diff(d, 'day');
  if (diffDay < 7) return `${diffDay}d`;
  return d.format('MMM D');
};

// Long form for profile "joined" lines and tooltips.
export const fullDate = (date) => dayjs(date).format('MMMM D, YYYY');
