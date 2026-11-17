import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Hito {
  anio: string;
  titulo: string;
  texto: string;
}

interface FotoHistoria {
  src: string;
  alt: string;
  leyenda: string;
}

@Component({
  selector: 'app-nosotros',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nosotros.component.html',
  styleUrl: './nosotros.component.css'
})
export class NosotrosComponent {
  readonly hitos: Hito[] = [
    {
      anio: '1978',
      titulo: 'La primera habitación',
      texto:
        'Doña Rosa Quispe acondicionó dos cuartos de su casa de adobe para recibir a viajeros que cruzaban la cordillera. Ella cocinaba, tendía las camas y despedía a cada huésped en la puerta.'
    },
    {
      anio: '1989',
      titulo: 'La mesa familiar',
      texto:
        'La posada creció a seis habitaciones. La cocina de Doña Rosa se volvió el corazón del negocio: sopa de quinua, pan de casa y conversaciones que duraban hasta la madrugada.'
    },
    {
      anio: '2001',
      titulo: 'El spa de altura',
      texto:
        'Sus hijos abrieron un pequeño espacio de bienestar junto a las aguas termales de la zona. La promesa seguía siendo la misma: descansar como en casa, pero con la montaña como testigo.'
    },
    {
      anio: '2015',
      titulo: 'Cuatro sedes',
      texto:
        'La familia amplió la propuesta a cuatro sedes en la cordillera. Cada una conservó el nombre, los textiles y las recetas de la casa original.'
    },
    {
      anio: '2026',
      titulo: 'La tercera generación',
      texto:
        'Hoy los nietos de Doña Rosa gestionan las reservas en línea sin perder lo que aprendieron de ella: recibir a cada persona con tiempo, nombre y una taza de té caliente.'
    }
  ];

  readonly fotos: FotoHistoria[] = [
    {
      src: 'assets/img/historia/historia-1.svg',
      alt: 'Casa de adobe rodeada de montañas',
      leyenda: 'La casa original de Doña Rosa, 1978.'
    },
    {
      src: 'assets/img/historia/historia-2.svg',
      alt: 'Mesa familiar con los primeros huéspedes',
      leyenda: 'La primera mesa compartida con huéspedes, 1985.'
    },
    {
      src: 'assets/img/historia/historia-3.svg',
      alt: 'Ampliación de la posada en la montaña',
      leyenda: 'La ampliación de la posada, 1996.'
    },
    {
      src: 'assets/img/historia/historia-4.svg',
      alt: 'Fachada actual del hotel Andes Suites',
      leyenda: 'El hotel en la actualidad, 2026.'
    }
  ];

  readonly valores = [
    {
      icono: 'fa-house',
      titulo: 'Hospitalidad de casa',
      texto: 'Cada huésped tiene un nombre, una historia y una taza de té esperándolo.'
    },
    {
      icono: 'fa-mountain',
      titulo: 'Respeto por la montaña',
      texto: 'Trabajamos con proveedores locales y cuidamos el agua y los senderos de la zona.'
    },
    {
      icono: 'fa-utensils',
      titulo: 'Cocina con memoria',
      texto: 'Las recetas de Doña Rosa siguen en la carta, con productos de la cordillera.'
    },
    {
      icono: 'fa-people-group',
      titulo: 'Trabajo en familia',
      texto: 'Tres generaciones y un equipo local que hace posible cada temporada.'
    }
  ];
}
