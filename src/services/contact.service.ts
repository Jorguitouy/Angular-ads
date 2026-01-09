
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';

export interface ContactData {
  name: string;
  phone: string;
  email: string;
  message: string;
  honeypot?: string; // Campo anti-spam
  turnstileToken: string;
  deviceFingerprint?: string; // Nuevo campo opcional para firma del dispositivo
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  
  // Endpoint de la API Serverless
  private readonly API_URL = '/api/send-email'; 

  sendMessage(data: ContactData): Observable<any> {
    return this.http.post(this.API_URL, data);
  }
}
