// expenses.component.ts
import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-expenses',
    templateUrl: './expenses.component.html',
    styleUrls: ['./expenses.component.css'],
    imports : [FormsModule, SidebarComponent, CommonModule]
})
export class ExpensesComponent implements OnInit {
    name: string = '';
    expAmount: number | null = null;
    description: string = '';
    date: string = '';
    isPopupVisible: boolean = false;
    expenses: any[] = [];
    token: string | null = localStorage.getItem('accessToken');

    constructor() {}

    ngOnInit(): void {
        this.getExpenses();
    }

    async addExpense(event: Event) {
        event.preventDefault();
        const data = { name: this.name, expAmount: this.expAmount, description: this.description, date: this.date };
        const response = await axios.post(`http://localhost:8000/api/v1/expense/add-expense`, data, {
            headers: { Authorization: this.token }, withCredentials: true
        });
        if (response.data.statusCode === 200) {
            this.isPopupVisible = true;
            this.getExpenses();
        }
    }

    closePopup() {
        this.isPopupVisible = false;
    }

    async getExpenses() {
        const response = await axios.get(`http://localhost:8000/api/v1/expense/get-expense`, {
            headers: { Authorization: this.token }, withCredentials: true
        });
        if (response.data.statusCode === 200) {
            this.expenses = response.data.data.expense;
        }
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString();
    }
}
