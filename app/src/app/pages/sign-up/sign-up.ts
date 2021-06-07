
import { Component, Injector } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { BasePage } from '../base-page/base-page';
import { User } from '../../services/user-service';
import { EventBusService, EmitEvent } from 'src/app/services/event-bus.service';

@Component({
  selector: 'page-sign-up',
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.scss']
})
export class SignUpPage extends BasePage {

  public form: FormGroup;

  constructor(injector: Injector,
    private eventBusService: EventBusService,
    private userService: User) {

    super(injector);

    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', Validators.pattern('[^ @]*@[^ @]*')),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  enableMenuSwipe() {
    return false;
  }

  onDismiss() {
    return this.modalCtrl.dismiss();
  }

  isFieldValid(formControl: AbstractControl) {
    return formControl.valid;
  }

  async onSubmit() {

    if (this.form.invalid) {
      const message = await this.getTrans('INVALID_FORM');
      return this.showToast(message);
    }

    const formData = Object.assign({}, this.form.value);

    if (formData.password !== formData.confirmPassword) {
      const message = await this.getTrans('PASSWORD_DOES_NOT_MATCH');
      return this.showToast(message);
    }

    formData.name = formData.name.trim();
    formData.username = formData.username.trim();
    formData.email = formData.email.trim();
    formData.password = formData.password.trim();

    if (formData.email === '') {
      delete formData.email;
    }

    delete formData.confirmPassword;

    try {

      await this.showLoadingView({ showOverlay: false });

      let user = await this.userService.create(formData);

      this.showContentView();

      const transParams = { username: user.username };
      this.translate.get('LOGGED_IN_AS', transParams)
        .subscribe(str => this.showToast(str));

      await this.onDismiss();

      this.eventBusService.emit(new EmitEvent('user:login', user));

    } catch (err) {

      this.showContentView();

      if (err.code === 202) {
        this.translate.get('USERNAME_TAKEN').subscribe(str => this.showToast(str));
      } else if (err.code === 203) {
        this.translate.get('EMAIL_TAKEN').subscribe(str => this.showToast(str));
      } else if (err.code === 125) {
        this.translate.get('EMAIL_INVALID').subscribe(str => this.showToast(str));
      } else {
        this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
      }

    }

  }

}
