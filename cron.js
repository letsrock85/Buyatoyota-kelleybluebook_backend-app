

/**
 * Cron class
 */
export default class Cron {
  constructor() {
    this.intervals = [];
  }

  /**
   * start cron tasks
   * @param cb
   * @param period
   * @returns {Object|number}
   */
  async start(cb, period = 24 * 60 * 60 * 1000) {
    await cb();
    const interval = setInterval(() => {
      cb();
    }, period);
    this.intervals.push(interval);
    return interval;
  }

  /**
   * stop all corns task or stop specified task
   * @param index
   */
  stop(index) {
    if (index == null) {
      this.intervals.forEach((interval) => {
        clearInterval(interval);
      });
      this.intervals = [];
    }
    clearInterval(index);
    this.intervals.splice(this.intervals.indexOf(index), 1);
  }
}
