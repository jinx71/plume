import cn from '../utils/cn';

// Neutral surface for feed items, panels and forms. `interactive` adds a hover
// lift for clickable cards.
const Card = ({ children, className = '', interactive = false, ...props }) => (
  <div
    className={cn(
      'bg-white border border-line rounded-2xl shadow-soft',
      interactive && 'transition-shadow hover:shadow-lift',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default Card;
