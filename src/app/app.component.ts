import {Component} from '@angular/core';
import {PrimeNGConfig} from "primeng/api";

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
    <navbar></navbar>
  `,
  styles: [`
    .app-container {
      height: 90vh;
      max-height: 90vh;;
    }
  `]
})
export class AppComponent {

  constructor(private _primengConfig: PrimeNGConfig) {
    this._primengConfig.ripple = true;
  }
}
