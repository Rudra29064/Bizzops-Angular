import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

interface Sale {
  _id: string;
  productName: string;
  price: number;
  qty: number;
  date: string;
  createdAt: string;
  profit: number;
  cost: number;
}

interface InventoryItem {
  _id: string;
  item: string;
  stockRemain: number;
}

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
  imports : [FormsModule, SidebarComponent, CommonModule]
})
export class SalesComponent implements OnInit {
  sales: Sale[] = [];
  inventory: InventoryItem[] = [];
  isPopupVisible = false;

  // Form fields
  product = '';
  price = '';
  profitInPercent = '';
  qty = '';
  date = '';

  constructor(
    private router: Router, 
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchInventory();
    this.fetchSales();
  }

  fetchInventory() {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<any>('http://localhost:8000/api/v1/inventory/get-item', { headers })
      .subscribe({
        next: (response) => {
          this.inventory = response.data;
        },
        error: (error) => {
          console.error('Failed to fetch inventory items:', error);
        }
      });
  }

  fetchSales() {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<any>('http://localhost:8000/api/v1/sales/get-sale?timeFilter=alltime', { headers })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.sales = response.data.sort((a: Sale, b: Sale) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
        },
        error: (error) => {
          console.error('Failed to fetch sales:', error);
        }
      });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  handleAddSales() {
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });

    const data = { 
      product: this.product, 
      price: this.price, 
      profitInPercent: this.profitInPercent, 
      qty: this.qty, 
      date: this.date 
    };

    this.http.post<any>('http://localhost:8000/api/v1/sales/add-sale', data, { headers })
      .subscribe({
        next: (response) => {
          if (response.status === 201) {
            console.log("Product added to sales");
            this.sales.unshift(response.data);
            this.isPopupVisible = true;

            // Reset form
            this.product = '';
            this.price = '';
            this.profitInPercent = '';
            this.qty = '';
            this.date = '';
          }
        },
        error: (error) => {
          console.error("Error while adding product", error);
        }
      });
  }

  handleClosePopup() {
    this.isPopupVisible = false;
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}