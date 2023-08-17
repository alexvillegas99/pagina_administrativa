import { Routes } from '@angular/router';
import { MessagesComponent } from './messages/messages.component';
import { AdminComponent } from './admin.component';
import { LotaipComponent } from './lotaip/lotaip.component';
import { GalleryImagesAdminComponent } from './gallery-images-admin/gallery-images-admin.component';

export const AdminRoutes: Routes = [
  {
    path:'mensajes',
    component:MessagesComponent
  },
  {
    path:'lotaip',
    component:LotaipComponent
  },
  {
    path:'galieria-imagenes',
    component:GalleryImagesAdminComponent
  },
  {
    path: '',
    redirectTo: 'mensajes', 
    pathMatch: 'full' 
  },
  
]
