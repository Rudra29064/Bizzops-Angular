// import { Component, OnInit } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { DecimalPipe, NgIf } from '@angular/common';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { faChartGantt, faMoneyBill1, faDollar, faWallet } from '@fortawesome/free-solid-svg-icons';
// import { catchError, forkJoin, of } from 'rxjs';

// @Component({
//   selector: 'app-dashboard',
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css'],
//   standalone: true,
//   imports: [NgIf, FontAwesomeModule, DecimalPipe]
// })
// export class DashboardComponent implements OnInit {
//   // Icons
//   faChartGantt = faChartGantt;
//   faMoneyBill1 = faMoneyBill1;
//   faDollar = faDollar;
//   faWallet = faWallet;

//   // State variables with default values
//   totalSale: number = 0;
//   todaySale: number = 0;
//   monthSale: number = 0;
//   totalProfit: number = 0;
//   todayProfit: number = 0;
//   monthProfit: number = 0;
//   totalCost: number = 0;
//   totalExpense: number = 0;
//   orders: number = 0;
//   pendingOrders: number = 0;
//   invoices: number = 0;
//   unpaidInvoices: number = 0;
//   customers: number = 0;

//   constructor(private http: HttpClient) {}

//   ngOnInit() {
//     this.fetchData();
//   }

//   fetchData() {
//     const token = localStorage.getItem('accessToken');
//     const headers = new HttpHeaders({
//       'Authorization': token || '',
//       'Content-Type': 'application/json'
//     });

//     // Define your API endpoints
//     const endpoints = [
//       { 
//         url: 'sales/get-total-alltime-sale', 
//         setter: (data: any) => this.totalSale = data.data?.totalSalesValue || 0 
//       },
//       { 
//         url: 'sales/get-total-alltime-profit', 
//         setter: (data: any) => this.totalProfit = data.data?.totalProfitValue || 0 
//       },
//       // ... other endpoints remain the same
//     ];

//     // Create an array of observables
//     const requests = endpoints.map(endpoint => 
//       this.http.get(`http://localhost:8000/api/v1/${endpoint.url}`, { headers })
//         .pipe(
//           catchError(error => {
//             console.error(`Error fetching ${endpoint.url}:`, error);
//             return of(null); // Return a safe value if request fails
//           })
//         )
//     );

//     // Use forkJoin to make multiple requests
//     forkJoin(requests).subscribe({
//       next: (results) => {
//         results.forEach((data, index) => {
//           if (data) {
//             endpoints[index].setter(data);
//           }
//         });
//       },
//       error: (error) => {
//         console.error('Error in dashboard data fetch:', error);
//       }
//     });
//   }
// }

import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DecimalPipe, NgIf } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartGantt, faMoneyBill1, faDollar, faWallet } from '@fortawesome/free-solid-svg-icons';
import { catchError, forkJoin, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [NgIf, FontAwesomeModule, DecimalPipe, SidebarComponent]
})
export class DashboardComponent implements OnInit {
  // Icons
  faChartGantt = faChartGantt;
  faMoneyBill1 = faMoneyBill1;
  faDollar = faDollar;
  faWallet = faWallet;

  // State variables with default values
  totalSale: number = 0;
  todaySale: number = 0;
  monthSale: number = 0;
  totalProfit: number = 0;
  todayProfit: number = 0;
  monthProfit: number = 0;
  totalCost: number = 0;
  totalExpense: number = 0;
  orders: number = 0;
  pendingOrders: number = 0;
  invoices: number = 0;
  unpaidInvoices: number = 0;
  customers: number = 0;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.fetchData();
  }

  private getAccessToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        return localStorage.getItem('accessToken');
      } catch (error) {
        console.warn('localStorage is not accessible:', error);
        return null;
      }
    }
    return null;
  }

  fetchData() {
    const token = this.getAccessToken();
    if (!token) {
      console.warn('No access token found or localStorage is unavailable.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });

    // Define API endpoints and corresponding state setters
    const endpoints = [
      { url: 'sales/get-total-alltime-sale', setter: (data: any) => this.totalSale = data.data?.totalSalesValue || 0 },
      { url: 'sales/get-total-alltime-profit', setter: (data: any) => this.totalProfit = data.data?.totalProfitValue || 0 },
      { url: 'sales/get-today-sale', setter: (data: any) => this.todaySale = data.data?.todaySalesValue || 0 },
      { url: 'sales/get-today-profit', setter: (data: any) => this.todayProfit = data.data?.todayProfitValue || 0 },
      { url: 'sales/get-month-sale', setter: (data: any) => this.monthSale = data.data?.monthSalesValue || 0 },
      { url: 'sales/get-month-profit', setter: (data: any) => this.monthProfit = data.data?.monthProfitValue || 0 },
      { url: 'expenses/get-total-expense', setter: (data: any) => this.totalExpense = data.data?.totalExpenseValue || 0 },
      { url: 'orders/get-total-orders', setter: (data: any) => this.orders = data.data?.totalOrders || 0 },
      { url: 'orders/get-pending-orders', setter: (data: any) => this.pendingOrders = data.data?.pendingOrders || 0 },
      { url: 'invoices/get-total-invoices', setter: (data: any) => this.invoices = data.data?.totalInvoices || 0 },
      { url: 'invoices/get-unpaid-invoices', setter: (data: any) => this.unpaidInvoices = data.data?.unpaidInvoices || 0 },
      { url: 'customers/get-total-customers', setter: (data: any) => this.customers = data.data?.totalCustomers || 0 }
    ];

    // Create an array of API requests
    const requests = endpoints.map(endpoint =>
      this.http.get(`http://localhost:8000/api/v1/${endpoint.url}`, { headers }).pipe(
        catchError(error => {
          console.error(`Error fetching ${endpoint.url}:`, error);
          return of(null); // Return a safe value to avoid breaking the loop
        })
      )
    );

    // Execute all API requests in parallel
    forkJoin(requests).subscribe({
      next: (results) => {
        results.forEach((data, index) => {
          if (data) {
            endpoints[index].setter(data);
          }
        });
      },
      error: (error) => {
        console.error('Error in dashboard data fetch:', error);
      }
    });
  }
}
