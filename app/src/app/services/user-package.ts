
import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class UserPackage extends Parse.Object {

  constructor() {
    super('UserPackage');
  }

  static getInstance() {
    return this;
  }

  isInvalid(): boolean {
    return this.isLimitReached || this.status === 'unpaid';
  }

  load(params: any = {}): Promise<UserPackage[]> {
    const query = new Parse.Query(UserPackage);

    if (params.status) {
      query.equalTo('status', params.status);
    }

    if (params.isLimitReached === false || params.isLimitReached === true) {
      query.equalTo('isLimitReached', params.isLimitReached);
    }

    if (params.type) {
      query.equalTo('package.type', params.type);
    }

    query.descending('createdAt');
    return query.find();
  }

  create(packageId: string): Promise<UserPackage> {
    return Parse.Cloud.run('createUserPackage', { packageId });
  }

  createStripePaymentIntent(placeId: string): Promise<string> {
    return Parse.Cloud.run('createStripePaymentIntent', {
      placeId: placeId,
      userPackageId: this.id
    });
  }

  pay(payload: any = {}): Promise<string> {
    return Parse.Cloud.run('payOrder', payload);
  }

  get package(): any {
    return this.get('package');
  }

  get usage(): number {
    return this.get('usage');
  }

  get status(): string {
    return this.get('status');
  }

  get isLimitReached(): boolean {
    return this.get('isLimitReached');
  }


}

Parse.Object.registerSubclass('UserPackage', UserPackage);