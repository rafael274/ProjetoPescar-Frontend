import { Routes } from '@angular/router';
import { TelaLogin } from './pages/tela-login/tela-login';
import { TelaHome } from './pages/tela-home/tela-home';
import { TelaEstoque } from './pages/tela-estoque/tela-estoque';
import { AuthGuard } from '../guards/auth.guard';
import { TelaCadastrarMaterial } from './pages/tela-cadastrar-material/tela-cadastrar-material';
import { TelaMovimentacao } from './pages/tela-movimentacao/tela-movimentacao';
import { TelaEditarMaterial } from './pages/tela-editar-material/tela-editar-material';
import { TelaUsuario } from './pages/tela-usuario/tela-usuario';
import { TelaRelatorio } from './pages/tela-relatorio/tela-relatorio';
import { TelaEditarUsuario } from './pages/tela-editar-usuario/tela-editar-usuario';

export const routes: Routes = [
  { path: '', component: TelaLogin, pathMatch: 'full' }, // Página inicial é o login
  { path: 'login', component: TelaLogin }, // Também acessível por /login
  { path: 'home', component: TelaHome, canActivate: [AuthGuard] }, // Página inicial após login
  { path: 'estoque', component: TelaEstoque, canActivate: [AuthGuard] }, // Página de controle de estoque
  { path: 'cadastrar-material', component: TelaCadastrarMaterial, canActivate: [AuthGuard] }, // Página de cadastro de material
  { path: 'movimentacao', component: TelaMovimentacao, canActivate: [AuthGuard] }, // Página de movimentação
  { path: 'editar-material' , component: TelaEditarMaterial, canActivate: [AuthGuard] }, // Reutiliza TelaEstoque para edição
  { path: 'usuario', component: TelaUsuario, canActivate: [AuthGuard] }, // Página de usuário
  { path: 'relatorio', component: TelaRelatorio, canActivate: [AuthGuard] }, // Página de relatórios
  { path: 'editar-usuario', component: TelaEditarUsuario, canActivate: [AuthGuard] } // Página de edição de usuário
];
