import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SliderComponent } from './slider/slider.component';
import { SliderbarComponent } from './sliderbar/sliderbar.component';
import { GalleryComponent } from './gallery/gallery.component';
import { MessagesClientComponent } from './messages-client/messages-client.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    SliderComponent,
    SliderbarComponent,
    GalleryComponent,
    MessagesClientComponent,
    HeaderComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    RouterModule
  ],
  exports:[
    SliderComponent,
    SliderbarComponent,
    GalleryComponent,
    MessagesClientComponent,
    HeaderComponent
  ],
  
})
export class SharedModule { }
