import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
  providedIn: 'root'
})
export class User extends Parse.User {

  constructor() {
    super();
  }

  static getInstance() {
    return this;
  }

  static getCurrent() {
    return User.current() as User;
  }

  isLoggedInViaFacebook() {
    return this.authData && this.authData.facebook;
  }

  create(data: any = {}): Promise<User> {
    const user = new User;
    return user.signUp(data);
  }

  signIn(data: any = {}): Promise<User> {
    const user = new User;
    user.username = data.username;
    user.password = data.password;
    return user.logIn();
  }

  logout() {
    return User.logOut();
  }

  recoverPassword(email: string) {
    return User.requestPasswordReset(email);
  }

  loginViaFacebook(): Promise<User> {
    return new Promise((resolve, reject) => {
      (Parse.FacebookUtils.logIn(null) as any)
      .then((user: User) => resolve(user), (err: any) => reject(err));
    });
  }

  loginWith(provider: string, authData: any = {}, extraData: any = {}): Promise<User> {
    const user: any = new User;
    user.set(extraData);
    return user._linkWith(provider, authData);
  }

  isFacebookLinked(): boolean {
    return Parse.FacebookUtils.isLinked(Parse.User.current());
  }

  linkFacebook(authData: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      Parse.FacebookUtils.link(Parse.User.current(), authData, {
        success: (res: any) => resolve(res), error: (err: any) => reject(err)
      });
    });
  }

  unlinkFacebook(): Promise<any> {
    return new Promise((resolve, reject) => {
      Parse.FacebookUtils.unlink(Parse.User.current(), {
        success: (res: any) => resolve(res), error: (err: any) => reject(err)
      });
    });
  }

  get name(): string {
    return this.get('name');
  }

  set name(val) {
    this.set('name', val);
  }

  get email(): string {
    return this.get('email');
  }

  set email(val) {
    this.set('email', val);
  }

  get username(): string {
    return this.get('username');
  }

  set username(val) {
    this.set('username', val);
  }

  get password(): string {
    return this.get('password');
  }

  set password(val) {
    this.set('password', val);
  }

  get photo(): any {
    return this.get('photo');
  }

  set photo(val) {
    this.set('photo', val);
  }

  get authData(): any {
    return this.get('authData');
  }

  set authData(val) {
    this.set('authData', val);
  }
}

Parse.Object.registerSubclass('_User', User);
