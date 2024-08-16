import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventSourceService {
  constructor() {}

  connectToServerSentEvents(url: string, headers: { [key: string]: string } = {}, eventTypes: string[] = []): Observable<Event> {
    return new Observable((observer: Observer<Event>) => {
      const eventSource = new EventSource(url);

      eventSource.onopen = (event) => {
        console.log('Connection opened:', event);
      };

      eventSource.onerror = (error) => {
        console.error('Connection error:', error);
        observer.error(error);
      };

      eventSource.onmessage = (event) => {
        if (eventTypes.includes('message')) {
          observer.next(event);
        }
      };

      return () => {
        eventSource.close();
        console.log('Connection closed');
      };
    });
  }
}
