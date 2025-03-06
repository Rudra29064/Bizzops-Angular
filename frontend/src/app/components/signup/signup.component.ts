import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class SignupComponent implements OnInit {
  name: string = '';
  email: string = '';
  businessName: string = '';
  password: string = '';
  phoneNo: string = '';
  address: string = '';
  showPopup: boolean = false;
  errorPopup: string = '';
  
  // Change this to your backend URL
  private backendUrl: string = 'http://localhost:8000/api/v1/users/register';

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
  }
  
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
  
  navigateToSignin(): void {
    this.router.navigate(['/signin']);
  }

  handleRegister(): void {
    const data = {
      name: this.name,
      email: this.email,
      businessName: this.businessName,
      password: this.password,
      phoneNo: this.phoneNo,
      address: this.address
    };

    this.http.post(this.backendUrl, data, {
      withCredentials: true
    }).subscribe({
      next: (response: any) => {
        console.log(response.message);
        console.log(response);
        this.showPopup = true;

        setTimeout(() => {
          this.showPopup = false;
          this.router.navigate(['/signin']);
        }, 2000);
      },
      error: (error) => {
        const errorMessage = error.error?.message || error.message;
        if (errorMessage === 'Request failed with status code 409') {
          this.errorPopup = 'User Already Exists';
        } else {
          this.errorPopup = errorMessage;
        }

        setTimeout(() => {
          this.errorPopup = '';
        }, 2000);
        console.error('Error during registration:', errorMessage);
      }
    });
  }
}