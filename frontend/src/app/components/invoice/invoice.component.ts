import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface InventoryItem {
  _id: string;
  item: string;
  stockRemain: number;
}

interface InvoiceItem {
  itemName: string;
  qty: number;
  price: number;
  tax: number;
}

interface Invoice {
  _id: string;
  name: string;
  items: InvoiceItem[];
  paid: boolean;
  date: string;
  subTotal: number;
  grandTotal: number;
  createdAt: string;
}

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
  imports: [ReactiveFormsModule, CommonModule, SidebarComponent],
  standalone: true
})
export class InvoiceComponent implements OnInit {
  invoiceForm: FormGroup;
  invoices: Invoice[] = [];
  inventoryItems: InventoryItem[] = [];
  selectedInvoice: Invoice | null = null;
  isModalOpen = false;
  isPopupVisible = false;

  private backendUrl = 'http://localhost:8000';
  private token = localStorage.getItem('accessToken');

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.invoiceForm = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      items: this.fb.array([]),
      paid: [false],
      // Remove subTotal and grandTotal from form as they're calculated by backend
    });
    this.addItem(); // Add initial item row
  }

  ngOnInit() {
    this.fetchInventoryItems();
    this.fetchInvoices();
  }

  get itemsFormArray() {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem() {
    const itemForm = this.fb.group({
      itemName: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      tax: [0, [Validators.required, Validators.min(0)]],
    });

    this.itemsFormArray.push(itemForm);
  }

  removeItem(index: number) {
    this.itemsFormArray.removeAt(index);
    this.calculateTotals(); // Keep for UI display purposes
  }

  onItemChange(index: number) {
    const itemForm = this.itemsFormArray.at(index);
    const selectedItem = this.inventoryItems.find(
      (inv) => inv.item === itemForm.get('itemName')?.value
    );

    if (selectedItem) {
      const qty = itemForm.get('qty')?.value;
      if (qty > selectedItem.stockRemain) {
        itemForm.get('qty')?.setValue(selectedItem.stockRemain);
        alert(`Only ${selectedItem.stockRemain} items available in stock`);
      }
    }

    this.calculateTotals(); // Keep for UI display purposes
  }

  // Keep calculateTotals for UI display only, backend will recalculate
  calculateTotals() {
    const items = this.itemsFormArray.value;
    let subTotal = 0;
    let grandTotal = 0;

    items.forEach((item: InvoiceItem) => {
      const itemTotal = item.qty * item.price;
      const taxAmount = itemTotal * (item.tax / 100);
      subTotal += itemTotal;
      grandTotal += itemTotal + taxAmount;
    });

    // For display purposes only - these values aren't submitted
    this.invoiceForm.patchValue({ 
      subTotal: subTotal,
      grandTotal: grandTotal 
    }, { emitEvent: false });
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      // Structure data exactly how the backend expects it
      const invoiceData = {
        name: this.invoiceForm.get('name')?.value,
        date: this.invoiceForm.get('date')?.value,
        paid: this.invoiceForm.get('paid')?.value,
        items: this.itemsFormArray.value,
      };
  
      console.log("Invoice Data:", JSON.stringify(invoiceData, null, 2));
  
      this.http
        .post(`${this.backendUrl}/api/v1/invoice/add-invoice`, invoiceData, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this.token || ''}`, // Adding Bearer prefix
            'Content-Type': 'application/json',
          }),
        })
        .subscribe({
          next: (response: any) => {
            console.log("Invoice added successfully:", response);
            this.isPopupVisible = true;
            this.fetchInvoices();
            this.resetForm();
            
            // Auto-close the success popup after 3 seconds
            setTimeout(() => {
              this.isPopupVisible = false;
            }, 3000);
          },
          error: (error) => {
            console.error("Error adding invoice:", error);
            alert(error.error?.message || 'Failed to add invoice');
          },
        });
    } else {
      // Mark all fields as touched to trigger validation errors
      this.markFormGroupTouched(this.invoiceForm);
      alert('Please fill in all required fields correctly');
    }
  }
  
  // Helper to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            this.markFormGroupTouched(ctrl);
          } else {
            ctrl.markAsTouched();
          }
        });
      }
    });
  }

  resetForm() {
    this.invoiceForm.reset({
      name: '',
      date: '',
      paid: false
    });

    while (this.itemsFormArray.length) {
      this.itemsFormArray.removeAt(0);
    }
    this.addItem();
  }

  fetchInventoryItems() {
    this.http
      .get<{ data: { inventory: InventoryItem[] } }>(`${this.backendUrl}/api/v1/inventory/get-item`, {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.token || ''}`,
        }),
      })
      .subscribe({
        next: (response) => {
          // Adjust based on actual backend response structure
          this.inventoryItems = response.data.inventory || [];
        },
        error: (error) => {
          console.error('Error fetching inventory:', error);
        },
      });
  }

  fetchInvoices() {
    this.http
      .get<{ data: { invoice: Invoice[] } }>(
        `${this.backendUrl}/api/v1/invoice/get-invoice`,
        {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this.token || ''}`,
          }),
        }
      )
      .subscribe({
        next: (response) => {
          this.invoices = response.data.invoice.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        },
        error: (error) => {
          console.error('Error fetching invoices:', error);
        },
      });
  }

  openModal(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedInvoice = null;
  }

  togglePaidStatus() {
    if (!this.selectedInvoice?._id) return;

    this.http
      .put(
        `${this.backendUrl}/api/v1/invoice/invoices/${this.selectedInvoice._id}/toggle-paid`,
        {},
        {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${this.token || ''}`,
          }),
        }
      )
      .subscribe({
        next: () => {
          this.fetchInvoices();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating paid status:', error);
        },
      });
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}