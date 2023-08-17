import { Component, OnInit } from '@angular/core';
import { PruebaService } from './services/prueba.service';
import { StorageService } from './services/storage.service';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'tungurahua';
  constructor(
  
  ) {}
  ngOnInit(): void {}
}
