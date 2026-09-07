type Callback = (...args: any[]) => void;

class EventEmitter {
  private events: { [key: string]: Callback[] } = {};

  on(event: string, callback: Callback): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    if (!this.events[event].includes(callback)) {
      this.events[event].push(callback);
    }
  }

  off(event: string, callback: Callback): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(cb => {
      try {
        cb(...args);
      } catch (err) {
        console.error(`Error in event listener for "${event}":`, err);
      }
    });
  }

  removeAllListeners(): void {
    this.events = {};
  }
}

export const EventBus = new EventEmitter();
