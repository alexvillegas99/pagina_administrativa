import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';

const routes: Routes = [{
  path:'',
  children: [
    {
      path: '',
      loadChildren: () =>
        import('../app/public/public.module').then((m) => m.PublicModule),
    },
  ],
},
{
  path:'admin',
  component:AdminComponent,
  children: [
    {
      path: '',
      loadChildren: () =>
        import('../app/admin/admin.module').then((m) => m.AdminModule),
    },
  ],
},
{
  path: '**',
  redirectTo: '', 
  pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
