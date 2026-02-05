import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./auth/login/login.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent],
  templateUrl: './app.html'
})
export class App {
  /**
   * Application title displayed as an immutable signal.
   * This is a reactive property that can be accessed in the template.
   * 
   * @type {WritableSignal<string>}
   * @readonly
   */
  protected readonly title = signal('login-and-register-jwt-angular');
}
