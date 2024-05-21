import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VitalsComponent } from "../../components/vitals/vitals.component";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    imports: [CommonModule, ReactiveFormsModule, VitalsComponent]
})
export class DashboardComponent {
  vitalsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.vitalsForm = this.fb.group({
      username:[apiService.getUsername()],
      sendPulse: [false],
      pulse: [{value: '80', disabled: true}],
      sendHeartRate: [false],
      heartRate: [{value: '70', disabled: true}],
      sendTemperature: [false],
      temperature: [{value: '36.7', disabled: true}],
      interval: [{value: '5', disabled: true}, [Validators.min(1)]]
    });

    this.vitalsForm.valueChanges.subscribe(changes => {
      if (changes.sendPulse || changes.sendHeartRate || changes.sendTemperature) {
        this.vitalsForm.get('interval')!.enable({emitEvent: false});
        if (changes.sendPulse) {
          this.vitalsForm.get('pulse')!.enable({emitEvent: false});
        } else {
          this.vitalsForm.get('pulse')!.disable({emitEvent: false});
        }
        if (changes.sendHeartRate) {
          this.vitalsForm.get('heartRate')!.enable({emitEvent: false});
        } else {
          this.vitalsForm.get('heartRate')!.disable({emitEvent: false});
        }
        if (changes.sendTemperature) {
          this.vitalsForm.get('temperature')!.enable({emitEvent: false});
        } else {
          this.vitalsForm.get('temperature')!.disable({emitEvent: false});
        }
      } else {
        this.vitalsForm.get('interval')!.disable({emitEvent: false});
        this.vitalsForm.get('pulse')!.disable({emitEvent: false});
        this.vitalsForm.get('heartRate')!.disable({emitEvent: false});
        this.vitalsForm.get('temperature')!.disable({emitEvent: false});
      }
    });
  }

}
