import { format, isToday, isYesterday, isThisWeek, formatDistanceToNow } from 'date-fns';

/** Short time for message bubbles, e.g. "2:45 PM" */
export const formatMessageTime = (date) => format(new Date(date), 'h:mm a');

/** Chat list preview timestamp: time if today, weekday if this week, else date */
export const formatChatListTime = (date) => {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  if (isThisWeek(d)) return format(d, 'EEEE');
  return format(d, 'dd/MM/yyyy');
};

/** Date divider label between grouped messages, e.g. "Today", "Yesterday", "June 3, 2026" */
export const formatDateDivider = (date) => {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
};

/** "last seen 5 minutes ago" style relative formatting */
export const formatLastSeen = (date) => {
  if (!date) return '';
  return `last seen ${formatDistanceToNow(new Date(date), { addSuffix: true })}`;
};

/** Groups a chronological message array into { date, messages[] } buckets for date dividers */
export const groupMessagesByDate = (messages) => {
  const groups = [];
  let currentKey = null;

  messages.forEach((message) => {
    const key = format(new Date(message.createdAt), 'yyyy-MM-dd');
    if (key !== currentKey) {
      groups.push({ date: message.createdAt, messages: [message] });
      currentKey = key;
    } else {
      groups[groups.length - 1].messages.push(message);
    }
  });

  return groups;
};
