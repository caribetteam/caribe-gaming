import { Injectable } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client?: SupabaseClient;

  getClient(): SupabaseClient {
    if (!environment.supabase.url || !environment.supabase.anonKey) {
      throw new Error('Supabase frontend configuration is missing.');
    }

    this.client ??= createClient(environment.supabase.url, environment.supabase.anonKey);
    return this.client;
  }
}
