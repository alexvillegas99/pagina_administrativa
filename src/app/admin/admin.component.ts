import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  ngOnInit(): void {
    this.onWindowResize();
  }
  sideNavStatus:boolean=true; 
  logOutMessageStatus:boolean=false;
  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    const size = window.innerWidth;
    if(size<=800){
      this.sideNavStatus=false;
    }
    if(size>800){
      this.sideNavStatus=true;
    }
  }
}
