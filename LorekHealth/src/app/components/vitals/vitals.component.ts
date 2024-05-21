import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, switchMap, takeUntil, timer } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-vitals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vitals.component.html',
  styleUrls: ['./vitals.component.css']
})
export class VitalsComponent implements OnDestroy  {
  vitalsForm: FormGroup;
  private intervalId: any;
  private subscriptions: Subscription = new Subscription();

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.vitalsForm = this.fb.group({
      username: [this.apiService.getUsername()],
      sendPulse: [false],
      pulse: [{ value: 80, disabled: true }],
      sendHeartRate: [false],
      heartRate: [{ value: 70, disabled: true }],
      sendTemperature: [false],
      temperature: [{ value: 36.7, disabled: true }],
      interval: [ 5, Validators.min(1)]
    });

    this.setupFormStateChange('sendPulse', 'pulse' );
    this.setupFormStateChange('sendHeartRate', 'heartRate' );
    this.setupFormStateChange('sendTemperature', 'temperature');
  
    this.setupIntervalLogic();
  }

  private setupFormStateChange(sendControl: string, valueControl: string): void {
    this.vitalsForm.get(sendControl)!.valueChanges.subscribe(checked => {
      const control = this.vitalsForm.get(valueControl);
      if (checked) {
        control!.enable();
      } else {
        control!.disable();
      }
    });
  }

  private sendVitals(): void {
    const formValue = this.vitalsForm.getRawValue();
    if (formValue.sendPulse || formValue.sendHeartRate || formValue.sendTemperature) {
      this.subscriptions.add(
        this.apiService.registerVitals(
          formValue.username,
          formValue.sendPulse ? formValue.pulse : null,
          formValue.sendHeartRate ? formValue.heartRate : null,
          formValue.sendTemperature ? formValue.temperature : null
        ).subscribe({
          next: (response) => console.log('Vitals registered', response),
          error: (error) => console.error('Error registering vitals', error)
        })
      );
    }
  }

  private setupIntervalLogic(): void {
    const initialInterval = this.vitalsForm.get('interval')!.value * 1000;
    this.intervalId = setInterval(() => {
      this.sendVitals();
    }, initialInterval);

    this.vitalsForm.get('interval')!.valueChanges.subscribe(newInterval => {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.sendVitals();
      }, newInterval * 1000);
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
