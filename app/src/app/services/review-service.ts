import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class Review extends Parse.Object {

  constructor() {
    super('Review');
  }

  static getInstance() {
    return this;
  }

  create(data: any = {}): Promise<Review> {
    return new Promise((resolve, reject) => {
      const review = new Review();
      review.save(data).then((data: Review) => resolve(data), error => reject(error));
    });
  }

  load(params: any = {}): Promise<Review[]> {

    return new Promise((resolve, reject) => {

      let query = new Parse.Query(Review);

      if (params.place) {
        query.equalTo('place', params.place);
      }

      if (params.user) {
        query.equalTo('user', params.user);
      }

      query.descending('createdAt');
      query.include(['user', 'place']);
      query.doesNotExist('deletedAt');

      const limit = params.limit || 100;
      const page = params.page || 0;
      query.skip(page * limit);
      query.limit(limit);

      query.find().then((data: Review[]) => resolve(data), error => reject(error));
    });
  }

  get rating(): number {
    return this.get('rating');
  }

  get comment(): string {
    return this.get('comment');
  }

  get place(): any {
    return this.get('place');
  }

  get user(): any {
    return this.get('user');
  }

  get status(): string {
    return this.get('status');
  }
}

Parse.Object.registerSubclass('Review', Review);
