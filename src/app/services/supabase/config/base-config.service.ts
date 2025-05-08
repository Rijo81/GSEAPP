// base-config.service.ts
import { BehaviorSubject } from 'rxjs';
import { supabase } from 'src/app/core/supabase.client';
import { ScreenSettings } from 'src/app/models/changed.models';

export abstract class BaseConfigService {
  protected abstract readonly table: string;
  protected readonly bucket = 'screen-config';

  private rowId: string | null = null;
  private imageSub = new BehaviorSubject<string>('assets/logo.png');
  private titleSub = new BehaviorSubject<string>('Bienvenido al Sistema');
  private textSub  = new BehaviorSubject<string>('Santo Domingo, RD');

  readonly image$ = this.imageSub.asObservable();
  readonly title$ = this.titleSub.asObservable();
  readonly text$  = this.textSub.asObservable();

  constructor() {
    this.load();
  }

  /** 1) Carga o crea la fila inicial en la tabla */
  private async load(): Promise<void> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(`Error cargando ${this.table}:`, error.message);
      return;
    }

    if (!data) {
      const { error: insErr } = await supabase
        .from(this.table)
        .insert({
          image: this.imageSub.value,
          title: this.titleSub.value,
          text: this.textSub.value
        });
      if (insErr) console.error(`Error insertando ${this.table}:`, insErr.message);
      else await this.load();
      return;
    }

    this.rowId = data.id!;
    this.imageSub.next(data.image ?? this.imageSub.value);
    this.titleSub.next(data.title ?? this.titleSub.value);
    this.textSub.next(data.text ?? this.textSub.value);
  }

  /** 2) Upsertea la tabla con un campo o varios campos */
  private async upsert(updates: Partial<ScreenSettings>) {
    if (!this.rowId) {
      console.error(`No hay rowId para ${this.table}`);
      return;
    }
    const payload = { id: this.rowId, ...updates };
    const { error } = await supabase
      .from(this.table)
      .upsert(payload, { onConflict: 'id' });
    if (error) console.error(`Error guardando ${this.table}:`, error.message);
  }

  /** Cambia solo el título */
  async changeTitle(newTitle: string) {
    this.titleSub.next(newTitle);
    await this.upsert({ title: newTitle });
  }

  /** Cambia solo el texto */
  async changeText(newText: string) {
    this.textSub.next(newText);
    await this.upsert({ text: newText });
  }

  /** Convierte Base64 a Blob, lo sube y guarda la URL en la tabla */
  async changeImageBase64(base64: string, ext: string) {
    if (!this.rowId) {
      console.error(`No hay rowId para ${this.table}`);
      return;
    }

    // a) Blob desde base64
    const dataUrl = `data:image/${ext};base64,${base64}`;
    const blob    = await (await fetch(dataUrl)).blob();

    // b) Path dinámico por tabla + fila
    const path = `${this.table}/${this.rowId}.${ext}`;

    // c) Upload
    const { error: uploadErr } = await supabase
      .storage
      .from(this.bucket)
      .upload(path, blob, { upsert: true });
    if (uploadErr) {
      console.error(`Error subiendo imagen a ${this.bucket}:`, uploadErr.message);
      return;
    }

    // d) URL pública
    const { data } = supabase
      .storage
      .from(this.bucket)
      .getPublicUrl(path);
    const publicUrl = data.publicUrl;
    if (!publicUrl) {
      console.error('No se obtuvo URL pública tras la subida.');
      return;
    }

    // e) Emitir y guardar
    this.imageSub.next(publicUrl);
    await this.upsert({ image: publicUrl });
  }
}
