import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { MessagesComponent } from './messages/messages.component';
import { RouterModule } from '@angular/router';
import { AdminRoutes } from './admin.routing';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {} from '@angular/material/form-field';
import {} from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { CoreModule } from '../core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LotaipComponent } from './lotaip/lotaip.component';
import { AccordionModule } from 'primeng/accordion';
import { GalleryImagesAdminComponent } from './gallery-images-admin/gallery-images-admin.component';
@NgModule({
  declarations: [
    AdminComponent,
    MessagesComponent,
    LotaipComponent,
    GalleryImagesAdminComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(AdminRoutes),
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule, 
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatDividerModule,
    CoreModule,
    AccordionModule
  ]
})
export class AdminModule { }
