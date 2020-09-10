import { EditProfileComponent } from "./edit-profile/edit-profile.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MainComponent } from "./core/main/main.component";
import { AuthGuard } from "./shared/auth/auth.guard";

const routes: Routes = [
  {
    path: "",
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "calendar",
        loadChildren: () =>
          import("src/app/calendar/calendar.module").then(
            (m) => m.CalendarModule
          ),
      },
      {
        path: "edit-profile",
        component: EditProfileComponent,
        pathMatch: "full",
      },

      { path: "**", redirectTo: "calendar" },
    ],
  },
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
