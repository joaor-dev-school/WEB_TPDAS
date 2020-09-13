import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './core/main/main.component';
import { AuthGuard } from './shared/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'calendar',
        loadChildren: () => import('src/app/calendar/calendar.module').then((m) => m.CalendarModule),
      },
      {
        path: 'edit-profile',
        loadChildren: () => import('src/app/edit-profile/edit-profile.module').then((m) => m.EditProfileModule),
      },
      { path: '**', redirectTo: 'calendar', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
