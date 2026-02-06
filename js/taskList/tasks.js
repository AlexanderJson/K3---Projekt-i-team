export function createTask({
  id,
  title,
  completed,
  status,
  assigned
}) {
  return {
    id,
    title,
    completed,
    status,
    assigned
  };
}