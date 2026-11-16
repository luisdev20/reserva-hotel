import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="not-found">
      <div class="wrap not-found-inner">
        <span class="code">404</span>
        <h1>Página no encontrada</h1>
        <p>La ruta que intentaste abrir no existe o fue movida.</p>
        <a routerLink="/" class="btn btn-gold">
          <i class="fa-solid fa-arrow-left"></i>
          Volver al catálogo
        </a>
      </div>
    </section>
  `,
  styles: [`
    .not-found {
      min-height: calc(100vh - 220px);
      display: flex;
      align-items: center;
      background: var(--cream);
    }
    .not-found-inner {
      text-align: center;
      padding: 60px 20px;
    }
    .code {
      display: block;
      font-family: var(--serif);
      font-size: 72px;
      line-height: 1;
      color: var(--gold);
      margin-bottom: 10px;
    }
    .not-found p {
      color: var(--ink-soft);
      margin: 10px 0 24px;
    }
  `]
})
export class NotFoundComponent {}
