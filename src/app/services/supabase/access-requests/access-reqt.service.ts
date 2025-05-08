import { Injectable } from '@angular/core';
import { supabase } from 'src/app/core/supabase.client';
import emailjs from '@emailjs/browser';
import { environment } from 'src/environments/environment';
import type { EmailJSResponseStatus } from '@emailjs/browser';
import { from, Observable } from 'rxjs';
import { Models } from 'src/app/models/models';

@Injectable({
  providedIn: 'root'
})
export class AccessReqtService {

  private table = 'access_requests';

   getAccessRequest(): Observable<Models.AccessReq.AccessRequestsI[]> {
      return from(supabase
        .from(this.table)
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => data as Models.AccessReq.AccessRequestsI[]));
    }
  async saveRequest(data: any): Promise<void> {
    const { error } = await supabase.from(this.table).insert([data]);
    if (error) throw error;
  }

  async getAccessById(id: string): Promise<Models.AccessReq.AccessRequestsI | null> {
      return await supabase
        .from(this.table)
        .select('*') // incluye relación
        .eq('id', id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as Models.AccessReq.AccessRequestsI;
        });
    }

  async updateStatusAccessRequest(id: string, status: string): Promise<void> {
    return supabase
    .from('access_requests')
    .update({ status })
    .eq('id', id)
    .then(({ error }) => {
      if (error) {
        throw new Error(`No se pudo actualizar el estado a ${status}: ${error.message}`);
      }
    });
  }
  sendMailToUser(data: any): Promise<EmailJSResponseStatus> {
    return emailjs.send(
      environment.emailjs.serviceId,
      environment.emailjs.templateIdUser,
      {
        to_name: data.fullname,
        to_email: data.email,
      },
      environment.emailjs.publicKey
    );
  }

  sendMailToAdmin(data: any): Promise<EmailJSResponseStatus> {
    const time = Date.now();

    return emailjs.send(
      environment.emailjs.serviceId,
      environment.emailjs.templateIdAdmin,
      {
        user_name: data.fullname,
        user_email: data.email,
        user_phone: data.phone,
        user_group: data.group,
        time
      },
      environment.emailjs.publicKey
    );
  }

  sendCredentialToUser(data: Models.AccessReq.AccessRequestsI): Promise<EmailJSResponseStatus> {
    const time = Date.now();

    return emailjs.send(
      environment.emailjs.serviceId,
      environment.emailjs.templateIdAdmin,
      {
        user_name: data.fullname,
        user_email: data.email,
        user_phone: data.phone,
        user_group: data.group,
        time
      },
      environment.emailjs.publicKey
    );
  }


}
