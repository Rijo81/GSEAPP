import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { supabase } from 'src/app/core/supabase.client';
import { ScreenSettings } from 'src/app/models/changed.models';

@Injectable({
  providedIn: 'root'
})
export class ConfigScreenRequestsService {

    private readonly TABLE = 'screen-two';       // tu tabla
    private readonly BUCKET = 'screen-config'; // tu bucket Storage

    private rowId: string | null = null;
    private imageSub = new BehaviorSubject<string>('assets/logo.png');
    private titleSub = new BehaviorSubject<string>('Bienvenido al Sistema');
    private textSub  = new BehaviorSubject<string>('Santo Domingo, RD');

    image$ = this.imageSub.asObservable();
    title$ = this.titleSub.asObservable();
    text$  = this.textSub.asObservable();

    constructor() {
      this.load();
    }

    private async load(): Promise<void> {
      const { data, error } = await supabase
        .from(this.TABLE)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error cargando configuración:', error.message);
        return;
      }

      if (!data) {
        // Inserta fila inicial con defaults en la tabla
        const { error: insErr } = await supabase
          .from(this.TABLE)
          .insert({
            image: 'assets/logo.png',
            title: 'Bienvenido al Sistema',
            text:  'Santo Domingo, RD'
          });
        if (insErr) {
          console.error('Error insertando configuración inicial:', insErr.message);
          return;
        }
        return this.load();
      }

      // Guarda el ID para futuros updates
      this.rowId = data.id;

      // Emite los valores, usando fallback si algún campo es null
      this.imageSub.next(data.image ?? 'assets/logo.png');
      this.titleSub.next(data.title ?? 'Bienvenido al Sistema');
      this.textSub.next(data.text  ?? 'Santo Domingo, RD');
    }

    private async update(updates: Partial<ScreenSettings>) {
      if (!this.rowId) {
        console.error('No hay rowId para actualizar.');
        return;
      }
      const payload = { id: this.rowId, ...updates };
      const { error } = await supabase
        .from(this.TABLE)
        .upsert(payload, { onConflict: 'id' });
      if (error) console.error('Error guardando configuración:', error.message);
    }

    // ——— Métodos públicos ———

    /** Sube el archivo al bucket y guarda la URL en la tabla */
    async changeImageBase64(base64: string, ext: string): Promise<void> {
      if (!this.rowId) {
        console.error('No hay rowId para actualizar.');
        return;
      }

      try {
        // 1) Convierte Base64 a Blob
        const dataUrl = `data:image/${ext};base64,${base64}`;
        const blob   = await (await fetch(dataUrl)).blob();

        // 2) Define un path con subcarpeta 'images/'
        const fileName = `images/${this.rowId}.${ext}`;

        // 3) Sube al bucket
        const { error: uploadErr } = await supabase
          .storage
          .from(this.BUCKET)
          .upload(fileName, blob, { upsert: true });

        if (uploadErr) {
          throw new Error('Error subiendo imagen: ' + uploadErr.message);
        }
        console.log(`✅ Imagen subida a '${fileName}'`);

        // 4) Lista el contenido para verificar
        const { data: listData, error: listErr } = await supabase
          .storage
          .from(this.BUCKET)
          .list('images', { limit: 100 });
        if (listErr) {
          console.warn('No pude listar el bucket:', listErr.message);
        } else {
          console.log('📂 Archivos en images/:', listData);
        }

        // 5) Obtén la URL pública
        const { data: { publicUrl } } = supabase
          .storage
          .from(this.BUCKET)
          .getPublicUrl(fileName);

        if (!publicUrl) {
          throw new Error('No se obtuvo URL pública tras la subida.');
        }
        console.log('🌐 Public URL:', publicUrl);

        // 6) Emite y guarda en la tabla
        this.imageSub.next(publicUrl);
        await this.update({ image: publicUrl });

      } catch (err: any) {
        console.error('changeImageBase64 falló:', err.message || err);
      }
    }
    /** Cambia solo la URL (si ya la tienes), sin subir archivo */
    changeImageUrl(url: string) {
      this.imageSub.next(url);
      this.update({ image: url });
    }
    changeTitle(newTitle: string) {
      this.titleSub.next(newTitle);
      this.update({ title: newTitle });
    }
    changeText(newText: string) {
      this.textSub.next(newText);
      this.update({ text: newText });
    }
}
