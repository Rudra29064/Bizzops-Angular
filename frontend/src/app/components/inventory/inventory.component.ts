// import { Component, OnInit } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';

// interface InventoryItem {
//   _id?: string;
//   item: string;
//   category: string;
//   stockRemain: number;
//   date: string;
// }

// @Component({
//   selector: 'app-inventory',
//   templateUrl: './inventory.component.html',
//   styleUrls: ['./inventory.component.css'],
//   imports : [FormsModule]
// })
// export class InventoryComponent implements OnInit {
//   inventoryItems: InventoryItem[] = [];
  
//   // New item form model
//   newItem: InventoryItem = {
//     item: '',
//     category: '',
//     stockRemain: 0,
//     date: ''
//   };

//   // Stock adjustment modal properties
//   stockModalOpen = false;
//   stockAction: 'add' | 'remove' = 'add';
//   stockQuantity = 0;
//   selectedItem: InventoryItem | null = null;

//   // Delete modal properties
//   deleteModalOpen = false;
//   itemToDelete: InventoryItem | null = null;

//   constructor(
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.fetchInventory();
//   }

//   fetchInventory(): void {
//     const token = localStorage.getItem('accessToken');
//     const headers = new HttpHeaders({
//       'Authorization': `${token}`,
//       'Content-Type': 'application/json'
//     });

//     this.http.get<{data: InventoryItem[]}>('http://localhost:8000/api/v1/inventory/get-item', { headers })
//       .subscribe({
//         next: (response) => {
//           this.inventoryItems = response.data;
//         },
//         error: (error) => {
//           console.error('Failed to fetch inventory:', error);
//         }
//       });
//   }

//   handleAddInventory(): void {
//     const token = localStorage.getItem('accessToken');
//     const headers = new HttpHeaders({
//       'Authorization': `${token}`,
//       'Content-Type': 'application/json'
//     });

//     this.http.post('http://localhost:8000/api/v1/inventory/add-item', this.newItem, { headers })
//       .subscribe({
//         next: (response: any) => {
//           if (response && response.data) {
//             this.inventoryItems.push(response.data);
//             // Reset form
//             this.newItem = {
//               item: '',
//               category: '',
//               stockRemain: 0,
//               date: ''
//             };
//           }
//         },
//         error: (error) => {
//           console.error('Error adding inventory item:', error);
//         }
//       });
//   }

//   openStockModal(item: InventoryItem, action: 'add' | 'remove'): void {
//     this.selectedItem = item;
//     this.stockAction = action;
//     this.stockModalOpen = true;
//   }

//   adjustStock(): void {
//     if (!this.selectedItem) return;

//     const token = localStorage.getItem('accessToken');
//     const headers = new HttpHeaders({
//       'Authorization': `${token}`,
//       'Content-Type': 'application/json'
//     });

//     const endpoint = this.stockAction === 'add' 
//       ? 'http://localhost:8000/api/v1/inventory/add-stock'
//       : 'http://localhost:8000/api/v1/inventory/remove-stock';

//     this.http.post(endpoint, { 
//       product: this.selectedItem._id, 
//       newQty: this.stockQuantity 
//     }, { headers })
//       .subscribe({
//         next: () => {
//           this.fetchInventory();
//           this.closeStockModal();
//         },
//         error: (error) => {
//           console.error('Error adjusting stock:', error);
//         }
//       });
//   }

//   closeStockModal(): void {
//     this.stockModalOpen = false;
//     this.stockQuantity = 0;
//     this.selectedItem = null;
//   }

//   deleteItem(item: InventoryItem): void {
//     this.itemToDelete = item;
//     this.deleteModalOpen = true;
//   }

//   confirmDelete(): void {
//     if (!this.itemToDelete) return;

//     const token = localStorage.getItem('accessToken');
//     const headers = new HttpHeaders({
//       'Authorization': `${token}`,
//       'Content-Type': 'application/json'
//     });

//     this.http.post('http://localhost:8000/api/v1/inventory/delete-item', 
//       { product: this.itemToDelete._id }, 
//       { headers }
//     ).subscribe({
//       next: () => {
//         this.inventoryItems = this.inventoryItems.filter(
//           item => item._id !== this.itemToDelete?._id
//         );
//         this.cancelDelete();
//       },
//       error: (error) => {
//         console.error('Error deleting item:', error);
//         this.cancelDelete();
//       }
//     });
//   }

//   cancelDelete(): void {
//     this.deleteModalOpen = false;
//     this.itemToDelete = null;
//   }
// }


import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface InventoryItem {
  _id?: string;
  item: string;
  category: string;
  stockRemain: number;
  date: string;
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  imports: [FormsModule, SidebarComponent, CommonModule]
})
export class InventoryComponent implements OnInit {
  inventoryItems: InventoryItem[] = [];

  // New item form model
  newItem: InventoryItem = {
    item: '',
    category: '',
    stockRemain: 0,
    date: ''
  };

  // Stock adjustment modal properties
  stockModalOpen = false;
  stockAction: 'add' | 'remove' = 'add';
  stockQuantity = 0;
  selectedItem: InventoryItem | null = null;

  // Delete modal properties
  deleteModalOpen = false;
  itemToDelete: InventoryItem | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.fetchInventory();
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

  fetchInventory(): void {
    const token = this.getAccessToken();
    if (!token) {
      console.warn('No access token found or localStorage is unavailable.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<{ data: InventoryItem[] }>('http://localhost:8000/api/v1/inventory/get-item', { headers })
      .subscribe({
        next: (response) => {
          this.inventoryItems = response.data;
        },
        error: (error) => {
          console.error('Failed to fetch inventory:', error);
        }
      });
  }

  handleAddInventory(): void {
    const token = this.getAccessToken();
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post('http://localhost:8000/api/v1/inventory/add-item', this.newItem, { headers })
      .subscribe({
        next: (response: any) => {
          if (response?.data) {
            this.inventoryItems.push(response.data);
            // Reset form
            this.newItem = { item: '', category: '', stockRemain: 0, date: '' };
          }
        },
        error: (error) => {
          console.error('Error adding inventory item:', error);
        }
      });
  }

  openStockModal(item: InventoryItem, action: 'add' | 'remove'): void {
    this.selectedItem = item;
    this.stockAction = action;
    this.stockModalOpen = true;
  }

  adjustStock(): void {
    if (!this.selectedItem) return;

    const token = this.getAccessToken();
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });

    const endpoint = this.stockAction === 'add' 
      ? 'http://localhost:8000/api/v1/inventory/add-stock'
      : 'http://localhost:8000/api/v1/inventory/remove-stock';

    this.http.post(endpoint, { product: this.selectedItem._id, newQty: this.stockQuantity }, { headers })
      .subscribe({
        next: () => {
          this.fetchInventory();
          this.closeStockModal();
        },
        error: (error) => {
          console.error('Error adjusting stock:', error);
        }
      });
  }

  closeStockModal(): void {
    this.stockModalOpen = false;
    this.stockQuantity = 0;
    this.selectedItem = null;
  }

  deleteItem(item: InventoryItem): void {
    this.itemToDelete = item;
    this.deleteModalOpen = true;
  }

  confirmDelete(): void {
    if (!this.itemToDelete) return;

    const token = this.getAccessToken();
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post('http://localhost:8000/api/v1/inventory/delete-item', { product: this.itemToDelete._id }, { headers })
      .subscribe({
        next: () => {
          this.inventoryItems = this.inventoryItems.filter(item => item._id !== this.itemToDelete?._id);
          this.cancelDelete();
        },
        error: (error) => {
          console.error('Error deleting item:', error);
          this.cancelDelete();
        }
      });
  }

  cancelDelete(): void {
    this.deleteModalOpen = false;
    this.itemToDelete = null;
  }
}
