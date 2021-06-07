
import { Component, Injector } from '@angular/core';
import { BasePage } from '../base-page/base-page';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { User } from '../../services/user-service';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { SignUpPage } from '../sign-up/sign-up';
import { EventBusService, EmitEvent } from 'src/app/services/event-bus.service';
import { SocialAuthService, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { SignInWithApple, ASAuthorizationAppleIDRequest } from '@ionic-native/sign-in-with-apple/ngx';
import { Device } from '@ionic-native/device/ngx';
import { environment } from 'src/environments/environment';
import { AppConfigService } from 'src/app/services/app-config.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'sign-in-page',
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.scss']
})
export class SignInPage extends BasePage {

  public form: FormGroup;
  public isLoadingUsernameLogin: boolean = false;
  public isLoadingFacebookLogin: boolean = false;
  public isLoadingGoogleLogin: boolean = false;
  public isLoadingAppleLogin: boolean = false;

  public isAppleSignInAvailable: boolean = false;

  public isFacebookLoginEnabled: boolean;
  public isGoogleLoginEnabled: boolean;
  public isAppleLoginEnabled: boolean;

  public isLoadingConfig: boolean;

  public socialLoginSubscription: Subscription;

  constructor(injector: Injector,
    private eventBusService: EventBusService,
    private authService: SocialAuthService,
    private googlePlus: GooglePlus,
    private userService: User,
    private signInWithApple: SignInWithApple,
    private appConfigService: AppConfigService,
    private device: Device,
    private fb: Facebook) {
    super(injector);
  }

  ngOnInit() {

    const deviceVersion = parseInt(this.device.version);
    this.isAppleSignInAvailable = deviceVersion >= 13 &&
    this.isCordova &&
    this.isApple;

    this.form = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });

    this.eventBusService.on('user:login', () => {
      this.onDismiss();
    });

    this.socialLoginSubscription = this.authService.authState.subscribe(user => {
      if (user && user.provider === 'GOOGLE') {
        this.loggedIntoGoogle(user);
      } else if (user && user.provider === 'FACEBOOK') {
        this.loggedIntoFacebook({
          userID: user.id,
          accessToken: user.authToken,
        });
      }
    });

    this.loadAppConfig();
  }

  ngOnDestroy() {
    this.socialLoginSubscription.unsubscribe();
  }

  enableMenuSwipe(): boolean {
    return false;
  }

  onDismiss() {
    return this.modalCtrl.dismiss();
  }

  async loadAppConfig() {

    try {
      this.isLoadingConfig = true;
      const config = await this.appConfigService.load();
      this.isFacebookLoginEnabled = config?.auth?.isFacebookLoginEnabled;
      this.isGoogleLoginEnabled = config?.auth?.isGoogleLoginEnabled;
      this.isAppleLoginEnabled = config?.auth?.isAppleLoginEnabled;
      this.isLoadingConfig = false;

    } catch (error) {
      this.isLoadingConfig = false;
    }
  }

  async onAppleButtonTouched() {
    try {
      this.isLoadingAppleLogin = true;

      const res = await this.signInWithApple.signin({
        requestedScopes: [
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeFullName,
          ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
        ]
      });

      const authData = {
        id: res.user,
        token: res.identityToken
      };

      const extraData: any = {};

      if (res.fullName.givenName && res.fullName.familyName) {
        extraData.name = res.fullName.givenName + ' ' + res.fullName.familyName;
      }

      const user = await this.userService.loginWith(
        'apple',
        { authData },
        extraData
      );

      this.isLoadingAppleLogin = false;

      const transParams = { name: user.name };

      this.translate
        .get('LOGGED_IN_AS', transParams)
        .subscribe(str => this.showToast(str));

      this.onDismiss();

      window.dispatchEvent(new CustomEvent('user:login', {
        detail: user
      }));

    } catch (error) {
      this.isLoadingAppleLogin = false;
    }
  }

  onFacebookButtonTouched() {

    if (this.isCordova) {
      this.fb.login(['public_profile'])
      .then((res: FacebookLoginResponse) => this.loggedIntoFacebook(res.authResponse))
      .catch(e => console.log('Error logging into Facebook', e));
    } else {
      this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
    }
    
  }

  async loggedIntoFacebook(res: any) {

    const authData = {
      id: res.userID,
      access_token: res.accessToken,
    };

    try {

      await this.showLoadingView({ showOverlay: false });
      this.isLoadingFacebookLogin = true;
      
      const user = await this.userService.loginWith('facebook', { authData });

      this.loggedViaFacebook(user);
      this.isLoadingFacebookLogin = false;
      
    } catch (error) {
      this.loginViaFacebookFailure(error);
      this.isLoadingFacebookLogin = false;
    }
    
  }

  loginViaFacebookFailure(error: any = {}) {
    console.log('Error logging into Facebook', error);
    this.translate.get('ERROR_UNKNOWN').subscribe(str => this.showToast(str));
    this.showContentView();
  }

  loggedViaFacebook(user: User) {
    this.showContentView();

    const transParams = { username: user.name };
    
    this.translate.get('LOGGED_IN_AS', transParams)
      .subscribe(str => this.showToast(str));

    this.eventBusService.emit(new EmitEvent('user:login', user));

    this.onDismiss();
  }

  async onGoogleButtonTouched() {
    if (this.isCordova) {
      try {
        const res = await this.googlePlus.login({
          webClientId: environment.googleClientId,
          offline: true,
        });
        this.loggedIntoGoogle({
          id: res.userId,
          authToken: res.accessToken,
          idToken: res.idToken
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
    }
  }

  async loggedIntoGoogle(res: any) {
    console.log("Logged into Google", res);

    try {
      this.isLoadingGoogleLogin = true;

      const authData = {
        id: res.id,
        access_token: res.authToken,
        id_token: res.idToken
      };

      const user = await this.userService.loginWith("google", { authData });

      this.isLoadingGoogleLogin = false;

      const transParams = { username: user.name };

      this.translate
        .get("LOGGED_IN_AS", transParams)
        .subscribe(str => this.showToast(str));

      this.eventBusService.emit(new EmitEvent('user:login', user));

    } catch (err) {
      console.log("Error logging into Google", err);
      this.isLoadingGoogleLogin = false;
      this.translate.get("ERROR_NETWORK").subscribe(str => this.showToast(str));
      this.showContentView();
    }
  }

  async onSubmit() {

    try {

      if (this.form.invalid) {
        const message = await this.getTrans('INVALID_FORM');
        return this.showToast(message);
      }

      await this.showLoadingView({ showOverlay: false });
      this.isLoadingUsernameLogin = true;

      const formData = Object.assign({}, this.form.value);

      formData.username = formData.username.trim();
      formData.password = formData.password.trim();

      let user = await this.userService.signIn(formData);

      this.showContentView();
      this.isLoadingUsernameLogin = false;

      const transParams = { username: user.name };
      this.translate.get('LOGGED_IN_AS', transParams)
        .subscribe(str => this.showToast(str));

      this.eventBusService.emit(new EmitEvent('user:login', user));

      this.onDismiss();

    } catch (err) {

      if (err.code === 101) {
        this.translate.get('INVALID_CREDENTIALS')
        .subscribe(str => this.showToast(str));
      } else {
        this.translate.get('ERROR_NETWORK')
        .subscribe(str => this.showToast(str));
      }

      this.showContentView();
      this.isLoadingUsernameLogin = false;
    }
  }

  async onPresentForgotPasswordModal() {
    const modal = await this.modalCtrl.create({
      component: ForgotPasswordPage
    });

    return await modal.present();
  }

  async onPresentSignUpModal() {
    const modal = await this.modalCtrl.create({
      component: SignUpPage
    });

    return await modal.present();
  }

}
