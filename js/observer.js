let subscribers = [];

export function subscribe(fn) {
  subscribers.push(fn);
}

export function notify() {
  subscribers.forEach(fn => fn());
}