import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class SlideIntro extends Parse.Object {

  constructor() {
    super('SlideIntro');
  }

  static getInstance() {
    return this;
  }

  load(): Promise<SlideIntro[]> {
    return new Promise((resolve, reject) => {

      let query = new Parse.Query(SlideIntro);
      query.equalTo('isActive', true);
      query.ascending('sort');
      query.include('place.category');

      query.find().then((data: SlideIntro[]) => resolve(data), error => reject(error));
    });
  }

  get image(): Parse.File {
    return this.get('image');
  }

  get imageThumb(): Parse.File {
    return this.get('imageThumb');
  }

  get sort(): number {
    return this.get('sort');
  }

  get bgColor(): string {
    return this.get('bgColor');
  }

  get color(): string {
    return this.get('color');
  }

  get title(): string {
    return this.get('title');
  }

  get text(): string {
    return this.get('text');
  }

  toString(): string {
    return this.text;
  }
}

Parse.Object.registerSubclass('SlideIntro', SlideIntro);