import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DateDisplayPipe } from './pipes/date-display.pipe';

@NgModule({
  declarations: [DateDisplayPipe],
  imports: [CommonModule],
  exports: [DateDisplayPipe],
  providers: [DatePipe],
})
export class CoreModule {}
