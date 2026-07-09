-- ═══════════════════════════════════════════════════════════════════════════
-- BarberPro Studio — Seed de datos demo
-- Ejecutar DESPUES de 001_initial_schema.sql y policies.sql
--
-- La barberia demo usa un UUID fijo para poder referenciarla desde
-- NEXT_PUBLIC_BARBERIA_ID en .env.local
-- ═══════════════════════════════════════════════════════════════════════════

-- IDs fijos reutilizables
-- Barberia demo: 00000000-0000-0000-0000-000000000001

-- ── Barberia + configuracion ────────────────────────────────────────────────
insert into barberias (id, nombre, slug, estado)
values ('00000000-0000-0000-0000-000000000001', 'BarberPro Studio', 'barberpro-studio', 'activo')
on conflict (id) do nothing;

insert into configuracion_barberia (
  barberia_id, nombre_comercial, eslogan, descripcion,
  color_primario, color_secundario, color_acento,
  hero_imagen_url,
  direccion, ciudad, telefono, whatsapp, correo,
  instagram, facebook, tiktok, google_maps_url,
  landing_titulo, landing_subtitulo, landing_por_que_texto,
  reserva_automatica, anticipacion_minima_min, cancelacion_horas,
  horarios
) values (
  '00000000-0000-0000-0000-000000000001',
  'BarberPro Studio',
  'Estilo, precision y actitud.',
  'Barberia premium donde el arte del corte se encuentra con la experiencia. Barberos expertos, ambiente urbano y atencion de primera.',
  '#c8963e', '#1a1a1a', '#e0b862',
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1600&q=80',
  'Cra 45 #23-10, Local 3', 'Medellin', '+57 604 000 0000', '+573000000000', 'hola@barberpro.studio',
  'https://instagram.com/barberpro', 'https://facebook.com/barberpro', 'https://tiktok.com/@barberpro',
  'https://maps.google.com/?q=Medellin',
  'Donde tu estilo cobra vida',
  'Reserva tu cita en segundos y vive la experiencia de una barberia premium.',
  'Barberos certificados, productos de alta gama y un ambiente pensado para que salgas renovado.',
  false, 60, 4,
  '{
    "lunes":    {"abre":"09:00","cierra":"19:00","cerrado":false},
    "martes":   {"abre":"09:00","cierra":"19:00","cerrado":false},
    "miercoles":{"abre":"09:00","cierra":"19:00","cerrado":false},
    "jueves":   {"abre":"09:00","cierra":"20:00","cerrado":false},
    "viernes":  {"abre":"09:00","cierra":"20:00","cerrado":false},
    "sabado":   {"abre":"08:00","cierra":"18:00","cerrado":false},
    "domingo":  {"abre":"10:00","cierra":"14:00","cerrado":true}
  }'::jsonb
) on conflict (barberia_id) do nothing;

-- ── Roles ───────────────────────────────────────────────────────────────────
insert into roles (id, barberia_id, clave, nombre, descripcion, es_sistema) values
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','superadmin','Superadmin / Dueño','Acceso total',true),
  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','admin','Administrador','Operacion general',true),
  ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','barbero','Barbero','Su agenda y comisiones',true),
  ('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','recepcionista','Recepcionista','Reservas, clientes y caja',true),
  ('10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','cliente','Cliente','Sus reservas',true)
on conflict (barberia_id, clave) do nothing;

-- ── Permisos base ───────────────────────────────────────────────────────────
insert into permisos (clave, modulo, descripcion) values
  ('dashboard.ver','dashboard','Ver dashboard'),
  ('reservas.ver','reservas','Ver reservas'),
  ('reservas.crear','reservas','Crear reservas'),
  ('reservas.editar','reservas','Editar reservas'),
  ('reservas.eliminar','reservas','Eliminar reservas'),
  ('agenda.ver','agenda','Ver agenda'),
  ('clientes.ver','clientes','Ver clientes'),
  ('clientes.gestionar','clientes','Gestionar clientes'),
  ('servicios.gestionar','servicios','Gestionar servicios'),
  ('barberos.gestionar','barberos','Gestionar barberos'),
  ('finanzas.ver','finanzas','Ver finanzas'),
  ('finanzas.gestionar','finanzas','Gestionar finanzas'),
  ('caja.gestionar','caja','Gestionar caja'),
  ('inventario.gestionar','inventario','Gestionar inventario'),
  ('ventas.gestionar','ventas','Gestionar ventas'),
  ('promociones.gestionar','promociones','Gestionar promociones'),
  ('galeria.gestionar','galeria','Gestionar galeria'),
  ('testimonios.gestionar','testimonios','Gestionar testimonios'),
  ('reportes.ver','reportes','Ver reportes'),
  ('configuracion.gestionar','configuracion','Gestionar configuracion'),
  ('usuarios.gestionar','usuarios','Gestionar usuarios')
on conflict (clave) do nothing;

-- ── Categorias de servicios ─────────────────────────────────────────────────
insert into categorias_servicios (id, barberia_id, nombre, slug, orden) values
  ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Cortes','cortes',1),
  ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Barba','barba',2),
  ('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Combos','combos',3),
  ('20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','Tratamientos','tratamientos',4),
  ('20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','Color','color',5)
on conflict do nothing;

-- ── Servicios ───────────────────────────────────────────────────────────────
insert into servicios (id, barberia_id, categoria_id, nombre, descripcion, precio, duracion_min, imagen_url, comision_sugerida, destacado, orden) values
  ('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Corte Clasico','Corte tradicional a tijera y maquina, acabado limpio.',25000,30,'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',40,true,1),
  ('30000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Corte Moderno','Fade, texturizado y estilo a la moda.',30000,40,'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',40,true,2),
  ('30000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Corte Urbano','Diseños, lineas y estilo callejero.',35000,45,'https://images.unsplash.com/photo-1521490878406-4f45a1de1f92?auto=format&fit=crop&w=800&q=80',45,false,3),
  ('30000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','Perfilado de Barba','Arreglo, perfilado y toalla caliente.',18000,25,'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=800&q=80',40,true,4),
  ('30000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','Corte + Barba','Combo completo, el favorito de la casa.',40000,60,'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',45,true,5),
  ('30000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004','Limpieza Facial','Exfoliacion y cuidado facial masculino.',35000,40,'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',35,false,6),
  ('30000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000005','Tintura','Color y cobertura de canas.',45000,60,'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=800&q=80',35,false,7),
  ('30000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Cejas','Perfilado de cejas masculino.',10000,15,'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',40,false,8)
on conflict do nothing;

-- ── Barberos ────────────────────────────────────────────────────────────────
insert into barberos (id, barberia_id, nombre, foto_url, celular, especialidad, descripcion, experiencia, porcentaje_comision, salario_base, fecha_ingreso, valoracion, destacado, orden) values
  ('40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Andres "El Maestro" Ruiz','https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80','+573001112233','Fades y diseños','Especialista en degradados y estilos urbanos.','8 años',45,1300000,'2021-03-15',4.9,true,1),
  ('40000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Camilo Torres','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80','+573004445566','Barba y clasico','Amante del estilo clasico y la barba perfecta.','5 años',40,1200000,'2022-06-01',4.8,true,2),
  ('40000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Sebastian Gomez','https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80','+573007778899','Color y tratamientos','Colorista y experto en cuidado capilar.','4 años',40,1150000,'2023-01-10',4.7,false,3)
on conflict do nothing;

-- barbero_servicios (todos hacen cortes y combos; especializaciones)
insert into barbero_servicios (barbero_id, servicio_id)
select b.id, s.id
from barberos b cross join servicios s
where b.barberia_id = '00000000-0000-0000-0000-000000000001'
  and s.barberia_id = '00000000-0000-0000-0000-000000000001'
on conflict do nothing;

-- Horarios (lunes a sabado 9-19) para cada barbero
insert into horarios_barberos (barberia_id, barbero_id, dia_semana, hora_inicio, hora_fin)
select '00000000-0000-0000-0000-000000000001', b.id, d, '09:00', '19:00'
from barberos b, generate_series(1,6) d
where b.barberia_id = '00000000-0000-0000-0000-000000000001'
on conflict do nothing;

-- ── Clientes ────────────────────────────────────────────────────────────────
insert into clientes (id, barberia_id, nombre, celular, correo, segmento, total_gastado, numero_visitas, ultima_visita) values
  ('50000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Juan Perez','+573101234567','juan@example.com','frecuente',280000,9, now() - interval '5 days'),
  ('50000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Carlos Mejia','+573112345678','carlos@example.com','activo',90000,3, now() - interval '20 days'),
  ('50000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Miguel Angel','+573123456789',null,'inactivo',50000,2, now() - interval '95 days')
on conflict do nothing;

-- ── Reservas demo (hoy y proximas) ──────────────────────────────────────────
insert into reservas (barberia_id, cliente_id, barbero_id, servicio_id, cliente_nombre, cliente_celular, fecha, hora_inicio, hora_fin, precio, estado, metodo_pago, origen) values
  ('00000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000005','Juan Perez','+573101234567',current_date, now() + interval '2 hours', now() + interval '3 hours',40000,'confirmada','efectivo','publico'),
  ('00000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','Carlos Mejia','+573112345678',current_date, now() + interval '4 hours', now() + interval '4 hours 30 minutes',25000,'pendiente',null,'publico'),
  ('00000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','Juan Perez','+573101234567',current_date - 3, now() - interval '3 days', now() - interval '3 days' + interval '40 minutes',30000,'completada','nequi','publico')
on conflict do nothing;

-- ── Inventario ──────────────────────────────────────────────────────────────
insert into categorias_productos (id, barberia_id, nombre) values
  ('60000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Ceras'),
  ('60000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Cuidado'),
  ('60000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Herramientas')
on conflict do nothing;

insert into productos (id, barberia_id, categoria_id, nombre, descripcion, unidad_medida, stock_actual, stock_minimo, precio_compra, precio_venta, es_vendible) values
  ('70000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001','Cera Mate Premium','Fijacion fuerte, acabado mate.','unidad',24,8,12000,25000,true),
  ('70000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000002','Shampoo Anticaspa','Uso profesional 500ml.','unidad',5,6,18000,32000,true),
  ('70000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000003','Cuchillas','Caja x100.','caja',3,5,20000,null,false)
on conflict do nothing;

-- ── Categorias financieras ──────────────────────────────────────────────────
insert into categorias_financieras (barberia_id, nombre, tipo, es_sistema) values
  ('00000000-0000-0000-0000-000000000001','Servicios','ingreso',true),
  ('00000000-0000-0000-0000-000000000001','Venta de productos','ingreso',true),
  ('00000000-0000-0000-0000-000000000001','Arriendo','gasto',false),
  ('00000000-0000-0000-0000-000000000001','Servicios publicos','gasto',false),
  ('00000000-0000-0000-0000-000000000001','Insumos','gasto',false),
  ('00000000-0000-0000-0000-000000000001','Nomina','gasto',false),
  ('00000000-0000-0000-0000-000000000001','Publicidad','gasto',false)
on conflict do nothing;

-- ── Movimientos financieros demo ────────────────────────────────────────────
insert into finanzas_movimientos (barberia_id, tipo, concepto, monto, metodo_pago, fecha) values
  ('00000000-0000-0000-0000-000000000001','ingreso','Servicio corte + barba',40000,'efectivo',current_date),
  ('00000000-0000-0000-0000-000000000001','ingreso','Venta cera',25000,'nequi',current_date),
  ('00000000-0000-0000-0000-000000000001','gasto','Pago arriendo',900000,'transferencia',current_date - 2),
  ('00000000-0000-0000-0000-000000000001','gasto','Compra insumos',150000,'efectivo',current_date - 1)
on conflict do nothing;

-- ── Promociones ─────────────────────────────────────────────────────────────
insert into promociones (id, barberia_id, nombre, descripcion, imagen_url, precio_anterior, precio_promocional, fecha_inicio, fecha_fin, mostrar_landing) values
  ('80000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Combo Fin de Semana','Corte + barba + cejas a precio especial.','https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80',50000,39000,current_date, current_date + 30, true)
on conflict do nothing;

insert into promocion_servicios (promocion_id, servicio_id) values
  ('80000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000005'),
  ('80000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000008')
on conflict do nothing;

-- ── Galeria ─────────────────────────────────────────────────────────────────
insert into galeria (barberia_id, titulo, imagen_url, categoria, destacada, visible, orden) values
  ('00000000-0000-0000-0000-000000000001','Fade clasico','https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80','cortes',true,true,1),
  ('00000000-0000-0000-0000-000000000001','Barba perfilada','https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=800&q=80','barbas',false,true,2),
  ('00000000-0000-0000-0000-000000000001','Estilo urbano','https://images.unsplash.com/photo-1521490878406-4f45a1de1f92?auto=format&fit=crop&w=800&q=80','cortes',false,true,3),
  ('00000000-0000-0000-0000-000000000001','Ambiente','https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80','estilo',false,true,4)
on conflict do nothing;

-- ── Testimonios ─────────────────────────────────────────────────────────────
insert into testimonios (barberia_id, nombre_cliente, comentario, calificacion, visible, orden) values
  ('00000000-0000-0000-0000-000000000001','Juan P.','El mejor corte que me han hecho. Ambiente top y atencion 10/10.',5,true,1),
  ('00000000-0000-0000-0000-000000000001','Carlos M.','Andres es un crack con los fades. Volvere sin duda.',5,true,2),
  ('00000000-0000-0000-0000-000000000001','Miguel A.','Puntuales, profesionales y buen precio.',4,true,3)
on conflict do nothing;

-- Fin del seed
-- ─────────────────────────────────────────────────────────────
-- NOTA sobre usuarios/auth:
-- Los usuarios de Supabase Auth se crean desde el panel de Supabase o via
-- Route Handler /api/usuarios (service role). Luego se vincula su perfil:
--
--   insert into perfiles_usuario (auth_user_id, barberia_id, rol_id, nombre, correo)
--   values ('<auth-uid>', '00000000-0000-0000-0000-000000000001',
--           '10000000-0000-0000-0000-000000000001', 'Dueño Demo', 'dueno@barberpro.studio');
-- ─────────────────────────────────────────────────────────────
