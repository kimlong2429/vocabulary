import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LearnComponent } from './learn/learn.component';
import { ReviewComponent } from './review/review.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: 'review', component: ReviewComponent },
  { path: 'learn', component: LearnComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '', redirectTo: '/settings', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
