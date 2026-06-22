import { Router } from 'express';
import {
  listUsers, getUser, updateUser, deleteUser,
  listEmployees, createEmployee, updateEmployee, deleteEmployee,
} from '../controllers/users.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { adminOnly, staffOnly } from '../middlewares/role.middleware.js';

const router = Router();
router.use(authRequired);

// Clientes: ver (admin y empleado), editar/eliminar (solo admin)
router.get('/users', staffOnly, listUsers);
router.get('/users/:id', staffOnly, getUser);
router.put('/users/:id', adminOnly, updateUser);
router.delete('/users/:id', adminOnly, deleteUser);

// Empleados: SOLO admin/dueño
router.get('/employees', adminOnly, listEmployees);
router.post('/employees', adminOnly, createEmployee);
router.put('/employees/:id', adminOnly, updateEmployee);
router.delete('/employees/:id', adminOnly, deleteEmployee);

export default router;
