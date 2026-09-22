import { Component, inject, Input } from '@angular/core';
import { LoginModel } from '../../Models/login-model';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserRolesService } from '../../../core/Services/user.roles.service';
import { SwalService } from '../../../global/swal.service';
import { DropdownModel } from '../../Models/dropdown.model';
import { EmailService } from '../../Services/email-service';
import { EmailModel, VerifyOtpModel } from '../../Models/email.model';
import { UserConfiguration, UserModel } from '../../Models/user-model';
import { UserService } from '../../../core/Services/user-service';
import { MenuService } from '../../../core/Services/menu.service';
import { UserStateService } from '../../../core/Services/user.state.service';
import { SignUp } from '../../../core/Components/sign-up/sign-up';
import { MenuPermissionsService } from '../../../core/Services/menu.permissions.service';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule, CommonModule, SignUp],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  isLoginView:boolean = true;
  loginModel: LoginModel = new LoginModel();
  userModel: UserModel = new UserModel();
  showPassword: boolean = false;
  isOTPEnabled: boolean = false;
  userRoles: DropdownModel[] = [];
  userGuid: string = "";
  emailConfiguration: any;
  IsPasswordEnabled: boolean = true;
  OTP: string = "";
  OTPSendMessage: string = "";
  @Input() userConfiguration!: UserConfiguration;

  constructor(private authService: AuthService, private router: Router, private userRolesService: UserRolesService,
    private emailService: EmailService, private swalService: SwalService, private userService: UserService,
    private menuService: MenuService, private userState: UserStateService, private menuPermissionsState: MenuPermissionsService
  ) {}

  ngOnInit() {
    this.isLoginView = true;
    this.isOTPEnabled = false;
    this.IsPasswordEnabled = true;
    this.GetUserRolesDropdown();
  }

  toggleView() {
    this.isLoginView = !this.isLoginView;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  IsChecked(event: Event, RButton: string) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if(RButton == 'IsPassword') {
      this.IsPasswordEnabled = true;
      this.isOTPEnabled = false;
    }
    else if(RButton == 'IsOtp') {
      this.isOTPEnabled = true;
      this.IsPasswordEnabled = false;
      this.GetEmailConfiguration();
    }
  }

  public async onLogin() {
    try{
      let response = "";
      if(!this.loginModel.useremail) {
        this.swalService.ShowAlert("error", "Useremail is required");
        return;
      }
      if(!this.loginModel.password && !this.loginModel.isOtpVerified) {
        this.swalService.ShowAlert("error", "password is required");
        return;
      }
      
      this.authService.login(this.loginModel).subscribe({
        next: async (res) => {
          response = JSON.stringify(res);
          if(JSON.parse(response).isSuccess == true) {
            localStorage.setItem("IsUserLoggedIn", "True");
            this.userState.setUser(JSON.parse(response));            
            this.authService.startTokenTimer();

            const user = this.userState.user();
            const userGuid = user?.recordId || '';
            if(userGuid) {
              (await this.menuService.GetUserMenus(userGuid)).subscribe({
                next: (res) => {            
                  let response = JSON.parse(JSON.stringify(res));   
                  
                  // Store menus/permissions
                  this.menuPermissionsState.setMenus(response);               
                  
                  const firstMenu = response.find((m: { link: any; }) => m.link);
                  if (firstMenu) {
                    this.router.navigate([firstMenu.link]);
                  }
                  else {
                    this.router.navigate(['/no-access']);
                    return;
                  }
                },
              });
            }
          }
          else {
            this.swalService.ShowAlert("error", JSON.parse(response).message);
          }
        },
        error: (err) => {
          this.swalService.ShowAlert("error", "Invalid email or password!");
          // to clear fields
          this.ClearFormFields();
        }
      });
      
    }
    catch (error) {
      throw error;
    }
  }
  onLogout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
  
  openSignup () {
    this.isLoginView = false;
    this.userConfiguration = {
      ...this.userConfiguration,
      isFormHeaderShow: false
    };
  }

  public async GetUserRolesDropdown() {
    try {
      if (!this.isLoginView) {
        (await this.userRolesService.GetUserRolesDropdown()).subscribe({
          next: (res) => {
            this.userRoles = JSON.parse(JSON.stringify(res));
            //console.log("UserRolesList", this.userRoles);
          },
          error: () => {
            this.swalService.ShowAlert("error", "");
          }
        });
      }
    }
    catch (err) {
      throw err;
    }
  }

  public async GetEmailConfiguration() {
    try {
      (await this.emailService.GetEmailConfiguration("UOTP")).subscribe({
        next: (res: any) => {
          if (res.isSuccess) {
            this.emailConfiguration = JSON.parse(res.message);
          }
        },
        error: () => {
          this.swalService.ShowAlert("error", "");
        }
      });
    }    
    catch (err) {
      throw err;
    }
  }

  public async SendOTP() {
    try {
       // Validate email configuration
    if (!this.emailConfiguration) {
      this.swalService.ShowAlert("error", "Email configuration not loaded");
      return;
    }

    if (!this.emailConfiguration.FromEmail) {
      this.swalService.ShowAlert("error", "FromEmail is required");
      return;
    }

    if (!this.emailConfiguration.Subject) {
      this.swalService.ShowAlert("error", "Subject is required");
      return;
    }

    if (!this.emailConfiguration.Body) {
      this.swalService.ShowAlert("error", "Body is required");
      return;
    }

    // Validate user email
    if (!this.loginModel || !this.loginModel.useremail) {
      this.swalService.ShowAlert("error", "User email is required");
      return;
    }

      let emailModel: EmailModel = new EmailModel();
      emailModel.fromEmail = this.emailConfiguration.FromEmail;
      emailModel.toEmail = this.loginModel.useremail;
      emailModel.subject = this.emailConfiguration.Subject;
      emailModel.body = this.emailConfiguration.Body;
      (await this.emailService.SendOTP(emailModel)).subscribe({
          next: (res) => {                       
            let response = JSON.parse(JSON.stringify(res));
            if(response.isSuccess) {
              this.OTPSendMessage = response.message;
              console.log(this.OTPSendMessage)
            }
          },
          error: () => {
            this.swalService.ShowAlert("error", "");
          }
        });
    }
    catch (err) {
      throw err;
    }
  }

  public async VerifyOTP() {
    try {
      let otpmodel: VerifyOtpModel = new VerifyOtpModel();
      let response = "";

      otpmodel.Email = this.loginModel.useremail;
      otpmodel.OTP = this.OTP;
      (await this.emailService.VerifyOTP(otpmodel)).subscribe({
          next: (res) => {
            response = JSON.stringify(res);
            if(response == 'true') {
              this.loginModel.isOtpVerified = true;
              this.onLogin();
            } else {
              this.swalService.ShowAlert("error", "Invalid or expired OTP");
            }            
          },
          error: () => {
            this.swalService.ShowAlert("error", "Invalid email or OTP!");
            // to clear fields
            this.ClearFormFields();
          }
        });
    }
    catch(error) {
      throw error;
    }
  }

  public async InsertUser() {
    try {
      let response = "";
      this.userModel.roleId = Number(this.userModel.roleId);
      this.userService.Insert(this.userModel).subscribe({
        next: (res) => {
          response = JSON.stringify(res);
          if(JSON.parse(response).isSuccess == true) {
            this.swalService.ShowAlert("success", JSON.parse(response).message);
          }
          else {
            this.swalService.ShowAlert("error", JSON.parse(response).message);
          }
        },
        error: (err) => {
          this.swalService.ShowAlert("error", "User not created!");          
        }
      });
    }
    catch(error) {
      throw error;
    }
  }

  ClearFormFields() {
    this.loginModel.useremail = "";
    this.loginModel.password = "";
  }
}
