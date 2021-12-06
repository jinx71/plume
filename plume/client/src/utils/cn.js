// Tiny classnames joiner — filters out falsy values so conditional classes
// stay readable: cn('btn', isActive && 'btn-active').
const cn = (...parts) => parts.filter(Boolean).join(' ');

export default cn;
