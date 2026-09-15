export class VideoTimelineMarkers {
  constructor() {
    this.reset();
  }

  reset() {
    this.segments = [];
    this.currentSegment = null;
    this.events = [];
  }

  update(status, timestampSec = 0, message = '') {
    const safeStatus = status || 'unknown';
    const time = Number.isFinite(timestampSec) ? timestampSec : 0;

    if (!this.currentSegment) {
      this.currentSegment = { type: safeStatus, start: time, end: time, message };
      return;
    }

    if (this.currentSegment.type === safeStatus) {
      this.currentSegment.end = time;
      if (message) this.currentSegment.message = message;
      return;
    }

    this.currentSegment.end = time;
    this.segments.push(this.currentSegment);
    this.currentSegment = { type: safeStatus, start: time, end: time, message };
  }

  addEvent(type, timestampSec = 0, message = '') {
    this.events.push({ type, timestampSec, message });
  }

  snapshot() {
    const segments = this.currentSegment
      ? [...this.segments, this.currentSegment]
      : [...this.segments];
    return {
      segments,
      events: [...this.events]
    };
  }
}
