import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-sliderbar',
  templateUrl: './sliderbar.component.html',
  styleUrls: ['./sliderbar.component.scss'],
})
export class SliderbarComponent implements OnInit {
  @Input() sideNavStatus: boolean = false;
  @Output() logOutMessage = new EventEmitter<boolean>();
  logOutStatus: boolean = false;
  constructor() {}
  ngOnInit(): void {
    this.activedMenu(1);
  }
  menu1 = false;
  menu2 = false;
  menu3 = false;
  activedMenu(id: number) {
    id === 1 ? (this.menu1 = true) : (this.menu1 = false);
    id === 2 ? (this.menu2 = true) : (this.menu2 = false);
    id === 3 ? (this.menu3 = true) : (this.menu3 = false);
  }
}
