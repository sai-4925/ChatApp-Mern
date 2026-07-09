import { formatDateDivider } from '../../utils/dateHelpers';

const DateDivider = ({ date }) => (
  <div className="my-4 flex items-center justify-center">
    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-muted-light dark:bg-white/10 dark:text-muted-dark">
      {formatDateDivider(date)}
    </span>
  </div>
);

export default DateDivider;
