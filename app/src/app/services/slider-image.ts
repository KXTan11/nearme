import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class Slide extends Parse.Object {

  constructor() {
    super('SliderImage');
  }

  static getInstance() {
    return this;
  }

  load(): Promise<Slide[]> {
    return new Promise((resolve, reject) => {

      let query = new Parse.Query(Slide);
      query.equalTo('isActive', true);
      query.ascending('sort');
      query.include('place.category');

      query.find().then((data: Slide[]) => resolve(data), error => reject(error));
    });
  }

  get image(): any {
    return this.get('image');
  }

  get sort(): number {
    return this.get('sort');
  }

  get url(): string {
    return this.get('url');
  }

  get place(): any {
    return this.get('place');
  }

  get post(): any {
    return this.get('post');
  }

  get category(): any {
    return this.get('category');
  }

  get type(): any {
    return this.get('type');
  }

  get isActive(): boolean {
    return this.get('isActive');
  }

  toString(): string {
    return this.image.url();
  }
}

Parse.Object.registerSubclass('SliderImage', Slide);