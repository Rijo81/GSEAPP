import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { supabase } from 'src/app/core/supabase.client';
import { RequestsI } from 'src/app/models/requests.models';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {
  private table = 'requests';
  private readonly BUCKET = 'requests-file';

  /**
   * Sube un archivo al bucket y graba su URL pública en la tabla requests.document_url
   * @param requestId  ID de la fila en la tabla requests
   * @param file       Documento File (PDF, DOCX, etc)
   */
  getRequests(): Observable<RequestsI[]> {
    return from(
      supabase
        .from(this.table)
        .select('*, group_destine(*), group_origin(*)')
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
        return res.data;
      })
    );
  }

  addRequests(req: RequestsI): Observable<void> {
    return from(
      supabase
        .from(this.table)
        .insert([req])
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }

  updateRequests(id: string, req: Partial<RequestsI>): Observable<void> {
    return from(
      supabase
        .from(this.table)
        .update(req)
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }

  deleteRequests(id: string): Observable<void> {
    return from(
      supabase
        .from(this.table)
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
        })
    );
  }
  getRequestsByUser(userId: string): Observable<RequestsI[]> {
    return from(
      supabase
        .from(this.table) // 👈 Cambia por el nombre de tu tabla
        .select('*')
        .eq('user_id', userId) // 👈 Asume que hay un campo user_id
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as RequestsI[];
      })
    );
  }

  async getRequestsByUserForState(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('requests')
      .select('id, typeName, created_at, state_id, document_url')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener solicitudes:', error.message);
      return [];
    }

    return data || [];
  }

  async getRequestById(id: string): Promise<RequestsI | null> {
    return await supabase
      .from('requests')
      .select(`*,
        state_id(*),
        group_origin(*),
        group_destine(*)`) // incluye relación
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error;
        return data as RequestsI;
      });
  }

  async updateRequestState(id: string, state_id: string): Promise<void> {
    return await supabase
      .from('requests')
      .update({ state_id })
      .eq('id', id)
      .select('user_id')
      .then(({ error }) => {
        if (error) throw error;
      });
  }

  async attachDocument(requestId: string, file: File): Promise<string> {
    // 1️⃣ Genera un path con subcarpeta por request
    const folder   = `requests/doc/${requestId}`;
    const fileName = `${Date.now()}-${file.name}`; // previene colisiones
    const path     = `${folder}/${fileName}`;

    // 2️⃣ Sube el blob
    const { error: uploadErr } = await supabase
      .storage
      .from(this.BUCKET)
      .upload(path, file, { upsert: true });
      if (uploadErr) {
        throw new Error('Error subiendo documento: ' + uploadErr.message);
      }

    // 3️⃣ Obtén la URL pública
    const { data } = supabase
      .storage
      .from(this.BUCKET)
      .getPublicUrl(path);
      const publicUrl = data.publicUrl;
      if (!publicUrl) {
        throw new Error('No se obtuvo URL pública tras la subida.');
      }

    // 4️⃣ Actualiza el registro en la tabla
    const { error: updateErr } = await supabase
      .from(this.table)
      .update({ document_url: publicUrl })
      .eq('id', requestId);
      if (updateErr) {
        throw new Error('Error guardando URL en requests: ' + updateErr.message);
      }

      return publicUrl;
  }
}
