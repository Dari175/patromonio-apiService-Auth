/**
 * scripts/seed.js
 *
 * Seed actualizado con:
 * - Roles con permisos
 * - ADMIN como rol principal
 * - Niveles
 */

require('dotenv').config();

const mongoose      = require('mongoose');
const { connectDB } = require('../src/config/database');
const Role          = require('../src/models/Role');
const User          = require('../src/models/User');

// 🔥 ROLES ACTUALIZADOS
const ROLES_INICIALES = [
  {
    nombre: 'ADMIN',
    descripcion: 'Acceso total al sistema',
    nivel: 1,
    permisos: [
      { modulo: 'usuarios', acciones: ['crear','leer','editar','eliminar'] },
      { modulo: 'roles', acciones: ['crear','leer','editar','eliminar'] },
      { modulo: 'bienes', acciones: ['crear','leer','editar','eliminar'] },
      { modulo: 'importador', acciones: ['crear','leer'] }
    ]
  },
  {
    nombre: 'COORDINADOR',
    descripcion: 'Gestión operativa',
    nivel: 2,
    permisos: [
      { modulo: 'usuarios', acciones: ['leer'] },
      { modulo: 'roles', acciones: ['leer'] },
      { modulo: 'bienes', acciones: ['crear','leer','editar'] }
    ]
  },
  {
    nombre: 'AUXILIAR',
    descripcion: 'Operación básica',
    nivel: 3,
    permisos: [
      { modulo: 'bienes', acciones: ['leer'] }
    ]
  }
];

async function seed() {
  await connectDB();
  console.log('\n🌱 Iniciando seed...\n');

  // ── Crear roles ─────────────────────────────────────────
  for (const datos of ROLES_INICIALES) {
    const existe = await Role.findOne({ nombre: datos.nombre });

    if (existe) {
      console.log(`⚠️ Rol ya existe: ${datos.nombre} → actualizando permisos...`);

      // 🔥 ACTUALIZA permisos y nivel si ya existe
      existe.descripcion = datos.descripcion;
      existe.nivel = datos.nivel;
      existe.permisos = datos.permisos;

      await existe.save();
      continue;
    }

    await Role.create(datos);
    console.log(`✅ Rol creado: ${datos.nombre}`);
  }

  // ── Crear usuario admin ─────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@empresa.com';
  const adminPass  = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
  const adminName  = process.env.SEED_ADMIN_NAME || 'Administrador';

  const rolAdmin = await Role.findOne({ nombre: 'ADMIN' });

  const existeAdmin = await User.findOne({ email: adminEmail });

  if (existeAdmin) {
    console.log(`\n⚠️ Usuario admin ya existe: ${adminEmail}`);
  } else {
    await User.create({
      nombre: adminName,
      email: adminEmail,
      password: adminPass,
      roles: [rolAdmin._id],
      estado: 'ALTA',
      historialEstado: [
        { estado: 'ALTA', motivo: 'Seed inicial ADMIN' }
      ]
    });

    console.log(`\n✅ Admin creado: ${adminEmail} / ${adminPass}`);
    console.log('⚠️ Cambia la contraseña después del primer login\n');
  }

  console.log('\n🏁 Seed completado.\n');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});