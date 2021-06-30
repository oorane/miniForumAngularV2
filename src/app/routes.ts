import { Routes } from '@angular/router';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ManagementUserComponent } from './components/management-user/management-user.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { TopicComponent } from './components/topic/topic.component';
import { EditUserGuard } from './guards/edit-user.guard';

export const routes: Routes = [
    { path: '', component: HomepageComponent },
    { path: 'sign-in', component: SignInComponent },
    { path: 'login', component: LoginComponent },
    { path: 'edit-user', canActivate: [EditUserGuard], component: EditUserComponent },
    { path: 'topic/:id', component: TopicComponent },
    { path: 'users', component: ManagementUserComponent },
    { path: 'logout', component: LogoutComponent }
];