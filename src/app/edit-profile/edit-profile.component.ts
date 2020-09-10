import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "../shared/auth/auth.service";
import { state } from "@angular/animations";
import { Router } from "@angular/router";

enum State {
  password,
  menu,
  changeUsername,
  changePassword,
}

@Component({
  selector: "app-edit-profile",
  templateUrl: "./edit-profile.component.html",
  styleUrls: ["./edit-profile.component.scss"],
})
export class EditProfileComponent implements OnInit {
  currentState = State.password;

  state = State;
  userProfileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authservice: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log(this.authservice);
    this.userProfileForm = this.fb.group({
      username: this.fb.control("", [Validators.required, Validators.min(5)]),
      password: this.fb.control("", [Validators.required, Validators.min(5)]),
      newpassword: this.fb.control("", [
        Validators.required,
        Validators.min(5),
      ]),
      email: this.fb.control("", [Validators.required, Validators.min(5)]),
    });
    this.userProfileForm.get("username").setValue(this.authservice.userName);

    console.log(this.authservice);
  }

  changeProfile(): void {
    console.log(this.authservice.userPass);
    if (
      this.userProfileForm.get("password").value == this.authservice.userPass
    ) {
      this.currentState = State.menu;
    }
  }

  enterChangeUser(): void {
    this.currentState = State.changeUsername;
  }

  enterChangePass(): void {
    this.currentState = State.changePassword;
  }

  exitChangeProfile(): void {
    this.router.navigate(["calender"]);
  }
}
