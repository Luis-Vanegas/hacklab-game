# Informe de Lighthouse — Fase 2

Medido el 2026-11-19 con Lighthouse 12 sobre el build de producción (`npm run build` + `vite preview`), en Chrome sin interfaz.

| Categoría        | Escritorio | Celular |
| ---------------- | ---------- | ------- |
| Rendimiento      | 100        | 98      |
| Accesibilidad    | 100        | 100     |
| Buenas prácticas | 100        | 100     |
| SEO              | 100        | 100     |

| Métrica                  | Escritorio | Celular |
| ------------------------ | ---------- | ------- |
| First Contentful Paint   | 0,4 s      | 1,8 s   |
| Largest Contentful Paint | 0,4 s      | 1,8 s   |
| Total Blocking Time      | 0 ms       | 0 ms    |
| Cumulative Layout Shift  | 0,001      | 0,002   |

**Alcance:** Lighthouse mide la carga inicial (pantalla de título). La oficina 3D se carga aparte, con `lazy`, cuando el jugador entra; por eso no afecta estos números.

**Cómo repetirlo:**

```powershell
npm run build
npx vite preview --port 4180
npx lighthouse@12 http://localhost:4180 --preset=desktop --view
```
