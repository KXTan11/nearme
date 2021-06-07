import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Place } from '../../services/place-service';

@Component({
  selector: 'info-window',
  templateUrl: './info-window.html',
  styleUrls: ['./info-window.scss']
})
export class InfoWindowComponent {

  @Input() place: Place;
  @Input() location: any;
  @Input() unit: string;

  @Output() onButtonTouched: EventEmitter<Place> = new EventEmitter<Place>();

  constructor() {
  }

  goToPlace() {
    this.onButtonTouched.emit(this.place);
  }

}
