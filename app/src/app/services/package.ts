import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class Package extends Parse.Object {

  constructor() {
    super('Package');
  }

  static getInstance() {
    return this;
  }

  load(params: any = {}): Promise<Package[]> {
    const query = new Parse.Query(Package);

    if (params.type) {
      query.equalTo('type', params.type);
    }

    query.ascending('sort');
    return query.find();
  }

  get name(): string {
    return this.get('name');
  }

  get description(): string {
    return this.get('description');
  }

  get price(): number {
    return this.get('price');
  }

  get salePrice(): number {
    return this.get('salePrice');
  }

  get finalPrice(): number {
    return this.get('finalPrice');
  }

}

Parse.Object.registerSubclass('Package', Package);