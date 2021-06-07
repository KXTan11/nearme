import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class Category extends Parse.Object {

  constructor() {
    super('Category');
  }

  static getInstance() {
    return this;
  }

  load(): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      let query = new Parse.Query(Category);
      query.equalTo('status', 'Active');
      query.ascending('sort');
      query.doesNotExist('deletedAt');
      query.find().then((data: Category[]) => resolve(data), error => reject(error));
    });
  }

  get title(): string {
    return this.get('title');
  }

  get icon() {
    return this.get('icon');
  }

  get image() {
    return this.get('image');
  }

  get imageThumb() {
    return this.get('imageThumb');
  }

  get placeCount() {
    return this.get('placeCount');
  }

  get slug() {
    return this.get('slug');
  }

  toString(): string {
    return this.title;
  }

}

Parse.Object.registerSubclass('Category', Category);
