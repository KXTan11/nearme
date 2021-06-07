
import { Component, Injector } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { User } from '../../services/user-service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'page-change-password',
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.scss']
})
export class ChangePasswordPage extends BasePage {

  protected user: User;

  public form: FormGroup;

  constructor(injector: Injector,
    private userService: User) {
    super(injector);

    this.form = new FormGroup({
      oldPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  enableMenuSwipe() {
    return false;
  }

  onDismiss() {
    this.modalCtrl.dismiss();
  }

  async onSubmit() {

    let formData = this.form.value;

    if (this.form.invalid) {
      return this.translate.get('INVALID_FORM').subscribe(str => this.showToast(str));
    }

    if (formData.password !== formData.confirmPassword) {
      return this.translate.get('PASSWORD_DOES_NOT_MATCH').subscribe(str => this.showToast(str));
    }

    try {

      await this.showLoadingView({ showOverlay: false });

      this.user = User.getCurrent();

      let loginData = {
        username: this.user.username,
        password: formData.oldPassword
      };
  
      await this.userService.signIn(loginData);
  
      this.user.password = formData.password;
      await this.user.save();

      this.translate.get('SAVED').subscribe(str => this.showToast(str));

      this.showContentView();

    } catch (err) {

      this.showContentView();

      if (err.code === 101) {
        this.translate.get('PASSWORD_INVALID').subscribe(str => this.showToast(str));
      } else {
        this.translate.get('ERROR_NETWORK').subscribe(str => this.showToast(str));
      }

    }

  
  }

}
