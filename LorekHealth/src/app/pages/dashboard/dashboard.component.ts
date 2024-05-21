import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VitalsComponent } from "../../components/vitals/vitals.component";
import { UserListenerComponent } from "../../components/user-listener/user-listener.component";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    imports: [CommonModule, ReactiveFormsModule, VitalsComponent, UserListenerComponent]
})
export class DashboardComponent {

}
