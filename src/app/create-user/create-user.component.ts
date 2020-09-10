import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { environment } from "../../environments/environment";
// import { environment } from "../../../environments/environment";

@Component({
  selector: "app-create-user",
  templateUrl: "./create-user.component.html",
  styleUrls: ["./create-user.component.scss"],
})
export class CreateUserComponent implements OnInit {
  createUserForm: FormGroup;

  constructor(private fb: FormBuilder, private httpClient: HttpClient) {
    this.createUserForm = this.fb.group({
      username: this.fb.control("", [Validators.required, Validators.min(5)]),
      password: this.fb.control("", [Validators.required, Validators.min(5)]),
      confirmpassword: this.fb.control("", [
        Validators.required,
        Validators.min(5),
      ]),
      name: this.fb.control("", [Validators.required, Validators.min(5)]),
    });
  }

  ngOnInit(): void {}

  createUser(): Promise<void> {
    return new Promise(
      (
        resolve: () => void,
        reject: (error: HttpErrorResponse) => void
      ): void => {
        // this.storage.removeItem(STORAGE_USER_ID_KEY);
        this.httpClient
          .post(`${environment.apiConfig.path}/register`, {
            username: this.createUserForm.get("username").value,
            password: this.createUserForm.get("password").value,
            name: this.createUserForm.get("name").value,
          })
          .subscribe(
            () => resolve(),
            (error: HttpErrorResponse) => reject(error)
          );
      }
    );
  }
}
