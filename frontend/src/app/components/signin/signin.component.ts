import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class SigninComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorPopup: string = '';
  
  // Change this to your backend URL
  private backendUrl: string = 'http://localhost:8000/api/v1/users/login';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
  }
  
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
  
  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }

  handleLogin(): void {
    const data = {
      email: this.email,
      password: this.password
    };

    this.http.post(this.backendUrl, data, {
      withCredentials: true
    }).subscribe({
      next: (response: any) => {
        console.log(response.message);
        
        const { accessToken } = response.data;
        
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
        }
        
        // Navigate to dashboard on successful login
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        const errorMessage = error.error?.message || error.message;
        if (errorMessage === 'Request failed with status code 401') {
          this.errorPopup = 'Invalid Email Or Password';
        } else {
          this.errorPopup = errorMessage;
        }

        setTimeout(() => {
          this.errorPopup = '';
        }, 2000);
        console.error('Error during login:', error.error || error.message);
      }
    });
  }
}