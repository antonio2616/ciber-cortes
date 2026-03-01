import { Routes } from '@angular/router';
import { CapturaComponent } from './pages/captura/captura';
import { DesgloseComponent } from './pages/desglose/desglose';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'captura' },
  { path: 'captura', component: CapturaComponent },
  { path: 'desglose', component: DesgloseComponent },
  { path: '**', redirectTo: 'captura' },
];