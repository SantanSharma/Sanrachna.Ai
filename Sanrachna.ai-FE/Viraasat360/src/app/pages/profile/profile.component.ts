import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services';
import { UserProfile } from '../../models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">My Profile</h1>
        <p class="text-slate-400">Manage your personal information</p>
      </div>

      <!-- Profile Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Personal Information -->
        <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <svg class="w-5 h-5 text-app-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
              <input
                type="text"
                formControlName="fullName"
                class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500 focus:border-transparent transition-colors"
                placeholder="Enter your full name"
              />
              @if (form.get('fullName')?.touched && form.get('fullName')?.errors?.['required']) {
                <p class="mt-1 text-sm text-red-400">Full name is required</p>
              }
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
              <input
                type="date"
                formControlName="dateOfBirth"
                class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-app-500 focus:border-transparent transition-colors"
              />
            </div>

            <!-- Occupation -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Occupation</label>
              <input
                type="text"
                formControlName="occupation"
                class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500 focus:border-transparent transition-colors"
                placeholder="e.g. Software Engineer"
              />
            </div>

            <!-- Monthly Salary -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Monthly Salary (₹)</label>
              <input
                type="number"
                formControlName="monthlySalary"
                class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500 focus:border-transparent transition-colors"
                placeholder="0"
              />
              @if (form.get('monthlySalary')?.value > 0) {
                <p class="mt-1 text-sm text-slate-500">
                  Annual: ₹{{ (form.get('monthlySalary')?.value || 0) * 12 | number }}
                </p>
              }
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <svg class="w-5 h-5 text-app-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Information
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500 focus:border-transparent transition-colors"
                placeholder="you@example.com"
              />
              @if (form.get('email')?.touched && form.get('email')?.errors?.['email']) {
                <p class="mt-1 text-sm text-red-400">Please enter a valid email</p>
              }
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
              <input
                type="tel"
                formControlName="phone"
                class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500 focus:border-transparent transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>

            <!-- Address -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-300 mb-2">Address</label>
              <textarea
                formControlName="address"
                rows="3"
                class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500 focus:border-transparent transition-colors resize-none"
                placeholder="Enter your complete address"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <svg class="w-5 h-5 text-app-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Additional Information
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- PAN -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">PAN Number</label>
              <input
                type="text"
                formControlName="pan"
                class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500 focus:border-transparent transition-colors uppercase"
                placeholder="ABCDE1234F"
                maxlength="10"
              />
            </div>

            <!-- Nominee Preference -->
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">Nominee Preference</label>
              <input
                type="text"
                formControlName="nomineePreference"
                class="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-app-500 focus:border-transparent transition-colors"
                placeholder="e.g. Spouse, Children"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row justify-end gap-4">
          <button
            type="button"
            (click)="onReset()"
            class="px-6 py-3 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            [disabled]="form.invalid || isSaving()"
            class="px-6 py-3 rounded-lg text-sm font-medium text-white bg-app-600 hover:bg-app-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            @if (isSaving()) {
              <span class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            } @else {
              Save Profile
            }
          </button>
        </div>
      </form>

      <!-- Success Message -->
      @if (showSuccess()) {
        <div class="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Profile saved successfully!
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fade-in 0.3s ease-out; }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);

  form!: FormGroup;
  isSaving = signal(false);
  showSuccess = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  private initForm(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      dateOfBirth: [''],
      occupation: [''],
      monthlySalary: [0],
      email: ['', Validators.email],
      phone: [''],
      address: [''],
      pan: [''],
      nomineePreference: ['']
    });
  }

  private loadProfile(): void {
    const profile = this.profileService.getProfile();
    if (profile) {
      this.form.patchValue(profile);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);

    // Simulate async save
    setTimeout(() => {
      this.profileService.saveProfile(this.form.value);
      this.isSaving.set(false);
      this.showSuccess.set(true);

      setTimeout(() => this.showSuccess.set(false), 3000);
    }, 500);
  }

  onReset(): void {
    this.loadProfile();
  }
}
