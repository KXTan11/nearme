import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class Post extends Parse.Object {

  constructor() {
    super('Post');
  }

  static getInstance() {
    return this;
  }

  getSlug(): string {
    let slug =  '1/posts/' + this.id;

    if (this.slug) {
      slug += '/' + this.slug;
    }

    return slug;
  }

  load(params: any = {}): Promise<Post[]> {
    return new Promise((resolve, reject) => {

      let page = params.page || 0;
      let limit = params.limit || 100;
      
      let query = new Parse.Query(Post);

      query.skip(page * limit);
      query.limit(limit);
      query.include('place');
      query.descending('createdAt');
      query.find().then((data: Post[]) => resolve(data), error => reject(error));
    });
  }

  loadOne(id: string): Promise<Post> {
    return new Promise((resolve, reject) => {
      const query = new Parse.Query(Post);
      query.include('place');
      query.equalTo('objectId', id);
      query.first().then((data: Post) => resolve(data), error => reject(error));
    });
  }

  get title(): string {
    return this.get('title');
  }

  get body(): string {
    return this.get('body');
  }

  get htmlBody(): string {
    return this.get('htmlBody');
  }

  get image(): any {
    return this.get('image');
  }

  get place(): any {
    return this.get('place');
  }

  get slug() {
    return this.get('slug');
  }

  toString(): string {
    return this.title;
  }
}

Parse.Object.registerSubclass('Post', Post);